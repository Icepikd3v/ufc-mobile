// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "./screens/HomeScreen";
import FightersListScreen from "./screens/FightersListScreen";
import AddFighterScreen from "./screens/AddFighterScreen";
import UpdateFighterScreen from "./screens/UpdateFighterScreen";
import FighterDetailScreen from "./screens/FighterDetailScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        setInitialRoute("Home");
      } else {
        setInitialRoute("Login");
      }
    };

    checkToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: "#0f1630" },
          headerTintColor: "#eaf2ff",
          headerTitleStyle: { fontWeight: "700" },
          cardStyle: { backgroundColor: "#070b19" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "UFC Mobile Access" }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Create Account" }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "UFC Mobile Hub" }} />
        <Stack.Screen name="FightersList" component={FightersListScreen} options={{ title: "Fighters Dashboard" }} />
        <Stack.Screen name="AddFighter" component={AddFighterScreen} options={{ title: "Add Fighter" }} />
        <Stack.Screen name="UpdateFighter" component={UpdateFighterScreen} options={{ title: "Update Fighter" }} />
        <Stack.Screen name="FighterDetail" component={FighterDetailScreen} options={{ title: "Fighter Details" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
