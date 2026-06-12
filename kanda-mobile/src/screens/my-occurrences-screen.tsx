import { Redirect, router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OccurrenceCard } from "@/components/occurrence-card";
import { useOccurrenceStore } from "@/store/occurrence.store";
import { useAppStore } from "@/store/use-app-store";
import { colors, radius, spacing } from "@/utils/theme";

export function MyOccurrencesScreen() {
  const user = useAppStore((state) => state.user);
  const occurrences = useOccurrenceStore((state) => state.occurrences);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Minhas ocorrências</Text>
          <Text style={styles.title}>O que já foi registado por ti.</Text>
          <Text style={styles.copy}>
            A tua lista pessoal de ocorrências para acompanhar, rever pelo código e abrir no detalhe.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{occurrences.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{occurrences.filter((item) => item.status === "resolvida").length}</Text>
            <Text style={styles.summaryLabel}>Resolvidas</Text>
          </View>
        </View>

        {occurrences.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ainda não tens ocorrências guardadas.</Text>
            <Text style={styles.emptyCopy}>
              Começa por reportar uma situação para esta lista ganhar forma.
            </Text>
            <Pressable
              onPress={() => router.push("/report")}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Reportar ocorrência</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {occurrences.map((occurrence) => (
              <OccurrenceCard
                key={occurrence.id}
                occurrence={occurrence}
                onPress={() =>
                  router.push({
                    pathname: "/occurrence/[id]",
                    params: { id: occurrence.id },
                  })
                }
                onPressViewOnMap={() =>
                  router.push({
                    pathname: "/map",
                    params: { occurrenceId: occurrence.id },
                  })
                }
              />
            ))}
          </View>
        )}
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
  summaryCard: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  summaryLabel: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyCopy: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
  },
  list: {
    gap: spacing.md,
  },
});
