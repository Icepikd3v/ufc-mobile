import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getToken } from "../AuthServices";
import { getFighterById, removeFighter } from "../services/fightersService";

export default function FighterDetailScreen({ route, navigation }) {
  const [fighter, setFighter] = useState(route.params.fighter);

  const refreshFighter = useCallback(async () => {
    try {
      const token = await getToken();
      const next = await getFighterById(route.params.fighter._id, token);
      if (next) setFighter(next);
    } catch (err) {
      console.error("Failed to refresh fighter:", err?.message || err);
    }
  }, [route.params.fighter._id]);

  useFocusEffect(
    useCallback(() => {
      refreshFighter();
    }, [refreshFighter]),
  );

  const handleDelete = async () => {
    Alert.alert("Delete Fighter", "Are you sure you want to remove this fighter?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            await removeFighter(fighter._id, token);
            navigation.navigate("FightersList");
          } catch (err) {
            Alert.alert("Delete failed", "Unable to remove fighter right now.");
          }
        },
      },
    ]);
  };

  if (!fighter) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading fighter...</Text>
      </View>
    );
  }

  const wins = fighter.record?.wins ?? 0;
  const losses = fighter.record?.losses ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{fighter.name}</Text>
        <Text style={styles.line}>Age: {fighter.age}</Text>
        <Text style={styles.line}>Region: {fighter.region}</Text>
        <Text style={styles.line}>League: {fighter.league}</Text>
        <Text style={styles.record}>Record: {wins}-{losses}</Text>
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("UpdateFighter", { fighter })}
      >
        <Text style={styles.primaryText}>Edit Fighter</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={handleDelete}>
        <Text style={styles.secondaryText}>Delete Fighter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070b19",
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#2d3b63",
    borderRadius: 12,
    backgroundColor: "#101833",
    padding: 14,
    marginBottom: 16,
  },
  name: {
    color: "#e9f1ff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  line: {
    color: "#cad8f5",
    fontSize: 16,
    marginBottom: 6,
  },
  record: {
    color: "#9ce0b6",
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#2f89ff",
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  primaryText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#6b3850",
    backgroundColor: "#2a1721",
    borderRadius: 10,
    paddingVertical: 12,
  },
  secondaryText: {
    color: "#ffcad5",
    textAlign: "center",
    fontWeight: "700",
  },
  loadingText: {
    color: "#c7d8fc",
    textAlign: "center",
    marginTop: 28,
  },
});
