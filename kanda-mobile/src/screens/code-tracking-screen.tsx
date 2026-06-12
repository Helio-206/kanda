import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { useOccurrenceStore } from "@/store/occurrence.store";
import { useAppStore } from "@/store/use-app-store";
import { colors, radius, spacing } from "@/utils/theme";

function pickParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function CodeTrackingScreen() {
  const user = useAppStore((state) => state.user);
  const occurrences = useOccurrenceStore((state) => state.occurrences);
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const initialCode = useMemo(() => pickParam(params.code)?.toUpperCase() ?? "", [params.code]);
  const [code, setCode] = useState(initialCode);
  const [searchedCode, setSearchedCode] = useState(initialCode);

  const occurrence = useMemo(
    () => occurrences.find((item) => item.code === searchedCode.trim().toUpperCase()) ?? null,
    [occurrences, searchedCode]
  );

  function handleSearch() {
    setSearchedCode(code.trim().toUpperCase());
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Acompanhar por código</Text>
          <Text style={styles.title}>O código é o teu recibo digital.</Text>
          <Text style={styles.copy}>
            Introduz o código gerado no fim do reporte. É ele que permite recuperar o caso e ver o estado
            da ocorrência sem depender de conversas soltas.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Código de acompanhamento</Text>
          <TextInput
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            placeholder="KANDA-00A12B"
            placeholderTextColor={colors.textSoft}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />

          <Text style={styles.helper}>
            Cada ocorrência recebe um código único. Sem esse código, não há rastreio.
          </Text>

          <Pressable
            onPress={handleSearch}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Ver ocorrência</Text>
          </Pressable>
        </View>

        {searchedCode.trim().length > 0 && !occurrence ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Código não encontrado</Text>
            <Text style={styles.emptyCopy}>
              Verifica se o código foi copiado corretamente. Deve parecer algo como KANDA-00A12B.
            </Text>
          </View>
        ) : null}

        {occurrence ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultLabel}>Ocorrência encontrada</Text>
                <Text style={styles.resultCode}>{occurrence.code}</Text>
              </View>
              <PriorityBadge priority={occurrence.priority} compact />
            </View>

            <Text style={styles.resultTitle}>{occurrence.title}</Text>
            <Text style={styles.resultText}>{occurrence.addressLabel ?? "Sem referência do local"}</Text>

            <View style={styles.badgesRow}>
              <StatusBadge status={occurrence.status} compact />
              <Text style={styles.entityText}>
                {occurrence.aiResponsibleEntity ?? "Entidade responsável"}
              </Text>
            </View>

            <View style={styles.resultActions}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/occurrence/[id]",
                    params: { id: occurrence.id },
                  })
                }
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Abrir detalhe</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/minhas-ocorrencias")}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <Text style={styles.secondaryButtonText}>Ver minhas ocorrências</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
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
    letterSpacing: 0.6,
  },
  helper: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
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
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  resultLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "800",
  },
  resultCode: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  resultText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  entityText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  resultActions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
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
