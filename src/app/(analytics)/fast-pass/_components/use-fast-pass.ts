import { useCallback, useEffect, useRef, useState } from "react";
import type { ColumnDef } from "@/components/analytics/data-table-composer";
import { fastPassApi } from "@/lib/fast-pass/api-client";
import type {
  ChatMessage,
  ClarificationQuestion,
  MappingEntry,
  MetricOption,
  PublicationTier,
  UploadResult,
} from "./types";

export function useFastPass() {
  const [step, setStep] = useState(1);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mappings, setMappings] = useState<MappingEntry[]>([]);
  const [allConfirmed, setAllConfirmed] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [allMetrics, setAllMetrics] = useState<MetricOption[]>([]);
  const [metricCategories, setMetricCategories] = useState<Record<string, MetricOption[]>>({});

  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [clarifyDone, setClarifyDone] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [clarifying, setClarifying] = useState(false);

  const [composerColumns, setComposerColumns] = useState<ColumnDef[]>([]);
  const [composerData, setComposerData] = useState<Record<string, unknown>[]>([]);

  const [reportName, setReportName] = useState("Uploaded Report");
  const [pubTier, setPubTier] = useState<PublicationTier>("PERSONAL");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState("WEEKLY");
  const [scheduleDay, setScheduleDay] = useState("Monday");
  const [scheduleTime, setScheduleTime] = useState("08:00");
  const [scheduleRecipients, setScheduleRecipients] = useState("");
  const [teamEmails, setTeamEmails] = useState("");
  const [orgAccess, setOrgAccess] = useState("All Departments");
  const [certificationReason, setCertificationReason] = useState("");
  const [certificationChecked, setCertificationChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatTyping]);

  useEffect(() => {
    fastPassApi
      .getMetrics()
      .then((data: any) => {
        if (data.categories) {
          setMetricCategories(data.categories);
          const flat: MetricOption[] = [];
          for (const [category, metrics] of Object.entries(data.categories) as [string, MetricOption[]][]) {
            flat.push(...metrics.map((metric) => ({ ...metric, category })));
          }
          setAllMetrics(flat);
        }
      })
      .catch(() => {});
  }, []);

  const resetWorkflow = useCallback(() => {
    setUploadResult(null);
    setMappings([]);
    setAllConfirmed(false);
    setQuestions([]);
    setChatMessages([]);
    setChatInput("");
    setCurrentQuestionIdx(0);
    setClarifyDone(false);
    setComposerColumns([]);
    setComposerData([]);
    setSaved(false);
    setSaveError(null);
  }, []);

  const processFile = useCallback(
    async (file: File, opts?: { sheetName?: string; headerRowIdx?: number; keepCurrent?: boolean }) => {
      setUploading(true);
      setUploadError(null);
      if (!opts?.keepCurrent) resetWorkflow();
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (opts?.sheetName) formData.append("sheetName", opts.sheetName);
        if (typeof opts?.headerRowIdx === "number") {
          formData.append("headerRowIdx", String(opts.headerRowIdx));
        }

        const data: any = await fastPassApi.uploadReport(formData);
        if (!data.success) {
          setUploadError(data.error || "Failed to process file");
          return;
        }
        if (!data.headers?.length) {
          setUploadError("Could not detect column headers in this file.");
          return;
        }
        setUploadResult({
          fileName: data.fileName,
          sheetNames: data.sheetNames || [],
          targetSheet: data.targetSheet || "",
          detectedHeaderRowIdx: data.detectedHeaderRowIdx ?? 0,
          headerRowIdx: data.headerRowIdx ?? 0,
          previewRows: Array.isArray(data.previewRows) ? data.previewRows : [],
          headers: data.headers,
          dataRows: Array.isArray(data.dataRows) ? data.dataRows : [],
          rowCount: data.rowCount,
          columnCount: data.columnCount,
        });
        setReportName(data.fileName.replace(/\.(xlsx|csv|xls)$/i, "").replace(/[_-]/g, " "));
      } catch {
        setUploadError("Network error — could not upload file");
      } finally {
        setUploading(false);
      }
    },
    [resetWorkflow],
  );

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        setUploadedFile(file);
        void processFile(file);
      }
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadedFile(file);
        void processFile(file);
      }
    },
    [processFile],
  );

  const replaceFile = useCallback(() => {
    resetWorkflow();
    setUploadedFile(null);
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [resetWorkflow]);

  const reparseUploadedFile = useCallback(
    (opts: { sheetName?: string; headerRowIdx?: number }) => {
      if (!uploadedFile) return;
      void processFile(uploadedFile, { ...opts, keepCurrent: true });
    },
    [uploadedFile, processFile],
  );

  const runMapping = useCallback(async () => {
    if (!uploadResult) return;
    setMapping(true);
    try {
      const data: any = await fastPassApi.mapColumns(uploadResult.headers);
      if (data.mappings) {
        const entries: MappingEntry[] = data.mappings.map((m: MappingEntry) => ({
          ...m,
          status: m.confidence >= 85 ? "matched" : m.confidence >= 40 ? "review" : "unmapped",
          excluded: false,
        }));
        setMappings(entries);
        setAllConfirmed(false);
      }
    } catch {
      // silent retry path
    } finally {
      setMapping(false);
    }
  }, [uploadResult]);

  useEffect(() => {
    if (step === 2 && mappings.length === 0 && uploadResult) void runMapping();
  }, [step, mappings.length, uploadResult, runMapping]);

  const recordFeedbackSignals = useCallback(
    async (
      signals: Array<{
        sourceHeader: string;
        metricSlug?: string | null;
        action: "confirm" | "change" | "skip" | "auto_accept" | "auto_reject";
        context?: Record<string, unknown>;
      }>,
    ) => {
      if (signals.length === 0) return;
      try {
        await fastPassApi.submitFeedback(signals);
      } catch {
        // telemetry only
      }
    },
    [],
  );

  const confirmAllHighConfidence = useCallback(() => {
    setMappings((prev) => {
      const updated = prev.map((m) =>
        m.confidence >= 85 && !m.excluded
          ? { ...m, status: "confirmed" as const }
          : m,
      );
      setAllConfirmed(updated.every((m) => m.status === "confirmed"));
      return updated;
    });
  }, []);

  const toggleMappingConfirm = useCallback(
    (sourceHeader: string) => {
      setMappings((prev) => {
        let signal: {
          sourceHeader: string;
          metricSlug?: string | null;
          action: "confirm" | "change" | "skip" | "auto_accept" | "auto_reject";
          context?: Record<string, unknown>;
        } | null = null;
        const updated = prev.map((m) =>
          m.sourceHeader === sourceHeader
            ? {
                ...m,
                status:
                  m.status === "confirmed"
                    ? m.confidence >= 85
                      ? ("matched" as const)
                      : m.confidence >= 40
                        ? ("review" as const)
                        : ("unmapped" as const)
                    : ("confirmed" as const),
              }
            : m,
        );
        const changed = updated.find((m) => m.sourceHeader === sourceHeader);
        if (changed?.status === "confirmed" && changed.matchedSlug) {
          signal = {
            sourceHeader,
            metricSlug: changed.matchedSlug,
            action: "confirm",
            context: { confidence: changed.confidence, source: changed.matchSource || "manual" },
          };
        }
        setAllConfirmed(updated.every((m) => m.status === "confirmed"));
        if (signal) void recordFeedbackSignals([signal]);
        return updated;
      });
    },
    [recordFeedbackSignals],
  );

  const toggleMappingExcluded = useCallback(
    (sourceHeader: string) => {
      setMappings((prev) => {
        let skipSignal: {
          sourceHeader: string;
          metricSlug?: string | null;
          action: "confirm" | "change" | "skip" | "auto_accept" | "auto_reject";
          context?: Record<string, unknown>;
        } | null = null;
        const updated = prev.map((m) =>
          m.sourceHeader === sourceHeader
            ? {
                ...m,
                excluded: !m.excluded,
                status: !m.excluded ? ("confirmed" as const) : m.status,
              }
            : m,
        );
        const changed = updated.find((m) => m.sourceHeader === sourceHeader);
        if (changed?.excluded) {
          skipSignal = { sourceHeader, metricSlug: changed.matchedSlug, action: "skip", context: { from: "toggleExclude" } };
        }
        if (skipSignal) void recordFeedbackSignals([skipSignal]);
        return updated;
      });
    },
    [recordFeedbackSignals],
  );

  const excludeAllUnmapped = useCallback(() => {
    setMappings((prev) => {
      const signals: Array<{
        sourceHeader: string;
        metricSlug?: string | null;
        action: "confirm" | "change" | "skip" | "auto_accept" | "auto_reject";
        context?: Record<string, unknown>;
      }> = [];
      
      const updated = prev.map((m) => {
        // Exclude if unmapped (confidence < 40) and not already excluded
        if (m.confidence < 40 && !m.excluded) {
          signals.push({
            sourceHeader: m.sourceHeader,
            metricSlug: m.matchedSlug,
            action: "skip",
            context: { from: "excludeAllUnmapped" },
          });
          return {
            ...m,
            excluded: true,
            status: "confirmed" as const,
          };
        }
        return m;
      });
      
      if (signals.length > 0) void recordFeedbackSignals(signals);
      return updated;
    });
  }, [recordFeedbackSignals]);

  const changeMappingTarget = useCallback(
    (sourceHeader: string, metricSlug: string) => {
      const metric = allMetrics.find((m) => m.slug === metricSlug);
      if (!metric) return;
      setMappings((prev) =>
        prev.map((m) =>
          m.sourceHeader === sourceHeader
            ? { ...m, matchedMetric: metric.name, matchedSlug: metric.slug, confidence: 100, status: "confirmed" }
            : m,
        ),
      );
      void recordFeedbackSignals([{ sourceHeader, metricSlug: metric.slug, action: "change", context: { metricName: metric.name, from: "manual_select" } }]);
    },
    [allMetrics, recordFeedbackSignals],
  );

  const runClarification = useCallback(async () => {
    const activeMappings = mappings.filter((m) => !m.excluded);
    if (activeMappings.length === 0) {
      setQuestions([]);
      setClarifyDone(true);
      return;
    }
    setClarifying(true);
    try {
      const data: any = await fastPassApi.clarify(activeMappings);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQuestionIdx(0);
        setClarifyDone(false);
        setChatMessages([]);
      } else {
        setQuestions([]);
        setClarifyDone(true);
      }
    } catch {
      setClarifyDone(true);
    } finally {
      setClarifying(false);
    }
  }, [mappings]);

  const goToStep3 = useCallback(() => setStep(3), []);

  useEffect(() => {
    if (step === 3 && questions.length === 0 && !clarifyDone && !clarifying) {
      void runClarification();
    }
  }, [step, questions.length, clarifyDone, clarifying, runClarification]);

  useEffect(() => {
    if (step !== 3 || questions.length === 0) return;
    if (chatMessages.length === 0) {
      setChatTyping(true);
      const timer = setTimeout(() => {
        setChatTyping(false);
        const q = questions[0];
        const eligibleMappings = mappings.filter((m) => !m.excluded);
        const highCount = eligibleMappings.filter((m) => m.confidence >= 85).length;
        const mediumCount = eligibleMappings.filter((m) => m.confidence >= 40 && m.confidence < 85).length;
        const lowCount = eligibleMappings.filter((m) => m.confidence < 40).length;
        setChatMessages([
          { role: "agent", text: `I reviewed ${eligibleMappings.length} included columns: ${highCount} high confidence, ${mediumCount} medium confidence, and ${lowCount} low confidence. Let's confirm each mapping before preview.` },
          { role: "agent", text: q.question, questionId: q.id, suggestedAnswer: q.suggestedAnswer, options: q.options },
        ]);
        setCurrentQuestionIdx(0);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [step, questions, chatMessages.length, mappings]);

  const handleClarifyAnswer = useCallback(
    async (answer: string) => {
      const trimmed = answer.trim();
      if (!trimmed) return;
      const q = questions[currentQuestionIdx];
      if (!q) return;
      setChatMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setChatInput("");
      setChatTyping(true);
      let resolved = false;
      let agentReply = "I could not resolve that yet. Please pick one of the suggestions or clarify further.";
      try {
        const data: any = await fastPassApi.clarifyChat({
          message: trimmed,
          question: q,
          conversationHistory: chatMessages,
          mappings: mappings.filter((m) => !m.excluded),
          allMetrics,
        });
        {
          agentReply = data.reply || agentReply;
          if (data.action?.type === "update_mapping") {
            resolved = true;
            setMappings((prev) =>
              prev.map((m) =>
                m.sourceHeader === q.column
                  ? { ...m, matchedMetric: data.action.metricName || m.matchedMetric || m.sourceHeader, matchedSlug: data.action.metricSlug || m.matchedSlug, confidence: Math.max(m.confidence, 95), status: "confirmed", excluded: false }
                  : m,
              ),
            );
            void recordFeedbackSignals([{ sourceHeader: q.column, metricSlug: data.action.metricSlug, action: "change", context: { from: "clarify_chat" } }]);
          } else if (data.action?.type === "skip") {
            resolved = true;
            setMappings((prev) => prev.map((m) => (m.sourceHeader === q.column ? { ...m, excluded: true, status: "confirmed" } : m)));
            void recordFeedbackSignals([{ sourceHeader: q.column, metricSlug: null, action: "skip", context: { from: "clarify_chat" } }]);
          }
        }
      } catch {
        agentReply = "I couldn't reach the mapping service. Please try your answer again.";
      } finally {
        setChatTyping(false);
      }

      setChatMessages((prev) => [...prev, { role: "agent", text: agentReply, questionId: q.id, suggestedAnswer: q.suggestedAnswer, options: q.options }]);
      if (!resolved) return;
      const nextIdx = currentQuestionIdx + 1;
      if (nextIdx < questions.length) {
        const nextQ = questions[nextIdx];
        setChatMessages((prev) => [...prev, { role: "agent", text: nextQ.question, questionId: nextQ.id, suggestedAnswer: nextQ.suggestedAnswer, options: nextQ.options }]);
        setCurrentQuestionIdx(nextIdx);
      } else {
        setChatMessages((prev) => [...prev, { role: "agent", text: "All included columns are resolved. You're ready to preview your report." }]);
        setClarifyDone(true);
      }
    },
    [allMetrics, chatMessages, currentQuestionIdx, mappings, questions, recordFeedbackSignals],
  );

  useEffect(() => {
    if (step === 4 && uploadResult) {
      const cols: ColumnDef[] = mappings.map((m) => {
        const key = m.sourceHeader;
        const isNumericCol = uploadResult.dataRows.some((row) => typeof row[m.sourceHeader] === "number");
        let format: ColumnDef["format"] = "text";
        if (m.matchedSlug) {
          const metric = allMetrics.find((am) => am.slug === m.matchedSlug);
          if (metric) format = (metric.format as ColumnDef["format"]) ?? "text";
        } else if (isNumericCol) {
          format = "number";
        }
        return { key, label: m.matchedMetric || m.sourceHeader, visible: !m.excluded, format, align: format === "text" ? "left" : "right" };
      });
      setComposerColumns(cols);
      setComposerData(uploadResult.dataRows as Record<string, unknown>[]);
    }
  }, [step, uploadResult, mappings, allMetrics]);

  const handleSave = useCallback(async () => {
    if (!uploadResult) return;
    setSaveError(null);
    setSaving(true);
    try {
      const templateData: any[] = await fastPassApi.getTemplates();
      let templateId: string | null = null;
      if (Array.isArray(templateData)) {
        const custom = templateData.find((t: { slug: string }) => t.slug === "custom-ai-generated" || t.slug === "custom-upload");
        templateId = custom?.id ?? templateData[0]?.id ?? null;
      }
      if (!templateId) {
        const tData: any[] = await fastPassApi.getTemplates();
        templateId = Array.isArray(tData) ? tData[0]?.id : null;
      }
      if (!templateId) {
        setSaveError("No report template is available. Please try again.");
        return;
      }

      const columnMappings = mappings.filter((m) => !m.excluded).map((m) => ({
        source: m.sourceHeader,
        target: m.matchedMetric,
        slug: m.matchedSlug,
        confidence: m.confidence,
      }));

      const reportData: any = await fastPassApi.saveReport({
        templateId,
        name: reportName,
        tier: pubTier,
        filters: { columnMappings },
        columns: composerColumns.map((c) => ({ key: c.key, label: c.label, format: c.format })),
        data: composerData,
        teamEmails: pubTier === "TEAM" ? teamEmails : undefined,
        orgAccess: pubTier === "PUBLISHED" ? orgAccess : undefined,
        certificationReason: pubTier === "CERTIFIED" ? certificationReason : undefined,
        certificationChecked: pubTier === "CERTIFIED" ? certificationChecked : undefined,
      });
      if (scheduleEnabled && reportData.id) {
        const dayMap: Record<string, number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };
        try {
          await fastPassApi.createSchedule({
            reportId: reportData.id,
            frequency: scheduleFreq,
            dayOfWeek: dayMap[scheduleDay] ?? 1,
            time: scheduleTime,
            recipients: scheduleRecipients.split(",").map((e: string) => e.trim()).filter(Boolean),
          });
        } catch {
          setSaveError("Report saved, but schedule creation failed. You can retry from schedules.");
        }
      }
      setSaved(true);
    } catch {
      setSaveError("Failed to save report. Please check your connection and retry.");
    } finally {
      setSaving(false);
    }
  }, [uploadResult, mappings, reportName, pubTier, composerColumns, composerData, scheduleEnabled, scheduleFreq, scheduleDay, scheduleTime, scheduleRecipients, teamEmails, orgAccess, certificationReason, certificationChecked]);

  const currentSuggested = !clarifyDone && questions[currentQuestionIdx]?.suggestedAnswer;

  return {
    step,
    setStep,
    uploading,
    uploadError,
    uploadResult,
    dragOver,
    setDragOver,
    fileInputRef,
    handleFileDrop,
    handleFileSelect,
    replaceFile,
    reparseUploadedFile,
    mappings,
    allConfirmed,
    mapping,
    retryMapping: runMapping,
    metricCategories,
    confirmAllHighConfidence,
    toggleMappingConfirm,
    changeMappingTarget,
    toggleMappingExcluded,
    excludeAllUnmapped,
    goToStep3,
    chatMessages,
    chatInput,
    setChatInput,
    handleClarifyAnswer,
    chatTyping,
    currentSuggested,
    chatEndRef,
    clarifyDone,
    clarifying,
    composerColumns,
    setComposerColumns,
    composerData,
    reportName,
    setReportName,
    pubTier,
    setPubTier,
    scheduleEnabled,
    setScheduleEnabled,
    scheduleFreq,
    setScheduleFreq,
    scheduleDay,
    setScheduleDay,
    scheduleTime,
    setScheduleTime,
    scheduleRecipients,
    setScheduleRecipients,
    teamEmails,
    setTeamEmails,
    orgAccess,
    setOrgAccess,
    certificationReason,
    setCertificationReason,
    certificationChecked,
    setCertificationChecked,
    saved,
    saving,
    saveError,
    handleSave,
  };
}
