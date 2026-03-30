import axios from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_UFC_API_URL || "http://localhost:5053/api/v1";

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getFighters(token) {
  const response = await axios.get(`${API_BASE_URL}/fighters`, {
    headers: authHeader(token),
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getFighterById(id, token) {
  const response = await axios.get(`${API_BASE_URL}/fighters/${id}`, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function createFighter(payload, token) {
  const response = await axios.post(`${API_BASE_URL}/fighters`, payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function updateFighter(id, payload, token) {
  const response = await axios.patch(`${API_BASE_URL}/fighters/${id}`, payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function removeFighter(id, token) {
  await axios.delete(`${API_BASE_URL}/fighters/${id}`, {
    headers: authHeader(token),
  });
  return { ok: true };
}

export async function importFightersFromRoster(token, rosterUrl) {
  const payload = rosterUrl ? { rosterUrl } : {};
  const response = await axios.post(`${API_BASE_URL}/fighters/sync`, payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function getRosterSyncStatus(token) {
  const response = await axios.get(`${API_BASE_URL}/fighters/sync/status`, {
    headers: authHeader(token),
  });
  return response.data;
}
