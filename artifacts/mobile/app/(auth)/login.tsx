import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Fonts } from "@/constants/fonts";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) {
      setError("يرجى إدخال رقم الهاتف وكلمة المرور");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(phone.trim(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/");
    } catch (e: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(
        e.message?.includes("401") || e.message?.includes("credentials")
          ? "رقم الهاتف أو كلمة المرور غير صحيحة"
          : e.message || "خطأ في الاتصال بالخادم"
      );
    } finally {
      setLoading(false);
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: "center",
      paddingTop: insets.top + (Platform.OS === "web" ? 40 : 0),
      paddingBottom: insets.bottom + 24,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 48,
    },
    logoCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 10,
    },
    logoText: {
      fontSize: 22,
      fontFamily: Fonts.bold,
      color: colors.primary,
      letterSpacing: 0.5,
    },
    logoSubtext: {
      fontSize: 13,
      fontFamily: Fonts.regular,
      color: colors.mutedForeground,
      marginTop: 4,
      textAlign: "center",
    },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius * 2,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 4,
    },
    fieldLabel: {
      fontSize: 13,
      fontFamily: Fonts.semiBold,
      color: colors.mutedForeground,
      textAlign: "right",
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.border,
      marginBottom: 16,
      paddingHorizontal: 14,
      height: 52,
    },
    inputRowFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
    },
    inputIcon: {
      marginLeft: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: Fonts.regular,
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
    },
    errorBox: {
      backgroundColor: "#FFF1F0",
      borderRadius: colors.radius,
      padding: 12,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },
    errorText: {
      fontSize: 13,
      fontFamily: Fonts.regular,
      color: colors.destructive,
      textAlign: "right",
      flex: 1,
    },
    loginBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    loginBtnDisabled: {
      opacity: 0.7,
    },
    loginBtnText: {
      fontSize: 17,
      fontFamily: Fonts.bold,
      color: colors.primaryForeground,
      letterSpacing: 0.5,
    },
  });

  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Feather name="truck" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>أوفرلك</Text>
          <Text style={styles.logoSubtext}>منصة إدارة المطاعم والسواق</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>رقم الهاتف</Text>
          <View
            style={[styles.inputRow, phoneFocused && styles.inputRowFocused]}
          >
            <Feather
              name="phone"
              size={18}
              color={phoneFocused ? colors.primary : colors.mutedForeground}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="07XXXXXXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.fieldLabel}>كلمة المرور</Text>
          <View
            style={[styles.inputRow, passFocused && styles.inputRowFocused]}
          >
            <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.inputIcon}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color={passFocused ? colors.primary : colors.mutedForeground}
              />
            </Pressable>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              onSubmitEditing={handleLogin}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
            </View>
          )}

          <Pressable
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>دخول</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
