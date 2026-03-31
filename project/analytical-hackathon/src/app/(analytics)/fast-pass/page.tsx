"use client";

import { useRouter } from "next/navigation";
import { StepConversation } from "./_components/step-conversation";
import { StepIndicator } from "./_components/step-indicator";
import { StepMapping } from "./_components/step-mapping";
import { StepPreview } from "./_components/step-preview";
import { StepSave } from "./_components/step-save";
import { StepUpload } from "./_components/step-upload";
import { useFastPass } from "./_components/use-fast-pass";

export default function FastPassPage() {
  const router = useRouter();
  const {
    step,
    setStep,
    uploading,
    uploadResult,
    uploadError,
    dragOver,
    setDragOver,
    handleFileDrop,
    handleFileSelect,
    fileInputRef,
    replaceFile,
    reparseUploadedFile,
    mappings,
    allConfirmed,
    mapping,
    retryMapping,
    metricCategories,
    confirmAllHighConfidence,
    toggleMappingConfirm,
    changeMappingTarget,
    toggleMappingExcluded,
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
    saved,
    saving,
    saveError,
    handleSave,
  } = useFastPass();

  return (
    <div className="min-h-screen bg-[#faf7f4] p-8">
      <div className="max-w-5xl mx-auto">
        <StepIndicator currentStep={step} />

        <div className="mt-8">
          {step === 1 && (
            <StepUpload
              uploading={uploading}
              uploadResult={uploadResult}
              uploadError={uploadError}
              dragOver={dragOver}
              setDragOver={setDragOver}
              onDrop={handleFileDrop}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              onReplaceFile={replaceFile}
              onSheetChange={(sheetName) => reparseUploadedFile({ sheetName })}
              onHeaderRowSelect={(headerRowIdx) =>
                reparseUploadedFile({
                  sheetName: uploadResult?.targetSheet,
                  headerRowIdx,
                })
              }
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepMapping
              mappings={mappings}
              allConfirmed={allConfirmed}
              loading={mapping}
              metricCategories={metricCategories}
              onConfirmAll={confirmAllHighConfidence}
              onToggleConfirm={toggleMappingConfirm}
              onMappingChange={changeMappingTarget}
              onToggleExclude={toggleMappingExcluded}
              onRetry={retryMapping}
              onNext={goToStep3}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepConversation
              messages={chatMessages}
              input={chatInput}
              onInputChange={setChatInput}
              onSend={() => handleClarifyAnswer(chatInput)}
              onSuggestedClick={(answer) => handleClarifyAnswer(answer)}
              typing={chatTyping}
              suggestedAnswer={currentSuggested || ""}
              chatEndRef={chatEndRef}
              mappings={mappings}
              done={clarifyDone}
              loading={clarifying}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <StepPreview
              columns={composerColumns}
              data={composerData}
              mappings={mappings}
              onColumnToggle={(key) =>
                setComposerColumns((prev) =>
                  prev.map((c) =>
                    c.key === key ? { ...c, visible: !c.visible } : c,
                  ),
                )
              }
              onNext={() => setStep(5)}
              onBack={() => setStep(step > 3 ? 3 : 2)}
            />
          )}

          {step === 5 && (
            <StepSave
              reportName={reportName}
              setReportName={setReportName}
              pubTier={pubTier}
              setPubTier={setPubTier}
              scheduleEnabled={scheduleEnabled}
              setScheduleEnabled={setScheduleEnabled}
              scheduleFreq={scheduleFreq}
              setScheduleFreq={setScheduleFreq}
              scheduleDay={scheduleDay}
              setScheduleDay={setScheduleDay}
              scheduleTime={scheduleTime}
              setScheduleTime={setScheduleTime}
              scheduleRecipients={scheduleRecipients}
              setScheduleRecipients={setScheduleRecipients}
              saved={saved}
              saving={saving}
              saveError={saveError}
              onSave={handleSave}
              onBack={() => setStep(4)}
              onGoToWorkspace={() => router.push("/workspace")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
