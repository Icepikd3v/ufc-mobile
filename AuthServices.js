// authService.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_TOKEN } from "./constants/demoAuth";

const apiBaseUrl = "https://ufc-api-demo-e18d3cbd0a55.herokuapp.com/api/v1"; // Base URL with /api/v1

// Function to handle user signup
export const signup = async (
  email,
  password,
  firstName,
  lastName,
  age,
  country,
) => {
  try {
    const response = await axios.post(`${apiBaseUrl}/auth/signup`, {
      email,
      password,
      firstName,
      lastName,
      age,
      country,
    });
    const token = response.data.token; // Assuming the token is in response.data.token
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("authMode", "live");
    await AsyncStorage.setItem("authEmail", email);
    return token;
  } catch (error) {
    console.error("Signup failed:", error);
    throw error;
  }
};

// Function to handle user login
export const login = async (email, password) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
    await AsyncStorage.setItem("authToken", DEMO_TOKEN);
    await AsyncStorage.setItem("authMode", "demo");
    await AsyncStorage.setItem("authEmail", DEMO_EMAIL);
    return DEMO_TOKEN;
  }

  try {
    const response = await axios.post(`${apiBaseUrl}/auth/signin`, {
      email,
      password,
    });
    const token = response.data.token; // Assuming the token is in response.data.token
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("authMode", "live");
    await AsyncStorage.setItem("authEmail", normalizedEmail);
    return token;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Function to get token from AsyncStorage
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    return token;
  } catch (error) {
    console.error("Failed to get token:", error);
    throw error;
  }
};

export const getAuthMode = async () => {
  const mode = await AsyncStorage.getItem("authMode");
  return mode || "live";
};

export const getAuthEmail = async () => {
  const email = await AsyncStorage.getItem("authEmail");
  return email || "";
};

export const logout = async () => {
  await AsyncStorage.multiRemove(["authToken", "authMode", "authEmail"]);
};
