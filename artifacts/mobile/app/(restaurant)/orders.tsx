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

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  accepted: "مقبول",
  rejected: "مرفوض",
  ready: "جاهز للتوصيل",
  picked_up: "مع السائق",
  delivered: "تم التوصيل",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#FF9F0A",
  accepted: "#30D158",
  rejected: "#FF3B30",
  ready: "#007AFF",
  picked_up: "#5856D6",
  delivered: "#8E8E93",
};

function formatCurrency(amount: number) {
  return `${amount.toLocaleString("ar-IQ")} د.ع`;
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hrs = Math.floor(mins / 60);
  return `منذ ${hrs} س`;
}

const NEW_STATUSES = ["pending", "accepted"];
const PREVIOUS_STATUSES = ["ready", "picked_up", "delivered", "rejected"];

function OrderCard({
  order,
  onAccept,
  onReject,
  onReady,
  isUpdating,
}: {
  order: Order;
  onAccept?: () => void;
  onReject?: () => void;
  onReady?: () => void;
  isUpdating: boolean;
}) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[order.status] || colors.mutedForeground;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: colors.radius * 1.5,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <View
          style={{
            backgroundColor: statusColor + "20",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: statusColor }}>
            {STATUS_LABELS[order.status] || order.status}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: colors.foreground }}>
            طلب #{shortId(order.id)}
          </Text>
          <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: colors.mutedForeground }}>
            {timeAgo(order.createdAt)}
          </Text>
        </View>
      </View>

      {/* Items — only when detail is loaded */}
      {order.items && order.items.length > 0 && (
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: colors.radius,
            padding: 10,
            marginBottom: 10,
          }}
        >
          {order.items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: colors.mutedForeground }}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: colors.foreground }}>
                {item.name} × {item.quantity}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Total + address */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: colors.primary }}>
          {formatCurrency(order.totalAmount)}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1, justifyContent: "flex-end" }}>
          <Text
            style={{ fontSize: 13, fontFamily: Fonts.regular, color: colors.mutedForeground, textAlign: "right", maxWidth: "80%" }}
            numberOfLines={1}
          >
            {order.deliveryAddress}
          </Text>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
        </View>
      </View>

      {/* Actions */}
      {isUpdating ? (
        <ActivityIndicator color={colors.primary} style={{ alignSelf: "center", marginTop: 4 }} />
      ) : (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          {order.status === "pending" && (
            <>
              <Pressable
                onPress={onReject}
                style={{
                  flex: 1,
                  backgroundColor: colors.destructive + "15",
                  borderRadius: colors.radius,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: colors.destructive,
                }}
              >
                <Text style={{ fontFamily: Fonts.bold, color: colors.destructive, fontSize: 14 }}>
                  رفض
                </Text>
              </Pressable>
              <Pressable
                onPress={onAccept}
                style={{
                  flex: 2,
                  backgroundColor: colors.success,
                  borderRadius: colors.radius,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: Fonts.bold, color: "#FFFFFF", fontSize: 14 }}>
                  قبول الطلب
                </Text>
              </Pressable>
            </>
          )}
          {order.status === "accepted" && (
            <Pressable
              onPress={onReady}
              style={{
                flex: 1,
                backgroundColor: "#007AFF",
                borderRadius: colors.radius,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: Fonts.bold, color: "#FFFFFF", fontSize: 14 }}>
                جاهز للتوصيل
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"new" | "previous">("new");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  // Single query — filter client-side to avoid duplicate keys
  const { data: allOrders = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["restaurant-orders"],
    queryFn: api.orders.list,
    refetchInterval: 15000,
  });

  // Remove any duplicate IDs
  const uniqueOrders = allOrders.filter(
    (o, i, arr) => arr.findIndex((x) => x.id === o.id) === i
  );

  const newOrders = uniqueOrders.filter((o) => NEW_STATUSES.includes(o.status));
  const previousOrders = uniqueOrders.filter((o) => PREVIOUS_STATUSES.includes(o.status));
  const displayOrders = activeTab === "new" ? newOrders : previousOrders;

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.orders.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restaurant-orders"] }),
  });

  async function handleAction(order: Order, status: string) {
    if (status === "rejected") {
      Alert.alert("تأكيد الرفض", "هل تريد رفض هذا الطلب؟", [
        { text: "إلغاء", style: "cancel" },
        { text: "رفض", style: "destructive", onPress: () => doUpdate(order.id, status) },
      ]);
    } else {
      doUpdate(order.id, status);
    }
  }

  async function doUpdate(id: string, status: string) {
    setUpdatingId(id);
    try {
      await updateMutation.mutateAsync({ id, status });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert("خطأ", e.message || "فشل تحديث حالة الطلب");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.card,
          paddingTop: topPad + 12,
          paddingHorizontal: 20,
          paddingBottom: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{ fontSize: 24, fontFamily: Fonts.bold, color: colors.foreground, textAlign: "right", marginBottom: 16 }}
        >
          الطلبات
        </Text>

        <View style={{ flexDirection: "row" }}>
          {(["new", "previous"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: "center",
                borderBottomWidth: 2.5,
                borderBottomColor: activeTab === tab ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  fontFamily: activeTab === tab ? Fonts.bold : Fonts.regular,
                  fontSize: 15,
                  color: activeTab === tab ? colors.primary : colors.mutedForeground,
                }}
              >
                {tab === "new"
                  ? `جديد${newOrders.length > 0 ? ` (${newOrders.length})` : ""}`
                  : "السابقة"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1, alignSelf: "center" }} />
      ) : (
        <FlatList
          data={displayOrders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
          }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <Feather
                name={activeTab === "new" ? "inbox" : "clock"}
                size={48}
                color={colors.mutedForeground}
              />
              <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.mutedForeground }}>
                {activeTab === "new" ? "لا توجد طلبات جديدة" : "لا توجد طلبات سابقة"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              isUpdating={updatingId === item.id}
              onAccept={() => handleAction(item, "accepted")}
              onReject={() => handleAction(item, "rejected")}
              onReady={() => handleAction(item, "ready")}
            />
          )}
        />
      )}
    </View>
  );
}
