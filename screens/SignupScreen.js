// SignupScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { signup } from "../AuthServices";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    try {
      await signup(email, password, firstName, lastName, age, country);
      navigation.navigate("Home"); // Navigate to your main application screen
    } catch (error) {
      setError(
        `Signup failed: ${error.response?.data?.message || "Please try again."}`,
      );
      console.error("Signup failed:", error.response?.data);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Live Account</Text>
        <Text style={styles.subtitle}>Use this path for live backend authentication.</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#7e90b7"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#7e90b7"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="First Name"
          placeholderTextColor="#7e90b7"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <TextInput
          placeholder="Last Name"
          placeholderTextColor="#7e90b7"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <TextInput
          placeholder="Age"
          placeholderTextColor="#7e90b7"
          value={age}
          onChangeText={setAge}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Country"
          placeholderTextColor="#7e90b7"
          value={country}
          onChangeText={setCountry}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    fontSize: 24,
    color: "#8fc1ff",
    marginBottom: 6,
    fontWeight: "700",
  },
  subtitle: {
    color: "#c1d5ff",
    marginBottom: 12,
  },
  input: {
    height: 44,
    borderColor: "#39528f",
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 10,
    paddingLeft: 10,
    color: "#eef4ff",
    backgroundColor: "#111e41",
  },
  button: {
    marginTop: 4,
    backgroundColor: "#2f89ff",
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#ff9aa8",
    marginBottom: 10,
  },
});
