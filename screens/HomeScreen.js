// HomeScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getAuthEmail, logout } from "../AuthServices";

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const email = await getAuthEmail();
      setUser(email || "Authenticated User");
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Fight Ops Dashboard</Text>
        <Text style={styles.subtext}>Signed in as: {user}</Text>
        <Text style={[styles.modeTag, styles.modeLive]}>Live API Mode</Text>
        <Text style={styles.instruction}>
          Open the fighters dashboard to browse, add, edit, and remove records.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("FightersList")}
        >
          <Text style={styles.buttonText}>Open Fighters Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
          <Text style={styles.secondaryText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#070b19",
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#2d3b63",
    borderRadius: 14,
    backgroundColor: "#101833",
    padding: 18,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: "#8fc1ff",
    fontWeight: "bold",
  },
  subtext: {
    color: "#c9d9fa",
    marginBottom: 8,
  },
  modeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "700",
  },
  modeLive: {
    backgroundColor: "#1d2f66",
    color: "#bfd6ff",
  },
  instruction: {
    fontSize: 14,
    marginBottom: 18,
    color: "#d7e4ff",
  },
  button: {
    backgroundColor: "#2f89ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButton: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3f4f7a",
  },
  secondaryText: {
    color: "#c5d8ff",
    textAlign: "center",
    fontWeight: "700",
  },
});
