import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api, MenuItem } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { Fonts } from "@/constants/fonts";

function formatCurrency(n: number) {
  return `${n.toLocaleString("ar-IQ")} د.ع`;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  available: true,
};

function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: colors.radius,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: item.available ? 1 : 0.55,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ fontSize: 15, fontFamily: Fonts.semiBold, color: colors.foreground }}>
          {item.name}
        </Text>
        {item.description ? (
          <Text
            style={{ fontSize: 12, fontFamily: Fonts.regular, color: colors.mutedForeground, marginTop: 2 }}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        ) : null}
        <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: colors.primary, marginTop: 4 }}>
          {formatCurrency(item.price)}
        </Text>
      </View>

      <View style={{ alignItems: "center", gap: 8 }}>
        <Switch
          value={item.available}
          onValueChange={onToggle}
          trackColor={{ true: colors.success, false: colors.border }}
          thumbColor="#FFFFFF"
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={onEdit} hitSlop={8}>
            <Feather name="edit-2" size={16} color={colors.primary} />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8}>
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
}

function MenuForm({
  visible,
  editItem,
  onClose,
  onSave,
  saving,
}: {
  visible: boolean;
  editItem: MenuItem | null;
  onClose: () => void;
  onSave: (data: FormData) => void;
  saving: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<FormData>(
    editItem
      ? {
          name: editItem.name,
          description: editItem.description || "",
          price: String(editItem.price),
          category: editItem.category,
          available: editItem.available,
        }
      : EMPTY_FORM
  );

  React.useEffect(() => {
    if (visible) {
      setForm(
        editItem
          ? {
              name: editItem.name,
              description: editItem.description || "",
              price: String(editItem.price),
              category: editItem.category,
              available: editItem.available,
            }
          : EMPTY_FORM
      );
    }
  }, [visible, editItem]);

  const inputStyle = {
    backgroundColor: colors.input,
    borderRadius: colors.radius,
    padding: 12,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.foreground,
    textAlign: "right" as const,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: insets.bottom + 24,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Pressable onPress={onClose}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={{ fontSize: 18, fontFamily: Fonts.bold, color: colors.foreground }}>
            {editItem ? "تعديل الصنف" : "إضافة صنف جديد"}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={{ textAlign: "right", fontFamily: Fonts.semiBold, fontSize: 13, color: colors.mutedForeground, marginBottom: 6 }}>
            اسم الصنف *
          </Text>
          <TextInput
            style={inputStyle}
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="مثال: برجر دجاج"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={{ textAlign: "right", fontFamily: Fonts.semiBold, fontSize: 13, color: colors.mutedForeground, marginBottom: 6 }}>
            الوصف
          </Text>
          <TextInput
            style={[inputStyle, { height: 70, textAlignVertical: "top" }]}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="وصف مختصر"
            placeholderTextColor={colors.mutedForeground}
            multiline
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ textAlign: "right", fontFamily: Fonts.semiBold, fontSize: 13, color: colors.mutedForeground, marginBottom: 6 }}>
                الفئة *
              </Text>
              <TextInput
                style={inputStyle}
                value={form.category}
                onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
                placeholder="مثال: برجر"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ textAlign: "right", fontFamily: Fonts.semiBold, fontSize: 13, color: colors.mutedForeground, marginBottom: 6 }}>
                السعر (د.ع) *
              </Text>
              <TextInput
                style={inputStyle}
                value={form.price}
                onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Switch
              value={form.available}
              onValueChange={(v) => setForm((f) => ({ ...f, available: v }))}
              trackColor={{ true: colors.success, false: colors.border }}
              thumbColor="#FFFFFF"
            />
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: colors.foreground }}>
              متاح للطلب
            </Text>
          </View>

          <Pressable
            onPress={() => onSave(form)}
            disabled={saving}
            style={{
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: "#FFFFFF" }}>
                {editItem ? "حفظ التعديلات" : "إضافة الصنف"}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function MenuScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const [formVisible, setFormVisible] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: items = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["menu"],
    queryFn: api.restaurant.menu.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<MenuItem, "id">) => api.restaurant.menu.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItem> }) =>
      api.restaurant.menu.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.restaurant.menu.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });

  async function handleSave(form: FormData) {
    if (!form.name.trim() || !form.price || !form.category.trim()) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة");
      return;
    }
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      available: form.available,
    };
    setSavingId("saving");
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data });
      } else {
        await createMutation.mutateAsync({ ...data, imageUrl: undefined });
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFormVisible(false);
      setEditItem(null);
    } catch (e: any) {
      Alert.alert("خطأ", e.message || "فشل حفظ الصنف");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert("تأكيد الحذف", "هل تريد حذف هذا الصنف؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          setSavingId(id);
          try {
            await deleteMutation.mutateAsync(id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e: any) {
            Alert.alert("خطأ", e.message || "فشل حذف الصنف");
          } finally {
            setSavingId(null);
          }
        },
      },
    ]);
  }

  async function handleToggle(item: MenuItem) {
    setSavingId(item.id + "_toggle");
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        data: { available: !item.available },
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e: any) {
      Alert.alert("خطأ", e.message || "فشل تحديث الحالة");
    } finally {
      setSavingId(null);
    }
  }

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category || "أخرى";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const sections = Object.entries(grouped);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

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
        <Pressable
          onPress={() => {
            setEditItem(null);
            setFormVisible(true);
          }}
          style={{
            backgroundColor: colors.primary,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={{ fontSize: 24, fontFamily: Fonts.bold, color: colors.foreground }}>
          القائمة
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1, alignSelf: "center" }} />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={([cat]) => cat}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
          }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
              <Feather name="package" size={48} color={colors.mutedForeground} />
              <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.mutedForeground }}>
                لا توجد أصناف في القائمة
              </Text>
            </View>
          }
          renderItem={({ item: [category, categoryItems] }) => (
            <View style={{ marginBottom: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: colors.foreground }}>
                  {category}
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primary + "20",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 12, fontFamily: Fonts.bold, color: colors.primary }}>
                    {categoryItems.length}
                  </Text>
                </View>
              </View>
              {categoryItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => {
                    setEditItem(item);
                    setFormVisible(true);
                  }}
                  onDelete={() => handleDelete(item.id)}
                  onToggle={() => handleToggle(item)}
                />
              ))}
            </View>
          )}
        />
      )}

      <MenuForm
        visible={formVisible}
        editItem={editItem}
        onClose={() => {
          setFormVisible(false);
          setEditItem(null);
        }}
        onSave={handleSave}
        saving={savingId === "saving"}
      />
    </View>
  );
}
