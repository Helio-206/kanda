import { router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/utils/theme";

const labels = ["Categoria", "Prioridade", "Entidade sugerida", "Descrição preparada"] as const;

export function ConfirmLabelsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Confirmar rótulos</Text>
          <Text style={styles.title}>O cidadão valida o que a IA propôs.</Text>
          <Text style={styles.copy}>
            Esta etapa existe para reduzir erro, dar confiança ao envio final e preparar a geração do código.
          </Text>
        </View>

        <View style={styles.card}>
          {labels.map((label) => (
            <View key={label} style={styles.row}>
              <View style={styles.dot} />
              <Text style={styles.rowText}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>UX esperado</Text>
          <Text style={styles.sectionText}>Rever antes de enviar.</Text>
          <Text style={styles.sectionText}>Manter só o que estiver errado.</Text>
          <Text style={styles.sectionText}>Confirmar a intenção final.</Text>
          <Text style={styles.sectionText}>Receber o código de acompanhamento no fim.</Text>
        </View>

        <Pressable onPress={() => router.push("/report")} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Voltar ao reporte</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
  },
  copy: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  rowText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  sectionText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
  },
});
