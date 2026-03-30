require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("node:fs/promises");
const path = require("node:path");
const User = require("./models/User");
const Fighter = require("./models/Fighter");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5053;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ufc_mobile";
const JWT_SECRET = process.env.JWT_SECRET || "ufc-local-jwt-secret";
const UFC_ROSTER_API_URL = process.env.UFC_ROSTER_API_URL || "";
const UFC_ROSTER_DATASET_PATH =
  process.env.UFC_ROSTER_DATASET_PATH ||
  path.join(__dirname, "data", "ufc_master_data.csv");
const UFC_ROSTER_SYNC_ENABLED = process.env.UFC_ROSTER_SYNC_ENABLED === "true";
const UFC_ROSTER_SYNC_INTERVAL_MINUTES = Math.max(
  1,
  Number(process.env.UFC_ROSTER_SYNC_INTERVAL_MINUTES || 360),
);

app.use(cors());
app.use(express.json());

function normalizeRosterPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.fighters)) return payload.fighters;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  out.push(current);
  return out.map((value) => value.trim());
}

function parseCsv(content) {
  const lines = String(content || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const fields = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = fields[index] ?? "";
    });
    return row;
  });
}

async function loadRosterFromDatasetFile() {
  const resolvedPath = path.resolve(UFC_ROSTER_DATASET_PATH);
  const content = await fs.readFile(resolvedPath, "utf8");
  return parseCsv(content);
}

function mapRosterFighter(raw) {
  const wins = Number(raw?.record?.wins ?? raw?.wins ?? 0);
  const losses = Number(raw?.record?.losses ?? raw?.losses ?? 0);
  const age = Number(raw?.age ?? 0);
  const weight = String(raw?.weight || raw?.weight_class || "").trim();
  const name = String(raw?.name || "").trim();
  const region = String(raw?.region || raw?.country || raw?.location || "Unknown").trim();
  const league = String(raw?.league || raw?.division || (weight ? `${weight} lbs` : "UFC")).trim();

  if (!name) return null;

  return {
    name,
    age: Number.isFinite(age) ? age : 0,
    region: region || "Unknown",
    league: league || "UFC",
    externalId: String(raw?._id || raw?.id || raw?.fighterId || "").trim(),
    source: "ufc-api",
    record: {
      wins: Number.isFinite(wins) ? wins : 0,
      losses: Number.isFinite(losses) ? losses : 0,
    },
  };
}

const syncState = {
  running: false,
  lastStartedAt: null,
  lastCompletedAt: null,
  lastRunSummary: null,
  lastError: "",
};

