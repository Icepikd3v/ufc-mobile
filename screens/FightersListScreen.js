import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getToken } from "../AuthServices";
import { getFighters } from "../services/fightersService";

export default function FightersListScreen({ navigation }) {
  const [fighters, setFighters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFighterList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) {
        navigation.navigate("Login");
        return;
      }
      const rows = await getFighters(token);
      setFighters(rows);
    } catch (err) {
      setError("Unable to load fighters right now. Demo mode remains available from the login screen.");
      console.error("Failed to fetch fighters:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchFighterList();
    }, [fetchFighterList]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Fighters</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddFighter")}
        >
          <Text style={styles.addButtonText}>+ Add Fighter</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator color="#6aa9ff" size="large" /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && fighters.length === 0 ? (
        <Text style={styles.emptyText}>No fighters available yet.</Text>
      ) : (
        <FlatList
          data={fighters}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const wins = item.record?.wins ?? 0;
            const losses = item.record?.losses ?? 0;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("FighterDetail", { fighter: item })}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.region || "Region TBD"} • {item.league || "League TBD"}</Text>
                <Text style={styles.record}>Record: {wins}-{losses}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070b19",
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#8fc1ff",
    fontSize: 26,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "#2f89ff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#2d3b63",
    borderRadius: 12,
    backgroundColor: "#101833",
    padding: 12,
  },
  name: {
    color: "#e9f1ff",
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: "#a7b8dc",
    marginTop: 4,
    fontSize: 13,
  },
  record: {
    color: "#9ce0b6",
    marginTop: 8,
    fontWeight: "700",
  },
  emptyText: {
    color: "#c8d8fb",
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },
  errorText: {
    color: "#ff9aa8",
    marginBottom: 10,
  },
});
