import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAppStore } from "@/store/use-app-store";
import { colors, radius, spacing } from "@/utils/theme";

export function LoginScreen() {
  const user = useAppStore((state) => state.user);
  const login = useAppStore((state) => state.login);
  const [phone, setPhone] = useState("");

  if (user) {
    return <Redirect href="/home" />;
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const canContinue = cleanPhone.length >= 9;

  function handleContinue() {
    if (!canContinue) return;
    login(phone);
    router.replace("/home");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.fill}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <Text style={styles.kicker}>KANDA Mobile</Text>
            <Text style={styles.title}>Reporta, confirma e guarda o teu código de acompanhamento.</Text>
            <Text style={styles.copy}>
              Entra com o teu número e começa a criar ocorrências com análise, confirmação e recibo digital.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="912 345 678"
              placeholderTextColor={colors.textSoft}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.button,
                !canContinue && styles.buttonDisabled,
                pressed && canContinue && styles.buttonPressed,
              ]}>
              <Text style={styles.buttonText}>Entrar</Text>
            </Pressable>

            <Text style={styles.helper}>
              O acesso aqui é simples mesmo. Sem senha por enquanto, só a entrada rápida na camada cidadã.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  kicker: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "800",
  },
  copy: {
    color: colors.textSoft,
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
  },
  helper: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
});