async function resolveRosterRows(rosterUrl, body) {
  if (Array.isArray(body?.fighters) && body.fighters.length > 0) {
    return body.fighters;
  }

  const normalizedUrl = String(rosterUrl || UFC_ROSTER_API_URL || "").trim();
  if (!normalizedUrl) {
    const rows = await loadRosterFromDatasetFile();
    if (!rows.length) {
      throw new Error(
        "No roster source configured and dataset file is empty. Provide fighters[], set UFC_ROSTER_API_URL, or set UFC_ROSTER_DATASET_PATH.",
      );
    }
    return rows;
  }

  if (normalizedUrl.toLowerCase().startsWith("dataset://")) {
    const rows = await loadRosterFromDatasetFile();
    if (!rows.length) {
      throw new Error("Dataset file returned no fighters.");
    }
    return rows;
  }

  const response = await fetch(normalizedUrl);
  if (!response.ok) {
    throw new Error(`Roster fetch failed: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const rows = normalizeRosterPayload(payload);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Roster source returned no fighters.");
  }

  return rows;
}

async function upsertRosterForOwner(ownerId, rosterRows) {
  const mapped = rosterRows.map(mapRosterFighter).filter(Boolean);
  let imported = 0;
  let updated = 0;

  for (const row of mapped) {
    const query = row.externalId
      ? { ownerId, externalId: row.externalId }
      : { ownerId, name: row.name, league: row.league };

    const existing = await Fighter.findOne(query);
    if (!existing) {
      await Fighter.create({ ...row, ownerId });
      imported += 1;
    } else {
      existing.name = row.name;
      existing.age = row.age;
      existing.region = row.region;
      existing.league = row.league;
      existing.record = row.record;
      existing.source = row.source;
      if (row.externalId) existing.externalId = row.externalId;
      await existing.save();
      updated += 1;
    }
  }

  return { imported, updated, mappedCount: mapped.length };
}

async function runAutoRosterSync() {
  if (syncState.running) {
    return { skipped: true, reason: "sync already in progress" };
  }

  syncState.running = true;
  syncState.lastStartedAt = new Date().toISOString();
  syncState.lastError = "";

  try {
    const rosterRows = await resolveRosterRows(UFC_ROSTER_API_URL, null);
    const owners = await Fighter.distinct("ownerId", { source: "ufc-api" });

    let imported = 0;
    let updated = 0;
    for (const ownerId of owners) {
      const result = await upsertRosterForOwner(ownerId, rosterRows);
      imported += result.imported;
      updated += result.updated;
    }

    syncState.lastCompletedAt = new Date().toISOString();
    syncState.lastRunSummary = {
      mode: "auto",
      ownersSynced: owners.length,
      totalReceived: rosterRows.length,
      imported,
      updated,
    };
    return { ok: true, ...syncState.lastRunSummary };
  } catch (error) {
    syncState.lastCompletedAt = new Date().toISOString();
    syncState.lastError = error.message || "Auto sync failed";
    syncState.lastRunSummary = null;
    return { ok: false, message: syncState.lastError };
  } finally {
    syncState.running = false;
  }
}

app.get("/api/v1/health", (_, res) => {
  res.json({ ok: true, service: "ufc-mobile-api" });
});

app.post("/api/v1/auth/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, age, country } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      password: hash,
      firstName: String(firstName || ""),
      lastName: String(lastName || ""),
      age: age ? Number(age) : null,
      country: String(country || ""),
    });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({ token });
  } catch (error) {
    console.error("Signup failed:", error.message);
    return res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/v1/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({ token });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/v1/fighters", auth, async (req, res) => {
  const fighters = await Fighter.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });
  res.json(fighters);
});

app.get("/api/v1/fighters/:id", auth, async (req, res) => {
  const fighter = await Fighter.findOne({ _id: req.params.id, ownerId: req.user.userId });
  if (!fighter) return res.status(404).json({ message: "Fighter not found" });
  res.json(fighter);
});

app.post("/api/v1/fighters", auth, async (req, res) => {
  try {
    const payload = req.body || {};
    const fighter = await Fighter.create({
      name: payload.name,
      age: Number(payload.age || 0),
      region: payload.region,
      league: payload.league,
      record: {
        wins: Number(payload.record?.wins || 0),
        losses: Number(payload.record?.losses || 0),
      },
      ownerId: req.user.userId,
    });
    res.status(201).json(fighter);
  } catch (error) {
    res.status(400).json({ message: "Invalid fighter payload" });
  }
});

app.post("/api/v1/fighters/import", auth, async (req, res) => {
  try {
    const body = req.body || {};
    const rosterUrl = String(body.rosterUrl || UFC_ROSTER_API_URL || "").trim();
    const rosterRows = await resolveRosterRows(rosterUrl, body);
    const { imported, updated } = await upsertRosterForOwner(req.user.userId, rosterRows);

    return res.json({
      ok: true,
      totalReceived: rosterRows.length,
      imported,
      updated,
    });
  } catch (error) {
    console.error("Roster import failed:", error.message);
    const knownInputError =
      error.message.includes("No roster source") ||
      error.message.includes("returned no fighters") ||
      error.message.includes("Roster fetch failed");
    return res.status(knownInputError ? 400 : 500).json({ message: error.message || "Roster import failed" });
  }
});

app.post("/api/v1/fighters/sync", auth, async (req, res) => {
  try {
    const body = req.body || {};
    const rosterUrl = String(body.rosterUrl || UFC_ROSTER_API_URL || "").trim();
    const rosterRows = await resolveRosterRows(rosterUrl, body);
    const { imported, updated } = await upsertRosterForOwner(req.user.userId, rosterRows);
    return res.json({
      ok: true,
      mode: "manual",
      totalReceived: rosterRows.length,
      imported,
      updated,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Roster sync failed" });
  }
});

app.get("/api/v1/fighters/sync/status", auth, async (req, res) => {
  return res.json({
    ok: true,
    autoSyncEnabled: UFC_ROSTER_SYNC_ENABLED,
    intervalMinutes: UFC_ROSTER_SYNC_INTERVAL_MINUTES,
    ...syncState,
  });
});

app.patch("/api/v1/fighters/:id", auth, async (req, res) => {
  const payload = req.body || {};
  const fighter = await Fighter.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.userId },
    {
      name: payload.name,
      age: Number(payload.age || 0),
      region: payload.region,
      league: payload.league,
      record: {
        wins: Number(payload.record?.wins || 0),
        losses: Number(payload.record?.losses || 0),
      },
    },
    { new: true, runValidators: true }
  );

  if (!fighter) return res.status(404).json({ message: "Fighter not found" });
  res.json(fighter);
});

app.delete("/api/v1/fighters/:id", auth, async (req, res) => {
  const fighter = await Fighter.findOneAndDelete({ _id: req.params.id, ownerId: req.user.userId });
  if (!fighter) return res.status(404).json({ message: "Fighter not found" });
  res.json({ ok: true });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`UFC mobile API running on port ${PORT}`);
      if (UFC_ROSTER_SYNC_ENABLED) {
        const intervalMs = UFC_ROSTER_SYNC_INTERVAL_MINUTES * 60 * 1000;
        setInterval(() => {
          runAutoRosterSync().then((result) => {
            if (result?.ok) {
              console.log(
                `[roster-sync] owners=${result.ownersSynced} imported=${result.imported} updated=${result.updated}`,
              );
            } else {
              console.error(`[roster-sync] failed: ${result?.message || "unknown error"}`);
            }
          });
        }, intervalMs);
        console.log(
          `[roster-sync] enabled. interval=${UFC_ROSTER_SYNC_INTERVAL_MINUTES} minutes`,
        );
      } else {
        console.log("[roster-sync] disabled. Set UFC_ROSTER_SYNC_ENABLED=true to enable.");
      }
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });
