"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/analytics/page-header";
import {
  Upload,
  FileSpreadsheet,
  Check,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_GL_ROWS = [
  { glCode: "4000", description: "Rental Income", period: "2025-12", amount: 345_000.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "4100", description: "Other Income", period: "2025-12", amount: 28_500.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "5000", description: "Payroll", period: "2025-12", amount: -89_200.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "5100", description: "Repairs & Maint", period: "2025-12", amount: -34_800.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "5200", description: "Utilities", period: "2025-12", amount: -22_100.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "5300", description: "Insurance", period: "2025-12", amount: -12_500.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "5400", description: "Property Taxes", period: "2025-12", amount: -45_600.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "5500", description: "Management Fee", period: "2025-12", amount: -17_250.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "6000", description: "Capital Expenditure", period: "2025-12", amount: -28_000.0, propertyCode: "PROP-SE-001", entity: "Southeast Fund" },
  { glCode: "4000", description: "Rental Income", period: "2025-12", amount: 198_000.0, propertyCode: "PROP-SE-002", entity: "Southeast Fund" },
];

const COLUMN_MAPPINGS = [
  { source: "GL Code", target: "GL Account", confidence: 97, status: "matched" as const },
  { source: "GL Description", target: "Description", confidence: 95, status: "matched" as const },
  { source: "Period", target: "Fiscal Period", confidence: 99, status: "matched" as const },
  { source: "Amount", target: "Amount", confidence: 99, status: "matched" as const },
  { source: "Property Code", target: "Property", confidence: 88, status: "review" as const },
  { source: "Entity", target: "Ownership Entity", confidence: 82, status: "review" as const },
];

const TARGET_FIELDS = [
  "GL Account",
  "Description",
  "Fiscal Period",
  "Amount",
  "Property",
  "Ownership Entity",
  "Cost Center",
  "Fund",
  "Intercompany",
];

const GL_CODE_MAPPINGS = [
  { code: "4000", label: "Rental Income", canonical: "Revenue > Rental Revenue", confidence: 99 },
  { code: "4100", label: "Other Income", canonical: "Revenue > Other Revenue", confidence: 95 },
  { code: "5000", label: "Payroll", canonical: "Expense > Controllable > Payroll", confidence: 97 },
  { code: "5100", label: "Repairs & Maint", canonical: "Expense > Controllable > Repairs & Maintenance", confidence: 96 },
  { code: "5200", label: "Utilities", canonical: "Expense > Controllable > Utilities", confidence: 98 },
  { code: "5300", label: "Insurance", canonical: "Expense > Non-Controllable > Insurance", confidence: 93 },
  { code: "5400", label: "Property Taxes", canonical: "Expense > Non-Controllable > Property Taxes", confidence: 98 },
  { code: "5500", label: "Management Fee", canonical: "Expense > Non-Controllable > Management Fee", confidence: 91 },
  { code: "6000", label: "Capital Expenditure", canonical: "Capital > Building Improvements", confidence: 85 },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Column Mapping" },
  { number: 3, label: "GL Codes" },
  { number: 4, label: "Review" },
];

function StepIndicator({ current, completed }: { current: number; completed: number[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const isCompleted = completed.includes(step.number);
        const isCurrent = current === step.number;
        return (
          <div key={step.number} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  isCompleted
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : isCurrent
                      ? "bg-[#eddece] text-[#7d654e] border border-[#7d654e]/30"
                      : "bg-[#f7f3ef] text-[#7d654e]/60 border border-[#e8dfd4]",
                )}
              >
                {isCompleted ? <Check size={14} /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCurrent ? "text-[#1a1510]" : isCompleted ? "text-emerald-600" : "text-[#7d654e]/60",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-12 h-px mx-1",
                  completed.includes(step.number) ? "bg-emerald-300" : "bg-[#e8dfd4]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Upload ───────────────────────────────────────────────────────────

function StepUpload({ onNext }: { onNext: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = useCallback(() => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1000);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleUpload();
    },
    [handleUpload],
  );

  if (uploaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <div>
            <div className="text-sm font-medium text-emerald-600">
              yardi_gl_export_q4_2025.csv
            </div>
            <div className="text-xs text-[#7d654e]">
              10 rows · 6 columns · 1.2 KB
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#e8dfd4]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#f7f3ef]">
                {["GL Code", "Description", "Period", "Amount", "Property Code", "Entity"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold py-2.5 px-3 text-left"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {MOCK_GL_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    "transition-colors",
                    i % 2 === 1 && "bg-[#f7f3ef]",
                  )}
                >
                  <td className="py-2 px-3 text-[#1a1510] font-mono">{row.glCode}</td>
                  <td className="py-2 px-3 text-[#1a1510]">{row.description}</td>
                  <td className="py-2 px-3 text-[#1a1510] font-mono">{row.period}</td>
                  <td className="py-2 px-3 text-[#1a1510] font-mono tabular-nums text-right">
                    {row.amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                  <td className="py-2 px-3 text-[#1a1510] font-mono">{row.propertyCode}</td>
                  <td className="py-2 px-3 text-[#1a1510]">{row.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#7d654e] hover:bg-[#7d654e]/90 rounded-lg transition-colors"
          >
            Map Columns
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center transition-colors",
          isDragging
            ? "border-[#7d654e]/50 bg-[#7d654e]/5"
            : "border-[#e8dfd4] hover:border-[#7d654e]/30",
        )}
      >
        {uploading ? (
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#7d654e] border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-[#7d654e]">Processing file…</p>
          </div>
        ) : (
          <>
            <Upload size={32} className="text-[#7d654e]/60 mx-auto mb-3" />
            <p className="text-sm text-[#1a1510] mb-1">
              Drag and drop your file here
            </p>
            <p className="text-xs text-[#7d654e]/60 mb-4">
              Accepted formats: CSV, Excel (.xlsx, .xls)
            </p>
            <button
              onClick={handleUpload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1a1510] bg-[#f7f3ef] hover:bg-[#eddece] border border-[#e8dfd4] rounded-lg transition-colors"
            >
              <FileSpreadsheet size={15} />
              Browse Files
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Column Mapping ───────────────────────────────────────────────────

function StepColumnMapping({ onNext }: { onNext: () => void }) {
  const [mappings, setMappings] = useState(COLUMN_MAPPINGS);

  function updateMapping(index: number, target: string) {
    setMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, target, confidence: 100, status: "matched" as const } : m)),
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#e8dfd4] overflow-hidden">
        <div className="grid grid-cols-[1fr,auto,1fr,auto,auto] gap-0 items-center px-4 py-3 bg-[#f7f3ef] border-b border-[#e8dfd4]">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold">
            Source Column
          </div>
          <div />
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold">
            Target Field
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold text-center px-3">
            Confidence
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold text-center px-3">
            Status
          </div>
        </div>
        {mappings.map((mapping, i) => (
          <div
            key={mapping.source}
            className={cn(
              "grid grid-cols-[1fr,auto,1fr,auto,auto] gap-0 items-center px-4 py-3",
              i % 2 === 1 && "bg-[#f7f3ef]",
            )}
          >
            <div className="text-sm text-[#1a1510] font-medium">
              {mapping.source}
            </div>
            <ArrowRight size={14} className="text-[#7d654e]/60 mx-3" />
            <select
              value={mapping.target}
              onChange={(e) => updateMapping(i, e.target.value)}
              className="bg-white border border-[#e8dfd4] rounded-lg text-sm text-[#1a1510] px-3 py-1.5 outline-none focus:border-[#7d654e]/40 transition-colors appearance-none cursor-pointer"
            >
              {TARGET_FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <div className="text-center px-3">
              <ConfidenceBadge score={mapping.confidence} />
            </div>
            <div className="text-center px-3">
              {mapping.status === "matched" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <Sparkles size={9} />
                  AI Matched
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  <AlertTriangle size={9} />
                  Needs Review
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#7d654e] hover:bg-[#7d654e]/90 rounded-lg transition-colors"
        >
          Map GL Codes
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: GL Code Mapping ──────────────────────────────────────────────────

function StepGLCodes({ onNext }: { onNext: () => void }) {
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  function toggleConfirm(code: string) {
    setConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function confirmAll() {
    setConfirmed(new Set(GL_CODE_MAPPINGS.map((m) => m.code)));
  }

  const allConfirmed = confirmed.size === GL_CODE_MAPPINGS.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7d654e]">
          {confirmed.size} of {GL_CODE_MAPPINGS.length} GL codes confirmed
        </p>
        <button
          onClick={confirmAll}
          disabled={allConfirmed}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            allConfirmed
              ? "text-[#7d654e]/60 bg-[#f7f3ef] cursor-not-allowed"
              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200",
          )}
        >
          <Sparkles size={12} />
          Confirm All AI Suggestions
        </button>
      </div>

      <div className="rounded-xl border border-[#e8dfd4] overflow-hidden">
        <div className="grid grid-cols-[auto,1fr,auto,1fr,auto,auto] gap-0 items-center px-4 py-3 bg-[#f7f3ef] border-b border-[#e8dfd4]">
          <div className="pr-3" />
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold">
            Source GL Code
          </div>
          <div />
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold">
            Canonical Category
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold text-center px-3">
            Confidence
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold text-center px-3">
            Status
          </div>
        </div>
        {GL_CODE_MAPPINGS.map((mapping, i) => {
          const isConfirmed = confirmed.has(mapping.code);
          return (
            <div
              key={`${mapping.code}-${i}`}
              className={cn(
                "grid grid-cols-[auto,1fr,auto,1fr,auto,auto] gap-0 items-center px-4 py-3",
                i % 2 === 1 && "bg-[#f7f3ef]",
              )}
            >
              <div className="pr-3">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={() => toggleConfirm(mapping.code)}
                  className="w-4 h-4 rounded border-[#e8dfd4] bg-white accent-[#7d654e] cursor-pointer"
                />
              </div>
              <div>
                <span className="text-sm font-mono text-[#1a1510]">
                  {mapping.code}
                </span>
                <span className="text-sm text-[#7d654e] ml-2">
                  — {mapping.label}
                </span>
              </div>
              <ArrowRight size={14} className="text-[#7d654e]/60 mx-3" />
              <div className="text-sm text-[#1a1510] font-medium">
                {mapping.canonical}
              </div>
              <div className="text-center px-3">
                <ConfidenceBadge score={mapping.confidence} />
              </div>
              <div className="text-center px-3">
                {isConfirmed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <CheckCircle2 size={12} />
                    Confirmed
                  </span>
                ) : (
                  <span className="text-[10px] text-[#7d654e]/60">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#7d654e] hover:bg-[#7d654e]/90 rounded-lg transition-colors"
        >
          Review Import
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Review & Import ──────────────────────────────────────────────────

function StepReview() {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  function handleImport() {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImported(true);
    }, 1500);
  }

  if (imported) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1a1510] mb-1">
            Import Complete
          </h3>
          <p className="text-sm text-[#7d654e]">
            10 rows imported successfully into the semantic layer.
          </p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#7d654e] hover:text-[#1a1510] transition-colors"
        >
          View in blended reports
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  const validations = [
    { label: "Balance check: Debits = Credits", pass: true },
    { label: "Property matching: 3/3 properties matched", pass: true },
    { label: "Period alignment: Q4 2025", pass: true },
    { label: "GL code coverage: 9/9 codes mapped", pass: true },
  ];

  const warnings = [
    "Capital Expenditure (6000) mapped with 85% confidence — verify classification",
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Rows", value: "10" },
          { label: "Columns", value: "6" },
          { label: "GL Codes", value: "9 mapped" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[#e8dfd4] bg-white p-4 text-center shadow-sm"
          >
            <div className="text-xl font-bold text-[#1a1510]">{stat.value}</div>
            <div className="text-xs text-[#7d654e]/60 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Validation results */}
      <div className="rounded-xl border border-[#e8dfd4] bg-white p-5 space-y-3 shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold mb-2">
          Validation Results
        </div>
        {validations.map((v) => (
          <div key={v.label} className="flex items-center gap-2.5">
            <CheckCircle2
              size={15}
              className={v.pass ? "text-emerald-600" : "text-rose-500"}
            />
            <span className="text-sm text-[#1a1510]">{v.label}</span>
            <span className="text-xs text-emerald-600 ml-auto">✓</span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          {warnings.map((w) => (
            <div key={w} className="flex items-start gap-2.5">
              <AlertTriangle
                size={14}
                className="text-amber-600 mt-0.5 shrink-0"
              />
              <span className="text-sm text-amber-700">{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleImport}
          disabled={importing}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors",
            importing
              ? "text-[#7d654e]/60 bg-[#f7f3ef] cursor-not-allowed"
              : "text-white bg-[#7d654e] hover:bg-[#7d654e]/90",
          )}
        >
          {importing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-[#7d654e] border-t-transparent animate-spin" />
              Importing…
            </>
          ) : (
            <>
              <Upload size={15} />
              Import Data
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 95
      ? "text-emerald-600 bg-emerald-50"
      : score >= 80
        ? "text-amber-600 bg-amber-50"
        : "text-rose-600 bg-rose-50";

  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-mono font-medium rounded px-1.5 py-0.5",
        color,
      )}
    >
      {score}%
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DataImportPage() {
  const [step, setStep] = useState(1);
  const completedSteps = Array.from({ length: step - 1 }, (_, i) => i + 1);

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Import Data"
        description="Upload and map external data files"
      />
      <StepIndicator current={step} completed={completedSteps} />
      {step === 1 && <StepUpload onNext={() => setStep(2)} />}
      {step === 2 && <StepColumnMapping onNext={() => setStep(3)} />}
      {step === 3 && <StepGLCodes onNext={() => setStep(4)} />}
      {step === 4 && <StepReview />}
    </div>
  );
}
