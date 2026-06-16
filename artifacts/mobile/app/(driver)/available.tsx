import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api, Order } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { Fonts } from "@/constants/fonts";

function formatCurrency(n: number) {
  return `${n.toLocaleString("ar-IQ")} د.ع`;
}

export default function AvailableOrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [pickingUp, setPickingUp] = useState<string | null>(null);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const { data: orders = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["driver-available"],
    queryFn: api.driver.available,
    refetchInterval: 15000,
  });

  const pickupMutation = useMutation({
    mutationFn: api.driver.pickup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["driver-available"] });
      qc.invalidateQueries({ queryKey: ["driver-current"] });
    },
  });

  async function handlePickup(order: Order) {
    Alert.alert(
      "استلام الطلب",
      `هل تريد استلام طلب ${order.customerName}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "استلام",
          onPress: async () => {
            setPickingUp(order.id);
            try {
              await pickupMutation.mutateAsync(order.id);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e: any) {
              Alert.alert("خطأ", e.message || "فشل استلام الطلب");
            } finally {
              setPickingUp(null);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          backgroundColor: colors.card,
          paddingTop: topPad + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            backgroundColor: colors.primary + "20",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: colors.primary }}>
            {orders.length} طلب
          </Text>
        </View>
        <Text style={{ fontSize: 24, fontFamily: Fonts.bold, color: colors.foreground }}>
          الطلبات المتاحة
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1, alignSelf: "center" }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
              <Feather name="package" size={48} color={colors.mutedForeground} />
              <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.mutedForeground }}>
                لا توجد طلبات جاهزة للاستلام
              </Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.mutedForeground }}>
                سيتم التحديث تلقائياً كل 15 ثانية
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: colors.radius * 1.5,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 17, color: colors.primary }}>
                  {formatCurrency(item.total)}
                </Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.foreground }}>
                    {item.restaurantName || "المطعم"}
                  </Text>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.mutedForeground }}>
                    طلب #{item.orderNumber}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: colors.radius,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.foreground, flex: 1, textAlign: "right" }}>
                    {item.deliveryAddress}
                  </Text>
                  <Feather name="map-pin" size={14} color={colors.primary} />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 6 }}>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.mutedForeground }}>
                    {item.customerName}
                  </Text>
                  <Feather name="user" size={14} color={colors.mutedForeground} />
                </View>
              </View>

              {pickingUp === item.id ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Pressable
                  onPress={() => handlePickup(item)}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: colors.radius,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <Feather name="package" size={18} color="#FFFFFF" />
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: "#FFFFFF" }}>
                    استلام الطلب
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
