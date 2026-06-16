import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { Fonts } from "@/constants/fonts";

function formatCurrency(n: number) {
  return `${n.toLocaleString("ar-IQ")} د.ع`;
}

export default function CurrentOrderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [delivering, setDelivering] = useState(false);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const { data: order, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["driver-current"],
    queryFn: api.driver.current,
    refetchInterval: 20000,
  });

  const deliverMutation = useMutation({
    mutationFn: api.driver.deliver,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["driver-current"] });
      qc.invalidateQueries({ queryKey: ["driver-history"] });
    },
  });

  async function handleDeliver() {
    if (!order) return;
    Alert.alert("تأكيد التسليم", "هل تم تسليم الطلب بنجاح؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تم التسليم",
        onPress: async () => {
          setDelivering(true);
          try {
            await deliverMutation.mutateAsync(order.id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e: any) {
            Alert.alert("خطأ", e.message || "فشل تحديث حالة التوصيل");
          } finally {
            setDelivering(false);
          }
        },
      },
    ]);
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
        }}
      >
        <Text style={{ fontSize: 24, fontFamily: Fonts.bold, color: colors.foreground, textAlign: "right" }}>
          طلبي الحالي
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1, alignSelf: "center" }} />
      ) : !order ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="navigation" size={40} color={colors.primary} />
          </View>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 18, color: colors.foreground, textAlign: "center" }}>
            لا يوجد طلب نشط
          </Text>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}>
            استلم طلباً من قائمة الطلبات المتاحة لتبدأ التوصيل
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: colors.primary + "15",
              borderRadius: colors.radius * 1.5,
              padding: 16,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "#FFFFFF" }}>
                قيد التوصيل
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.primary }}>
                طلب #{order.orderNumber}
              </Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.mutedForeground }}>
                {order.customerName}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: colors.radius * 1.5,
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.foreground }}>
                عنوان التوصيل
              </Text>
              <Feather name="map-pin" size={18} color={colors.primary} />
            </View>
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: colors.radius,
                padding: 14,
              }}
            >
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.foreground, textAlign: "right" }}>
                {order.deliveryAddress}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: colors.radius * 1.5,
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.foreground }}>
                تفاصيل الطلب
              </Text>
              <Feather name="shopping-bag" size={18} color={colors.primary} />
            </View>
            {order.items.map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 6,
                  borderBottomWidth: i < order.items.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.mutedForeground }}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.foreground }}>
                  {item.name} × {item.quantity}
                </Text>
              </View>
            ))}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 10,
                marginTop: 4,
              }}
            >
              <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: colors.primary }}>
                {formatCurrency(order.total)}
              </Text>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: colors.foreground }}>
                الإجمالي
              </Text>
            </View>
          </View>

          {delivering ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />
          ) : (
            <Pressable
              onPress={handleDeliver}
              style={{
                backgroundColor: colors.success,
                borderRadius: colors.radius * 1.2,
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
                marginTop: 8,
                shadowColor: colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Feather name="check-circle" size={22} color="#FFFFFF" />
              <Text style={{ fontFamily: Fonts.bold, fontSize: 17, color: "#FFFFFF" }}>
                تم التسليم
              </Text>
            </Pressable>
          )}
        </ScrollView>
      )}
    </View>
  );
}
