import { Redirect, router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useOccurrenceStore } from "@/store/occurrence.store";
import { useAppStore } from "@/store/use-app-store";
import { colors, radius, spacing } from "@/utils/theme";

export function ProfileScreen() {
  const user = useAppStore((state) => state.user);
  const occurrences = useOccurrenceStore((state) => state.occurrences);
  const clearAll = useOccurrenceStore((state) => state.clearAll);
  const logout = useAppStore((state) => state.logout);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const total = occurrences.length;
  const open = occurrences.filter((item) => item.status !== "resolvida").length;
  const resolved = occurrences.filter((item) => item.status === "resolvida").length;
  const confirmations = occurrences.reduce((sum, item) => sum + (item.confirmations ?? 0), 0);
  const credibility = Math.min(100, 70 + resolved * 2 + total);
  const nextLevel = Math.min(100, credibility + 7);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Perfil</Text>
          <Text style={styles.title}>{user.name}</Text>
          <Text style={styles.copy}>{user.phone}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{credibility}</Text>
              <Text style={styles.summaryLabel}>Score</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>Colaborador</Text>
              <Text style={styles.summaryLabel}>Nível</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{nextLevel}</Text>
              <Text style={styles.summaryLabel}>Próximo nível</Text>
            </View>
          </View>
          <Text style={styles.summaryNote}>
            {resolved} casos acompanhados • {confirmations} confirmações úteis
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Conta e impacto</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Telefone</Text>
            <Text style={styles.detailValue}>{user.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total guardadas</Text>
            <Text style={styles.detailValue}>{total}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Em aberto</Text>
            <Text style={styles.detailValue}>{open}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Resolvidas</Text>
            <Text style={styles.detailValue}>{resolved}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Criado em</Text>
            <Text style={styles.detailValue}>
              {new Date(user.joinedAt).toLocaleDateString("pt-AO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.credibilityNote}>
            <Text style={styles.credibilityNoteText}>
              A tua participação ajuda a validar o território e a dar sinal útil à comunidade.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/minhas-ocorrencias")}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
          <Text style={styles.secondaryButtonText}>Minhas ocorrências</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            clearAll();
            logout();
          }}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}>
          <Text style={styles.actionButtonText}>Limpar dados e sair</Text>
        </Pressable>

        <Pressable
          onPress={logout}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
          <Text style={styles.secondaryButtonText}>Sair</Text>
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
    fontSize: 30,
    lineHeight: 34,
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
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
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
  summaryNote: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  credibilityNote: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  credibilityNoteText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  detailLabel: {
    color: colors.textSoft,
    fontSize: 13,
  },
  detailValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  actionButton: {
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
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
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
});
