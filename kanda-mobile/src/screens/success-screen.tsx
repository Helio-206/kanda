import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OccurrenceCard } from "@/components/occurrence-card";
import { useOccurrenceStore } from "@/store/occurrence.store";
import { useAppStore } from "@/store/use-app-store";
import { colors, radius, spacing } from "@/utils/theme";

function pickParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function SuccessScreen() {
  const user = useAppStore((state) => state.user);
  const occurrences = useOccurrenceStore((state) => state.occurrences);
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const id = pickParam(params.id);
  const occurrence = id
    ? occurrences.find((item) => item.id === id) ?? occurrences[0] ?? null
    : occurrences[0] ?? null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Sucesso</Text>
          <Text style={styles.title}>Ocorrência oficialmente registada.</Text>
          <Text style={styles.copy}>
            O caso entrou na plataforma e já recebeu um código único de acompanhamento.
          </Text>
        </View>

        {occurrence ? (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Código de acompanhamento</Text>
              <Text style={styles.summaryCode}>{occurrence.code}</Text>
              <Text style={styles.summaryText}>
                Entidade sugerida: {occurrence.aiResponsibleEntity ?? "Entidade responsável"}
              </Text>
              <Text style={styles.summaryText}>
                Próximo passo: guardar o código e abrir o detalhe quando precisares
              </Text>
            </View>

            <OccurrenceCard
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
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ainda não há uma submissão recente.</Text>
            <Text style={styles.emptyCopy}>
              Faz um reporte para activar esta superfície de sucesso.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            onPress={() =>
              occurrence
                ? router.push({
                    pathname: "/occurrence/[id]",
                    params: { id: occurrence.id },
                  })
                : router.push("/report")
            }
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Abrir detalhe</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/acompanhar",
                params: { code: occurrence?.code ?? "" },
              })
            }
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Acompanhar por código</Text>
          </Pressable>
        </View>
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
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  summaryLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "800",
  },
  summaryCode: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  summaryText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
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
  actions: {
    gap: spacing.sm,
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
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
  },
});
