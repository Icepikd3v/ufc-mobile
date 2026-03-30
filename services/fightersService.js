import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://ufc-api-demo-e18d3cbd0a55.herokuapp.com/api/v1";
const DEMO_FIGHTERS_KEY = "demoFighters";

const defaultDemoFighters = [
  {
    _id: "demo-1",
    name: "Israel Adesanya",
    age: 35,
    region: "Nigeria/New Zealand",
    league: "UFC",
    record: { wins: 24, losses: 3 },
  },
  {
    _id: "demo-2",
    name: "Alex Pereira",
    age: 37,
    region: "Brazil",
    league: "UFC",
    record: { wins: 10, losses: 2 },
  },
  {
    _id: "demo-3",
    name: "Sean O'Malley",
    age: 30,
    region: "USA",
    league: "UFC",
    record: { wins: 18, losses: 2 },
  },
];

function randomId() {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function isDemoMode() {
  const mode = await AsyncStorage.getItem("authMode");
  return mode === "demo";
}

async function readDemoFighters() {
  const raw = await AsyncStorage.getItem(DEMO_FIGHTERS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(DEMO_FIGHTERS_KEY, JSON.stringify(defaultDemoFighters));
    return defaultDemoFighters;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultDemoFighters;
  } catch {
    return defaultDemoFighters;
  }
}

async function writeDemoFighters(fighters) {
  await AsyncStorage.setItem(DEMO_FIGHTERS_KEY, JSON.stringify(fighters));
}

export async function getFighters(token) {
  if (await isDemoMode()) {
    return readDemoFighters();
  }

  const response = await axios.get(`${API_BASE_URL}/fighters`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getFighterById(id, token) {
  if (await isDemoMode()) {
    const fighters = await readDemoFighters();
    return fighters.find((f) => f._id === id) || null;
  }

  const response = await axios.get(`${API_BASE_URL}/fighters/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function createFighter(payload, token) {
  if (await isDemoMode()) {
    const fighters = await readDemoFighters();
    const next = { ...payload, _id: randomId() };
    fighters.unshift(next);
    await writeDemoFighters(fighters);
    return next;
  }

  const response = await axios.post(`${API_BASE_URL}/fighters`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function updateFighter(id, payload, token) {
  if (await isDemoMode()) {
    const fighters = await readDemoFighters();
    const next = fighters.map((fighter) =>
      fighter._id === id ? { ...fighter, ...payload, _id: id } : fighter,
    );
    await writeDemoFighters(next);
    return next.find((f) => f._id === id) || null;
  }

  const response = await axios.patch(`${API_BASE_URL}/fighters/${id}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function removeFighter(id, token) {
  if (await isDemoMode()) {
    const fighters = await readDemoFighters();
    const next = fighters.filter((fighter) => fighter._id !== id);
    await writeDemoFighters(next);
    return { ok: true };
  }

  await axios.delete(`${API_BASE_URL}/fighters/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return { ok: true };
}
