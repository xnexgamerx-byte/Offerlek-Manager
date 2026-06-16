import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RootIndex() {
  const { token, role, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === "restaurant") {
    return <Redirect href="/(restaurant)/orders" />;
  }

  if (role === "driver") {
    return <Redirect href="/(driver)/available" />;
  }

  return <Redirect href="/(auth)/login" />;
}
