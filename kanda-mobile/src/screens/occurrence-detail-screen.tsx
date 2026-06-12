import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import { useOccurrenceTimelineStore } from "@/store/occurrence-timeline.store";
import { useOccurrenceStore } from "@/store/occurrence.store";
import {
  occurrenceCategoryLabels,
  occurrenceTimelineEventTypeLabels,
  occurrenceStatuses,
} from "@/types/occurrence";
import { colors, radius, spacing } from "@/utils/theme";

function pickParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OccurrenceDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const id = pickParam(params.id);
  const occurrence = useOccurrenceStore((state) => (id ? state.getOccurrenceById(id) : undefined));
  const updateStatus = useOccurrenceStore((state) => state.updateStatus);
  const removeOccurrence = useOccurrenceStore((state) => state.removeOccurrence);
  const timelineEvents = useOccurrenceTimelineStore((state) => state.events);
  const timeline = useMemo(() => {
    if (!id) {
      return [];
    }

    return timelineEvents.filter((event) => event.occurrenceId === id);
  }, [id, timelineEvents]);

  if (!id) {
    return <Redirect href="/home" />;
  }

  if (!occurrence) {
    return (
      <View style={styles.missingState}>
        <View style={styles.missingCard}>
          <Text style={styles.kicker}>Ocorrência</Text>
          <Text style={styles.title}>Não encontrei este caso</Text>
          <Text style={styles.copy}>
            Pode ter sido apagado ou o link já não aponta para nada. Acontece.
          </Text>

          <Pressable onPress={() => router.replace("/home")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Voltar à home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleChangeStatus = (status: (typeof occurrenceStatuses)[number]) => {
    if (status === occurrence.status) {
      return;
    }

    updateStatus(occurrence.id, status);
  };

  const handleResolve = () => {
    if (occurrence.status === "resolvida") {
      return;
    }

    updateStatus(occurrence.id, "resolvida");
  };

  const handleDelete = () => {
    Alert.alert(
      "Apagar ocorrência?",
      "Isto remove o caso do telemóvel. O histórico fica na timeline local, mas a ocorrência desaparece da lista.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: () => {
            removeOccurrence(occurrence.id);
            router.replace("/home");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {occurrence.imageUri ? (
          <Image source={{ uri: occurrence.imageUri }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={styles.heroFallback}>
            <Text style={styles.heroFallbackText}>Sem foto</Text>
          </View>
        )}
      </View>

      <View style={styles.headerBlock}>
        <Text style={styles.kicker}>Ocorrência</Text>
        <Text style={styles.title}>{occurrence.title}</Text>
        <Text style={styles.copy}>{occurrence.addressLabel ?? "Sem referência do local"}</Text>

        <View style={styles.badgesRow}>
          <StatusBadge status={occurrence.status} />
          <PriorityBadge priority={occurrence.priority} />
        </View>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Código de acompanhamento</Text>
        <Text style={styles.codeValue}>{occurrence.code}</Text>
        <Text style={styles.codeCopy}>
          Guarda este código. Ele é o recibo digital que te permite voltar ao caso.
        </Text>
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.sectionTitle}>KANDA Score</Text>
          <Text style={styles.scoreValue}>{Math.round((occurrence.aiConfidence ?? 0.78) * 100)}</Text>
        </View>
        <Text style={styles.scoreCopy}>
          A leitura combinada do caso, do risco e da confiança da análise local.
        </Text>
        <View style={styles.scoreMetaRow}>
          <View style={styles.scoreMetaItem}>
            <Text style={styles.scoreMetaLabel}>Confirmações</Text>
            <Text style={styles.scoreMetaValue}>
              {occurrence.confirmations > 0
                ? `${occurrence.confirmations} da comunidade`
                : 'Ainda sem confirmações'}
            </Text>
          </View>
          <View style={styles.scoreMetaItem}>
            <Text style={styles.scoreMetaLabel}>Impacto</Text>
            <Text style={styles.scoreMetaValue}>
              {occurrence.confirmations > 0 ? 'A crescer' : 'Por validar'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.sectionText}>{occurrence.description}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Dados</Text>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Categoria</Text>
            <Text style={styles.metaValue}>
              {occurrenceCategoryLabels[occurrence.category]}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Entidade responsável</Text>
            <Text style={styles.metaValue}>{occurrence.aiAuthoritySummary ?? "Entidade sugerida pela análise"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Criada em</Text>
            <Text style={styles.metaValue}>{formatDate(occurrence.createdAt)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Actualizada</Text>
            <Text style={styles.metaValue}>{formatDate(occurrence.updatedAt)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Local</Text>
            <Text style={styles.metaValue}>{occurrence.addressLabel ?? "Sem referência do local"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Estado do caso</Text>
          <Pressable onPress={handleResolve} style={styles.resolveButton}>
            <Text style={styles.resolveButtonText}>Marcar como resolvida</Text>
          </Pressable>
        </View>

        <View style={styles.statusGrid}>
          {occurrenceStatuses.map((status) => {
            const selected = status === occurrence.status;

            return (
              <Pressable
                key={status}
                onPress={() => handleChangeStatus(status)}
                style={({ pressed }) => [
                  styles.statusTile,
                  selected && styles.statusTileSelected,
                  pressed && styles.statusTilePressed,
                ]}>
                <StatusBadge status={status} compact />
                {selected ? <Text style={styles.statusTileNote}>Actual</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        {timeline.length === 0 ? (
          <Text style={styles.emptyText}>Ainda não há movimentos registados para esta ocorrência.</Text>
        ) : (
          <View style={styles.timeline}>
            {timeline.map((event, index) => {
              const last = index === timeline.length - 1;

              return (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={styles.timelineRail}>
                    <View style={styles.timelineDot} />
                    {!last ? <View style={styles.timelineLine} /> : null}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{event.title}</Text>
                    {event.description ? (
                      <Text style={styles.timelineText}>{event.description}</Text>
                    ) : null}
                    <Text style={styles.timelineMeta}>
                      {occurrenceTimelineEventTypeLabels[event.type]} • {formatDate(event.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => router.push({ pathname: "/map", params: { occurrenceId: occurrence.id } })}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
          <Text style={styles.secondaryButtonText}>Ver no mapa</Text>
        </Pressable>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}>
          <Text style={styles.dangerButtonText}>Apagar ocorrência</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  hero: {
    minHeight: 240,
    backgroundColor: colors.surfaceMuted,
  },
  heroImage: {
    width: "100%",
    height: 280,
  },
  heroFallback: {
    width: "100%",
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  heroFallbackText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "700",
  },
  headerBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
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
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  codeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  codeLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "800",
  },
  codeValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  codeCopy: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  scoreValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900",
  },
  scoreCopy: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  scoreMetaRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  scoreMetaItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  scoreMetaLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "800",
  },
  scoreMetaValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  sectionText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  metaGrid: {
    gap: spacing.md,
  },
  metaItem: {
    gap: 4,
  },
  metaLabel: {
    color: colors.textSoft,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "700",
  },
  metaValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  resolveButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  resolveButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusTile: {
    minWidth: "48%",
    flexGrow: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: 8,
  },
  statusTileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  statusTilePressed: {
    opacity: 0.9,
  },
  statusTileNote: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  timeline: {
    gap: spacing.md,
  },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineRail: {
    width: 16,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  timelineTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  timelineText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  timelineMeta: {
    color: colors.textSoft,
    fontSize: 12,
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  dangerButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  dangerButtonText: {
    color: "#991B1B",
    fontSize: 15,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  missingState: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  missingCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  primaryButton: {
    marginTop: spacing.sm,
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
});
