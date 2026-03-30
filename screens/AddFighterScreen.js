import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { getToken } from "../AuthServices";
import { createFighter } from "../services/fightersService";

export default function AddFighterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [wins, setWins] = useState("");
  const [losses, setLosses] = useState("");
  const [region, setRegion] = useState("");
  const [league, setLeague] = useState("");

  const handleCreate = async () => {
    if (!name || !age || !wins || !losses || !region || !league) {
      Alert.alert("Missing details", "All fighter fields are required.");
      return;
    }

    try {
      const token = await getToken();
      await createFighter(
        {
          name,
          age: parseInt(age, 10) || 0,
          region,
          league,
          record: { wins: parseInt(wins, 10) || 0, losses: parseInt(losses, 10) || 0 },
        },
        token,
      );
      navigation.navigate("FightersList");
    } catch (err) {
      Alert.alert("Create failed", "Unable to add fighter right now.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Fighter</Text>
        <Input label="Name" value={name} setValue={setName} />
        <Input label="Age" value={age} setValue={setAge} numeric />
        <Input label="Wins" value={wins} setValue={setWins} numeric />
        <Input label="Losses" value={losses} setValue={setLosses} numeric />
        <Input label="Region" value={region} setValue={setRegion} />
        <Input label="League" value={league} setValue={setLeague} />
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Save Fighter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Input({ label, value, setValue, numeric = false }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(txt) => setValue(numeric ? txt.replace(/[^0-9]/g, "") : txt)}
        placeholder={label}
        placeholderTextColor="#7e90b7"
        keyboardType={numeric ? "numeric" : "default"}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#070b19",
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#2d3b63",
    borderRadius: 12,
    backgroundColor: "#101833",
    padding: 14,
  },
  title: {
    color: "#8fc1ff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    color: "#cad8f5",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3a4f87",
    borderRadius: 10,
    backgroundColor: "#111e41",
    color: "#eef4ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    marginTop: 14,
    backgroundColor: "#2f89ff",
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
