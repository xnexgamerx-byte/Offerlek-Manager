import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { api, Order } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { Fonts } from "@/constants/fonts";

function formatCurrency(n: number) {
  return `${n.toLocaleString("ar-IQ")} د.ع`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const { data: orders = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["driver-history"],
    queryFn: async () => {
      const all = await api.orders.list();
      const today = new Date().toISOString().slice(0, 10);
      return all.filter((o) => o.status === "delivered" && o.createdAt.startsWith(today));
    },
  });

  const totalEarned = orders.reduce((s, o) => s + o.totalAmount, 0);

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
        }}
      >
        <Text style={{ fontSize: 24, fontFamily: Fonts.bold, color: colors.foreground, textAlign: "right" }}>
          سجل التوصيلات
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1, alignSelf: "center" }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          ListHeaderComponent={
            orders.length > 0 ? (
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius * 1.5,
                  padding: 20,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <View style={{ alignItems: "flex-start" }}>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 22, color: "#FFFFFF" }}>
                    {formatCurrency(totalEarned)}
                  </Text>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    إجمالي اليوم
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: "#FFFFFF" }}>
                    {orders.length}
                  </Text>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    توصيلة
                  </Text>
                </View>
              </View>
            ) : null
          }
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80) }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
              <Feather name="clock" size={48} color={colors.mutedForeground} />
              <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.mutedForeground }}>
                لا توجد توصيلات اليوم
              </Text>
            </View>
          }
          renderItem={({ item }: { item: Order }) => (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                padding: 14,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View style={{ alignItems: "flex-start" }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: colors.primary }}>
                  {formatCurrency(item.totalAmount)}
                </Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end", paddingLeft: 12 }}>
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: colors.foreground }}>
                  {item.restaurant?.name || "المطعم"}
                </Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.mutedForeground, marginTop: 2 }} numberOfLines={1}>
                  {item.deliveryAddress}
                </Text>
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success + "20", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Feather name="check" size={18} color={colors.success} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
