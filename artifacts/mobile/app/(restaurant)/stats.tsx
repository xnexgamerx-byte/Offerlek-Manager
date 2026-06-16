import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { Fonts } from "@/constants/fonts";

function formatCurrency(n: number) {
  return `${n.toLocaleString("ar-IQ")} د.ع`;
}

function StatCard({
  icon,
  label,
  value,
  color,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: colors.radius * 1.5,
        padding: 20,
        flex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        alignItems: "flex-end",
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: color + "20",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: colors.foreground }}>
        {value}
      </Text>
      <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: colors.mutedForeground, marginTop: 4 }}>
        {label}
      </Text>
      {sub && (
        <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: color, marginTop: 2 }}>
          {sub}
        </Text>
      )}
    </View>
  );
}

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["restaurant-stats"],
    queryFn: api.restaurant.stats,
    refetchInterval: 60000,
  });

  const today = new Date().toLocaleDateString("ar-IQ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        <Pressable onPress={() => refetch()} disabled={isRefetching}>
          <Feather
            name="refresh-cw"
            size={20}
            color={isRefetching ? colors.mutedForeground : colors.primary}
          />
        </Pressable>
        <Text style={{ fontSize: 24, fontFamily: Fonts.bold, color: colors.foreground }}>
          إحصائيات اليوم
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1, alignSelf: "center" }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            gap: 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.regular,
              color: colors.mutedForeground,
              textAlign: "right",
              marginBottom: 4,
            }}
          >
            {today}
          </Text>

          {!stats ? (
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <Feather name="bar-chart-2" size={48} color={colors.mutedForeground} />
              <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.mutedForeground }}>
                لا تتوفر إحصائيات بعد
              </Text>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <StatCard
                  icon="shopping-bag"
                  label="عدد الطلبات اليوم"
                  value={String(stats.ordersCount)}
                  color={colors.primary}
                />
                <StatCard
                  icon="trending-up"
                  label="إجمالي المبيعات"
                  value={formatCurrency(stats.totalSales)}
                  color={colors.success}
                />
              </View>

              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: colors.radius * 1.5,
                  padding: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 22, fontFamily: Fonts.bold, color: "#FF9F0A" }}>
                  {formatCurrency(stats.averageOrder)}
                </Text>
                <View style={{ alignItems: "flex-end", flex: 1, marginRight: 16 }}>
                  <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: colors.foreground }}>
                    متوسط قيمة الطلب
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: colors.mutedForeground, marginTop: 4 }}>
                    بناءً على طلبات اليوم
                  </Text>
                </View>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#FF9F0A20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="activity" size={20} color="#FF9F0A" />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
