import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { analyzeFullReport } from "@/services/ai/ai-report.service";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useOccurrenceStore } from "@/store/occurrence.store";
import { useAppStore } from "@/store/use-app-store";
import { humanLocationToLabel, humanizeCoordinates } from "@/services/location-humanizer.service";
import { isValidCoordinates } from "@/services/location.service";
import {
  aiRiskLevelLabels,
  aiTechnicalFlagLabels,
  occurrenceCategories,
  occurrenceCategoryLabels,
  occurrencePriorityLabels,
  occurrencePriorities,
  type AIReportAnalysis,
  type AITechnicalFlag,
  type OccurrenceCategory,
  type OccurrencePriority,
  type Occurrence,
} from "@/types/occurrence";
import type { HumanLocation } from "@/types/geo";
import { colors, radius, shadows, spacing } from "@/utils/theme";

const fallbackAddress = "Luanda, Angola";

function pickParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseNumber(value?: string | null) {
  if (!value || !value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatConfidence(value: number) {
  return `${Math.round(value * 100)}%`;
}

function isTechnicalFlag(value: string): value is AITechnicalFlag {
  return Object.prototype.hasOwnProperty.call(aiTechnicalFlagLabels, value);
}

const analysisFlow = ["Foto", "Análise IA", "Descrição", "Localização", "Entidade", "Confirmação", "Código"] as const;

export function ReportScreen() {
  const user = useAppStore((state) => state.user);
  const occurrences = useOccurrenceStore((state) => state.occurrences);
  const createOccurrence = useOccurrenceStore((state) => state.createOccurrence);
  const params = useLocalSearchParams<{
    latitude?: string | string[];
    longitude?: string | string[];
    accuracy?: string | string[];
    addressLabel?: string | string[];
    selectedOnMap?: string | string[];
    capturedAt?: string | string[];
  }>();

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIReportAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOccurrence, setSubmittedOccurrence] = useState<Occurrence | null>(null);
  const submitLockRef = useRef(false);

  const [category, setCategory] = useState<OccurrenceCategory | "">("");
  const [priority, setPriority] = useState<OccurrencePriority | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [addressLabel, setAddressLabel] = useState(fallbackAddress);
  const [humanLocation, setHumanLocation] = useState<HumanLocation | null>(null);
  const [humanLocationLoading, setHumanLocationLoading] = useState(false);

  const {
    permission,
    loading: locationLoading,
    error: locationError,
    lastKnownLocation,
    requestPermission,
    getCurrentPosition,
  } = useCurrentLocation();

  const selectedFromMap = pickParam(params.selectedOnMap) === "1";
  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    isValidCoordinates({ latitude, longitude });

  const locationStatus = useMemo(() => {
    if (hasCoordinates) {
      return "Localização pronta";
    }

    if (locationLoading) {
      return "A captar localização";
    }

    if (locationError) {
      return "GPS indisponível";
    }

    if (permission === "granted") {
      return "A guardar o ponto";
    }

    return "Localização em falta";
  }, [hasCoordinates, locationError, locationLoading, permission]);

  const draftSummary = useMemo(() => {
    if (!analysis) {
      return null;
    }

    return {
      category: category || analysis.final.category,
      priority: priority || analysis.final.priority,
      title: title.trim() || analysis.final.title,
      description: description.trim() || analysis.final.description,
    };
  }, [analysis, category, description, priority, title]);

  const manualOverrideActive = Boolean(
    analysis &&
      isEditing &&
      draftSummary &&
      (draftSummary.category !== analysis.final.category ||
        draftSummary.priority !== analysis.final.priority ||
        draftSummary.title !== analysis.final.title ||
        draftSummary.description !== analysis.final.description)
  );

  function openMap() {
    router.push("/map");
  }

  useEffect(() => {
    const nextLatitude = parseNumber(pickParam(params.latitude));
    const nextLongitude = parseNumber(pickParam(params.longitude));
    const nextAccuracy = parseNumber(pickParam(params.accuracy));
    const nextAddressLabel = pickParam(params.addressLabel);

    if (nextLatitude !== null) {
      setLatitude(nextLatitude);
    }

    if (nextLongitude !== null) {
      setLongitude(nextLongitude);
    }

    if (nextAccuracy !== null) {
      setAccuracy(nextAccuracy);
    }

    if (nextAddressLabel) {
      setAddressLabel(nextAddressLabel);
    }
  }, [params.addressLabel, params.accuracy, params.latitude, params.longitude]);

  useEffect(() => {
    const run = requestPermission ?? (async () => "unavailable" as const);
    void run();
  }, [requestPermission]);

  useEffect(() => {
    if (permission !== "granted") {
      return;
    }

    void getCurrentPosition();
  }, [getCurrentPosition, permission]);

  useEffect(() => {
    if (!lastKnownLocation) {
      return;
    }

    setLatitude((current) => current ?? lastKnownLocation.latitude);
    setLongitude((current) => current ?? lastKnownLocation.longitude);
    setAccuracy((current) => current ?? lastKnownLocation.accuracy ?? null);
  }, [lastKnownLocation]);

  useEffect(() => {
    if (!hasCoordinates || latitude === null || longitude === null) {
      setHumanLocation(null);
      setHumanLocationLoading(false);
      return;
    }

    const safeLatitude = latitude;
    const safeLongitude = longitude;
    let active = true;

    async function runHumanizer() {
      setHumanLocationLoading(true);

      try {
        const nextHumanLocation = await humanizeCoordinates({
          latitude: safeLatitude,
          longitude: safeLongitude,
        });

        if (!active) {
          return;
        }

        setHumanLocation(nextHumanLocation);
      } finally {
        if (active) {
          setHumanLocationLoading(false);
        }
      }
    }

    void runHumanizer();

    return () => {
      active = false;
    };
  }, [hasCoordinates, latitude, longitude]);

  useEffect(() => {
    let active = true;

    async function runAnalysis() {
      if (!selectedImageUri) {
        setAnalysis(null);
        setAnalysisError(null);
        setIsAnalyzing(false);
        setIsEditing(false);
        return;
      }

      setIsAnalyzing(true);
      setAnalysisError(null);
      setFormError(null);

      try {
        const nextAnalysis = await analyzeFullReport({
          description: "",
          imageUri: selectedImageUri,
          latitude,
          longitude,
          nearbyOccurrences: occurrences,
        });

        if (!active) {
          return;
        }

        setAnalysis(nextAnalysis);
        setIsEditing(false);
      } catch {
        if (active) {
          setAnalysisError("Não consegui analisar esta foto agora. Tenta outra.");
          setAnalysis(null);
          setIsEditing(false);
        }
      } finally {
        if (active) {
          setIsAnalyzing(false);
        }
      }
    }

    void runAnalysis();

    return () => {
      active = false;
    };
  }, [latitude, longitude, occurrences, selectedImageUri]);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  async function pickPhoto(source: "camera" | "library") {
    setFormError(null);
    setAnalysisError(null);
    setIsEditing(false);

    const permissionResult =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setFormError(
        source === "camera"
          ? "Sem permissão para abrir a câmara."
          : "Sem permissão para abrir a galeria."
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.85,
          });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setSelectedImageUri(result.assets[0].uri);
    setAnalysis(null);
    setIsAnalyzing(true);
  }

  function removePhoto() {
    setSelectedImageUri(null);
    setAnalysis(null);
    setAnalysisError(null);
    setIsEditing(false);
    setCategory("");
    setPriority("");
    setTitle("");
    setDescription("");
  }

  function startEditing() {
    if (!analysis) {
      return;
    }

    setCategory(analysis.final.category);
    setPriority(analysis.final.priority);
    setTitle(analysis.final.title);
    setDescription(analysis.final.description);
    setIsEditing(true);
    setFormError(null);
  }

  async function handleSubmit() {
    if (submitLockRef.current) {
      return;
    }

    if (!analysis) {
      setFormError("A análise ainda não terminou.");
      return;
    }

    let nextLatitude = latitude;
    let nextLongitude = longitude;
    let nextAccuracy = accuracy;

    if (nextLatitude === null || nextLongitude === null) {
      const location = lastKnownLocation ?? (await getCurrentPosition());

      if (location) {
        nextLatitude = location.latitude;
        nextLongitude = location.longitude;
        nextAccuracy = location.accuracy;
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        setAccuracy(location.accuracy);
      }
    }

    if (nextLatitude === null || nextLongitude === null) {
      setFormError("Ainda não tenho a localização certa. Tenta outra vez.");
      return;
    }

    setIsSubmitting(true);
    submitLockRef.current = true;
    setFormError(null);

    try {
      const resolvedDraft = draftSummary ?? {
        category: analysis.final.category,
        priority: analysis.final.priority,
        title: analysis.final.title,
        description: analysis.final.description,
      };
      const resolvedHumanLocation =
        humanLocation ??
        (await humanizeCoordinates({
          latitude: nextLatitude,
          longitude: nextLongitude,
        }));
      const resolvedAddressLabel = humanLocationToLabel(resolvedHumanLocation);

      const occurrence = createOccurrence({
        title: resolvedDraft.title.trim(),
        description: resolvedDraft.description.trim(),
        category: resolvedDraft.category as OccurrenceCategory,
        priority: resolvedDraft.priority as OccurrencePriority,
        latitude: nextLatitude,
        longitude: nextLongitude,
        accuracy: nextAccuracy,
        addressLabel: resolvedAddressLabel,
        imageUri: selectedImageUri,
        aiImageUsed: analysis.source.imageUsed,
        aiTextUsed: analysis.source.textUsed,
        aiDetectedObjects: analysis.imageAnalysis?.detectedObjects ?? [],
        aiSceneDescription: analysis.imageAnalysis?.sceneDescription ?? null,
        aiRiskHints: analysis.imageAnalysis?.visualRiskHints ?? [],
        aiDamageLevel: analysis.imageAnalysis?.damageLevel ?? analysis.final.riskLevel,
        aiAuthoritySummary: analysis.final.authoritySummary,
        aiGeneratedDescription: analysis.final.description,
        aiCategory: analysis.final.category,
        aiPriority: analysis.final.priority,
        aiResponsibleEntity: analysis.final.responsibleEntity,
        aiSummary: analysis.final.authoritySummary,
        aiRiskLevel: analysis.final.riskLevel,
        aiConfidence: analysis.final.confidence,
        aiFlags: analysis.final.tags.filter(isTechnicalFlag),
        aiPossibleDuplicate: null,
      });

      setSubmittedOccurrence(occurrence);
      setIsSubmitting(false);
      submitLockRef.current = false;
    } catch {
      setFormError("Não consegui guardar a ocorrência. Tenta outra vez.");
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  }

  function renderPhotoState() {
    if (!selectedImageUri) {
      return (
        <View style={styles.heroCard}>
          <View style={styles.heroFrame}>
            <Ionicons name="camera" size={36} color={colors.primary} />
            <Text style={styles.heroFrameTitle}>Aponte a câmara para o problema</Text>
            <Text style={styles.heroFrameCopy}>
              Tira a foto. O KANDA prepara a ocorrência e tu confirmas.
            </Text>
          </View>

          <View style={styles.photoActions}>
            <Pressable
              onPress={() => void pickPhoto("camera")}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Ionicons name="camera" size={18} color={colors.surface} />
              <Text style={styles.primaryButtonText}>Tirar foto</Text>
            </Pressable>

            <Pressable
              onPress={() => void pickPhoto("library")}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.softPressed]}>
              <Ionicons name="images" size={18} color={colors.text} />
              <Text style={styles.secondaryButtonText}>Escolher foto</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.photoShell}>
        <View style={styles.photoCard}>
          <Image source={{ uri: selectedImageUri }} style={styles.photoPreview} contentFit="cover" />
          <View style={styles.photoOverlay}>
            <Text style={styles.photoOverlayText}>Foto adicionada</Text>
          </View>
        </View>

        <View style={styles.inlinePhotoActions}>
          <Pressable onPress={() => void pickPhoto("camera")} style={styles.inlineAction}>
            <Text style={styles.inlineActionText}>Trocar foto</Text>
          </Pressable>
          <Pressable onPress={removePhoto} style={styles.inlineActionGhost}>
            <Text style={styles.inlineActionGhostText}>Remover</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderAnalysis() {
    if (!selectedImageUri) {
      return null;
    }

    const flowStage = analysis ? 5 : isAnalyzing ? 2 : 1;

    return (
      <View style={styles.analysisCard}>
        <View style={styles.analysisHeader}>
          <View style={styles.analysisHeaderText}>
            <Text style={styles.analysisKicker}>Análise automática</Text>
            <Text style={styles.analysisTitle}>
              {isAnalyzing ? "A app está a analisar..." : "Análise pronta"}
            </Text>
          </View>

          {analysis ? (
            <View style={styles.confidencePill}>
              <Text style={styles.confidenceText}>{formatConfidence(analysis.final.confidence)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.flowRail}>
          {analysisFlow.map((step, index) => {
            const active = index <= flowStage;

            return (
              <View key={step} style={[styles.flowChip, active && styles.flowChipActive]}>
                <Text style={[styles.flowChipText, active && styles.flowChipTextActive]}>{step}</Text>
              </View>
            );
          })}
        </View>

        {isAnalyzing ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>
              A app está a analisar a foto... já volta.
            </Text>
          </View>
        ) : null}

        {analysisError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{analysisError}</Text>
          </View>
        ) : null}

        {analysis ? (
          <>
            <View style={styles.resultHero}>
              <Text style={styles.resultLabel}>Categoria</Text>
              <Text style={styles.resultValue}>
                {occurrenceCategoryLabels[(draftSummary?.category ?? analysis.final.category) as OccurrenceCategory]}
              </Text>
            </View>

            <View style={styles.resultSummaryCard}>
              <Text style={styles.resultSummaryLabel}>Resumo preparado</Text>
              <Text style={styles.resultSummaryText}>{analysis.final.authoritySummary}</Text>
            </View>

            <View style={styles.resultGrid}>
              <View style={styles.resultTile}>
                <Text style={styles.resultTileLabel}>Prioridade</Text>
                <Text style={styles.resultTileValue}>
                  {occurrencePriorityLabels[
                    (draftSummary?.priority ?? analysis.final.priority) as OccurrencePriority
                  ]}
                </Text>
              </View>
              <View style={styles.resultTile}>
                <Text style={styles.resultTileLabel}>Risco</Text>
                <Text style={styles.resultTileValue}>
                  {aiRiskLevelLabels[analysis.final.riskLevel]}
                </Text>
              </View>
              <View style={styles.resultTile}>
                <Text style={styles.resultTileLabel}>Responsável</Text>
                <Text style={styles.resultTileValue}>{analysis.final.responsibleEntity}</Text>
              </View>
              <View style={styles.resultTile}>
                <Text style={styles.resultTileLabel}>Confiança</Text>
                <Text style={styles.resultTileValue}>{formatConfidence(analysis.final.confidence)}</Text>
              </View>
            </View>

            <View style={styles.resultDescriptionCard}>
              <Text style={styles.resultDescriptionLabel}>Descrição técnica</Text>
              <Text style={styles.resultDescription}>
                {draftSummary?.description ?? analysis.final.description}
              </Text>
            </View>

            <View style={styles.locationCard}>
              <View style={styles.locationCardHeader}>
                <Text style={styles.locationCardTitle}>Local detectado</Text>
                <View style={styles.locationPill}>
                  <Text style={styles.locationPillText}>{locationStatus}</Text>
                </View>
              </View>

              {humanLocationLoading ? (
                <View style={styles.locationLoadingRow}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.locationCardText}>A preparar a localização...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.locationTitle}>
                    {humanLocation?.title ?? addressLabel?.trim() ?? fallbackAddress}
                  </Text>
                  <Text style={styles.locationCardText}>
                    {humanLocation?.subtitle ?? "A localização vai aparecer por bairro, rua ou referência."}
                  </Text>
                </>
              )}

              <Pressable onPress={openMap} style={styles.locationButton}>
                <Text style={styles.locationButtonText}>Alterar localização</Text>
              </Pressable>
            </View>

            {analysis.final.warnings.length > 0 ? (
              <View style={styles.warningBox}>
                {analysis.final.warnings.map((warning) => (
                  <Text key={warning} style={styles.warningText}>
                    • {warning}
                  </Text>
                ))}
              </View>
            ) : null}

            {!isEditing ? (
              <View style={styles.reviewActions}>
                <Pressable
                  onPress={() => void handleSubmit()}
                  disabled={isAnalyzing || isSubmitting}
                  style={({ pressed }) => [
                    styles.reviewPrimary,
                    (isAnalyzing || isSubmitting) && styles.buttonDisabled,
                    pressed && !(isAnalyzing || isSubmitting) && styles.buttonPressed,
                  ]}>
                  <Text style={styles.reviewPrimaryText}>
                    {isSubmitting ? "A enviar..." : "Confirmar"}
                  </Text>
                </Pressable>

                <Pressable onPress={startEditing} style={styles.reviewSecondary}>
                  <Text style={styles.reviewSecondaryText}>Editar</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    );
  }

  function renderEditor() {
    if (!isEditing || !analysis || !draftSummary) {
      return null;
    }

    return (
      <View style={styles.editorCard}>
        <View style={styles.editorHeader}>
          <View>
            <Text style={styles.editorKicker}>Editar só o que estiver errado</Text>
            <Text style={styles.editorTitle}>O KANDA já preparou tudo</Text>
          </View>

          <Pressable onPress={() => setIsEditing(false)}>
            <Text style={styles.editorLink}>Voltar</Text>
          </Pressable>
        </View>

        <View style={styles.editorSection}>
          <Text style={styles.editorLabel}>Categoria</Text>
          <View style={styles.chipRow}>
            {occurrenceCategories.map((item) => {
              const selected = item === draftSummary.category;

              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {occurrenceCategoryLabels[item]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.editorSection}>
          <Text style={styles.editorLabel}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Título curto e direto"
            placeholderTextColor={colors.textSoft}
            style={styles.input}
          />
        </View>

        <View style={styles.editorSection}>
          <Text style={styles.editorLabel}>Prioridade</Text>
          <View style={styles.chipRow}>
            {occurrencePriorities.map((item) => {
              const selected = item === draftSummary.priority;

              return (
                <Pressable
                  key={item}
                  onPress={() => setPriority(item)}
                  style={[styles.priorityChip, selected && styles.priorityChipSelected]}>
                  <Text
                    style={[styles.priorityChipText, selected && styles.priorityChipTextSelected]}>
                    {occurrencePriorityLabels[item]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.editorSection}>
          <Text style={styles.editorLabel}>Descrição</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Se quiseres ajustar, faz aqui sem complicar."
            placeholderTextColor={colors.textSoft}
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.inputMultiline]}
          />
        </View>

        <View style={styles.editorMeta}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Responsável</Text>
            <Text style={styles.metaValue}>{analysis.final.responsibleEntity}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Risco</Text>
            <Text style={styles.metaValue}>{aiRiskLevelLabels[analysis.final.riskLevel]}</Text>
          </View>
        </View>

        {manualOverrideActive ? (
          <View style={styles.overrideNote}>
            <Text style={styles.overrideNoteText}>
              O sistema classificou isto de outra forma por critérios técnicos.
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => void handleSubmit()}
          disabled={isAnalyzing || isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            (isAnalyzing || isSubmitting) && styles.buttonDisabled,
            pressed && !(isAnalyzing || isSubmitting) && styles.buttonPressed,
          ]}>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "A enviar..." : "Enviar ocorrência"}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (submittedOccurrence) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successHero}>
            <Text style={styles.kicker}>Ocorrência oficialmente registada</Text>
            <Text style={styles.title}>A tua ocorrência entrou na plataforma KANDA.</Text>
            <Text style={styles.copy}>
              O registo foi preparado para acompanhamento operacional e já recebeu um código único.
            </Text>
          </View>

          <View style={styles.successCard}>
            <View style={styles.successTopRow}>
              <View>
                <Text style={styles.successLabel}>Código de acompanhamento</Text>
                <Text style={styles.successCode}>{submittedOccurrence.code}</Text>
              </View>
              <View style={styles.successBadge}>
                <Text style={styles.successBadgeText}>
                  {occurrencePriorityLabels[submittedOccurrence.priority]}
                </Text>
              </View>
            </View>

            <View style={styles.successMetaGrid}>
              <View style={styles.successMetaItem}>
                <Text style={styles.successMetaLabel}>Entidade sugerida</Text>
                <Text style={styles.successMetaValue}>
                  {submittedOccurrence.aiResponsibleEntity ?? "Entidade responsável"}
                </Text>
              </View>
              <View style={styles.successMetaItem}>
                <Text style={styles.successMetaLabel}>Próximo passo</Text>
                <Text style={styles.successMetaValue}>Guarda o código e acompanha o estado</Text>
              </View>
              <View style={styles.successMetaItem}>
                <Text style={styles.successMetaLabel}>Confiança da análise</Text>
                <Text style={styles.successMetaValue}>
                  {submittedOccurrence.aiConfidence != null ? formatConfidence(submittedOccurrence.aiConfidence) : "—"}
                </Text>
              </View>
            </View>

            <View style={styles.successImpactCard}>
              <Text style={styles.successImpactLabel}>Impacto comunitário</Text>
              <Text style={styles.successImpactText}>
                Este código é o recibo digital que te permite voltar ao caso e mostrar o estado sempre que precisares.
              </Text>
            </View>

            <View style={styles.successActions}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/occurrence/[id]",
                    params: { id: submittedOccurrence.id },
                  })
                }
                style={({ pressed }) => [styles.reviewPrimary, pressed && styles.buttonPressed]}>
                <Text style={styles.reviewPrimaryText}>Acompanhar ocorrência</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/acompanhar",
                    params: { code: submittedOccurrence.code },
                  })
                }
                style={({ pressed }) => [styles.reviewSecondary, pressed && styles.softPressed]}>
                <Text style={styles.reviewSecondaryText}>Acompanhar por código</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setSubmittedOccurrence(null);
                setSelectedImageUri(null);
                setAnalysis(null);
                setCategory("");
                setPriority("");
                setTitle("");
                setDescription("");
                setIsEditing(false);
                setFormError(null);
                setIsSubmitting(false);
                submitLockRef.current = false;
              }}
              style={({ pressed }) => [styles.successResetButton, pressed && styles.buttonPressed]}>
              <Text style={styles.successResetText}>Registar outra ocorrência</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headline}>
          <Text style={styles.kicker}>Novo reporte</Text>
          <Text style={styles.title}>O que está errado aqui?</Text>
            <Text style={styles.copy}>
            Tira a foto ou aponta a câmara. O KANDA prepara a ocorrência e tu confirmas.
          </Text>

          {selectedFromMap ? (
            <View style={styles.fromMapPill}>
              <Text style={styles.fromMapText}>Ponto vindo do mapa</Text>
            </View>
          ) : null}
        </View>

        {formError ? (
          <View style={styles.formErrorBox}>
            <Text style={styles.formErrorText}>{formError}</Text>
          </View>
        ) : null}

        {renderPhotoState()}
        {renderAnalysis()}
        {renderEditor()}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  headline: {
    gap: spacing.sm,
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
  },
  copy: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  fromMapPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  fromMapText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  successHero: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  successCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows,
  },
  successTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  successLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "800",
  },
  successCode: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 2,
  },
  successBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  successBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  successMetaGrid: {
    gap: spacing.sm,
  },
  successMetaItem: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  successMetaLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "800",
  },
  successMetaValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  successImpactCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  successImpactLabel: {
    color: colors.primary,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "800",
  },
  successImpactText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  successActions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  successResetButton: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  successResetText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  formErrorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  formErrorText: {
    color: "#991B1B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows,
  },
  heroFrame: {
    minHeight: 220,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroFrameTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  heroFrameCopy: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  softPressed: {
    opacity: 0.88,
  },
  photoShell: {
    gap: spacing.sm,
  },
  photoCard: {
    position: "relative",
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    ...shadows,
  },
  photoPreview: {
    width: "100%",
    height: 260,
    backgroundColor: colors.surfaceMuted,
  },
  photoOverlay: {
    position: "absolute",
    left: spacing.md,
    top: spacing.md,
    backgroundColor: "rgba(15, 118, 110, 0.92)",
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  photoOverlayText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800",
  },
  inlinePhotoActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inlineAction: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 13,
    alignItems: "center",
  },
  inlineActionText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800",
  },
  inlineActionGhost: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  inlineActionGhostText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  analysisCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  analysisHeaderText: {
    flex: 1,
    gap: 4,
  },
  flowRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  flowChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  flowChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  flowChipText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  flowChipTextActive: {
    color: colors.primary,
  },
  analysisKicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  analysisTitle: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  confidencePill: {
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  confidenceText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  loadingText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: "#FFF1F2",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#FDA4AF",
    padding: spacing.md,
  },
  errorText: {
    color: "#9F1239",
    fontSize: 13,
    lineHeight: 18,
  },
  resultHero: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
  },
  resultSummaryCard: {
    backgroundColor: "#0F172A",
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
  },
  resultSummaryLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  resultSummaryText: {
    color: colors.surface,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  resultLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  resultValue: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  resultTile: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  resultTileLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "700",
  },
  resultTileValue: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  resultDescriptionCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
  },
  resultDescriptionLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  resultDescription: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  locationCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  locationCardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  locationPill: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  locationPillText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  locationCardText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  locationLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  locationTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  locationButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.text,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
  },
  locationButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
  warningBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#FDBA74",
    padding: spacing.md,
    gap: 4,
  },
  warningText: {
    color: "#9A3412",
    fontSize: 12,
    lineHeight: 17,
  },
  reviewActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  reviewPrimary: {
    flex: 1,
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: "center",
  },
  reviewPrimaryText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800",
  },
  reviewSecondary: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 15,
    alignItems: "center",
  },
  reviewSecondaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  editorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows,
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  editorKicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  editorTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 2,
  },
  editorLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  editorSection: {
    gap: spacing.sm,
  },
  editorLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextSelected: {
    color: colors.surface,
  },
  priorityChip: {
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  priorityChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  priorityChipTextSelected: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 110,
  },
  editorMeta: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metaBlock: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  metaLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "700",
  },
  metaValue: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  overrideNote: {
    backgroundColor: "#FFF7ED",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#FDBA74",
    padding: spacing.md,
  },
  overrideNoteText: {
    color: "#9A3412",
    fontSize: 12,
    lineHeight: 17,
  },
  submitButton: {
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "900",
  },
});
