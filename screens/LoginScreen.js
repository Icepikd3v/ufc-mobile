// LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { login } from "../AuthServices";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigation.navigate("Home"); // Navigate to your main application screen
    } catch (error) {
      setError(
        `Login failed: ${error.response?.data?.message || "Please try again."}`,
      );
      console.error("Login failed:", error.response?.data);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>UFC Mobile Companion</Text>
        <Text style={styles.description}>
          Fighter tracking and CRUD operations from one streamlined mobile dashboard.
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#7f8fb2"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#7f8fb2"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupButtonText}>Create Live Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#070b19",
  },
  card: {
    borderWidth: 1,
    borderColor: "#2d3b63",
    borderRadius: 14,
    backgroundColor: "#101833",
    padding: 18,
  },
  title: {
    fontSize: 26,
    color: "#8fc1ff",
    marginBottom: 8,
    fontWeight: "bold",
  },
  description: {
    fontSize: 15,
    color: "#d7e4ff",
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderColor: "#39528f",
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#eef4ff",
    backgroundColor: "#111e41",
  },
  button: {
    backgroundColor: "#2f89ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupButton: {
    marginTop: 10,
    alignItems: "center",
  },
  signupButtonText: {
    color: "#93bfff",
    fontSize: 14,
    fontWeight: "700",
  },
  error: {
    color: "#ff9aa8",
    marginBottom: 12,
  },
});
