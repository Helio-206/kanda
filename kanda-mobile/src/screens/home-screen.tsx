import { Redirect, router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OccurrenceCard } from "@/components/occurrence-card";
import { useOccurrenceStore } from "@/store/occurrence.store";
import { useAppStore } from "@/store/use-app-store";
import { colors, radius, spacing } from "@/utils/theme";

export function HomeScreen() {
  const user = useAppStore((state) => state.user);
  const occurrences = useOccurrenceStore((state) => state.occurrences);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const total = occurrences.length;
  const open = occurrences.filter((item) => item.status !== "resolvida").length;
  const resolved = occurrences.filter((item) => item.status === "resolvida").length;
  const critical = occurrences.filter((item) => item.priority === "critica").length;
  const recent = occurrences.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>KANDA</Text>
          <Text style={styles.title}>Reporta, recebe o código e acompanha o estado.</Text>
          <Text style={styles.copy}>
            A camada cidadã da plataforma KANDA para transformar uma foto num caso rastreável com código único.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{open}</Text>
            <Text style={styles.statLabel}>Em aberto</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{critical}</Text>
            <Text style={styles.statLabel}>Críticas</Text>
          </View>
        </View>

        <View style={styles.receiptCard}>
          <Text style={styles.sectionTitle}>Código de acompanhamento</Text>
          <Text style={styles.receiptCopy}>
            O cidadão confirma, o sistema gera o código e esse código vira o recibo digital do caso.
          </Text>
          <Text style={styles.receiptHint}>Sem este código, não há rastreio consistente.</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryAction} onPress={() => router.push("/report")}>
            <Text style={styles.primaryActionText}>Reportar ocorrência</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => router.push("/acompanhar")}>
            <Text style={styles.secondaryActionText}>Acompanhar por código</Text>
          </Pressable>
        </View>

        <Pressable style={styles.fullWidthAction} onPress={() => router.push("/minhas-ocorrencias")}>
          <Text style={styles.fullWidthActionText}>Minhas ocorrências</Text>
        </Pressable>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recentes</Text>
            <Text style={styles.sectionHint}>{resolved} resolvidas</Text>
          </View>

          {recent.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Ainda não há ocorrências</Text>
              <Text style={styles.emptyText}>
                Escolhe um ponto no mapa e cria a primeira. Depois isto começa a ganhar forma.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {recent.map((occurrence) => (
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
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryActionText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryActionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  fullWidthAction: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  fullWidthActionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  receiptCopy: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  receiptHint: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionHint: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  list: {
    gap: spacing.md,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
});
