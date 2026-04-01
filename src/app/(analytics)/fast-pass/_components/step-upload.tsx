import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { UploadResult } from "./types";

interface StepUploadProps {
  uploading: boolean;
  uploadResult: UploadResult | null;
  uploadError: string | null;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onReplaceFile: () => void;
  onSheetChange: (sheetName: string) => void;
  onHeaderRowSelect: (headerRowIdx: number) => void;
  onNext: () => void;
}

export function StepUpload({
  uploading,
  uploadResult,
  uploadError,
  dragOver,
  setDragOver,
  onDrop,
  onFileSelect,
  fileInputRef,
  onReplaceFile,
  onSheetChange,
  onHeaderRowSelect,
  onNext,
}: StepUploadProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const totalRows = uploadResult?.dataRows?.length || 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentRows = uploadResult?.dataRows?.slice(startIdx, endIdx) || [];

  return (
    <div className="space-y-6">
      <div
        className={`bg-white rounded-xl border border-[#e8dfd4] shadow-sm p-8 transition-colors ${
          !uploadResult ? "cursor-pointer hover:border-[#7d654e]/25" : ""
        }`}
        role="button"
        tabIndex={!uploadResult ? 0 : -1}
        onClick={() => {
          if (!uploadResult) openFilePicker();
        }}
        onKeyDown={(e) => {
          if (!uploadResult && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openFilePicker();
          }
        }}
        aria-label={!uploadResult ? "Open file upload picker" : undefined}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[#f7f3ef] flex items-center justify-center">
            <Upload size={20} className="text-[#7d654e]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a1510]">Fast Pass</h1>
            <p className="text-sm text-[#7d654e]">
              Upload any existing report and we&apos;ll replicate it with live data
            </p>
          </div>
        </div>
        <p className="text-xs text-[#7d654e] mt-3 ml-[52px]">
          Works with reports from RealPage, Yardi, Domo, or your own Excel
          spreadsheets
        </p>
      </div>

      {uploadError && (
        <div className="bg-red-50 rounded-xl border border-red-200 px-6 py-4 flex items-center gap-3">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <span className="text-sm text-red-700">{uploadError}</span>
        </div>
      )}

      {!uploadResult && (
        <div
          className={`bg-white rounded-xl border-2 border-dashed shadow-sm p-12 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-[#7d654e]/30 bg-[#f7f3ef]"
              : "border-[#e8dfd4] hover:border-[#7d654e]/20"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={openFilePicker}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.xls"
            className="hidden"
            onChange={onFileSelect}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="text-[#7d654e] animate-spin" />
              <p className="text-sm font-medium text-[#1a1510]">
                Analyzing your report...
              </p>
              <p className="text-xs text-[#7d654e]">
                Detecting columns, data types, and patterns
              </p>
              <div className="w-48 h-1.5 bg-[#e8dfd4] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[#7d654e] rounded-full animate-pulse"
                  style={{ width: "70%" }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#f7f3ef] flex items-center justify-center">
                <FileSpreadsheet size={24} className="text-[#7d654e]" />
              </div>
              <p className="text-sm font-medium text-[#1a1510]">
                Drop your report here, or click to browse
              </p>
              <p className="text-xs text-[#7d654e]">
                Accepts .xlsx, .csv, and .xls files
              </p>
            </div>
          )}
        </div>
      )}

      {uploadResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="font-medium text-[#1a1510]">
              {uploadResult.fileName}
            </span>
            <span className="text-xs text-[#7d654e]">
              — {uploadResult.rowCount} rows, {uploadResult.columnCount} columns
              detected
            </span>
            <button
              type="button"
              onClick={onReplaceFile}
              className="ml-auto text-xs font-medium text-[#7d654e] hover:text-[#1a1510] underline underline-offset-2"
            >
              Replace file
            </button>
          </div>

          {uploadResult.sheetNames.length > 1 && (
            <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm p-4">
              <label className="block text-xs font-semibold text-[#1a1510] mb-1.5">
                Worksheet
              </label>
              <select
                value={uploadResult.targetSheet}
                onChange={(e) => onSheetChange(e.target.value)}
                className="w-full max-w-xs text-sm text-[#1a1510] bg-white border border-[#e8dfd4] rounded-lg px-3 py-2 outline-none focus:border-[#7d654e]"
              >
                {uploadResult.sheetNames.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-[#7d654e]">
                Select the sheet that contains your report table.
              </p>
            </div>
          )}

          {uploadResult.previewRows.length > 0 && (
            <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-[#1a1510]">
                  Confirm header row
                </span>
                <span className="text-xs text-[#7d654e]">
                  Click a row to use as headers
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-[#f0e9e0]">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-[#f0e9e0]">
                    {uploadResult.previewRows.map((row, idx) => (
                      <tr
                        key={`preview-row-${idx}`}
                        onClick={() => onHeaderRowSelect(idx)}
                        className={`cursor-pointer transition-colors ${
                          idx === uploadResult.headerRowIdx
                            ? "bg-amber-50"
                            : "hover:bg-[#f7f3ef]"
                        }`}
                      >
                        <td className="w-10 px-2 py-1.5 text-[#7d654e] text-right align-top">
                          {idx + 1}
                        </td>
                        {(row as unknown[]).slice(0, 8).map((cell, cIdx) => (
                          <td
                            key={`preview-cell-${idx}-${cIdx}`}
                            className="px-2 py-1.5 text-[#1a1510] whitespace-nowrap"
                          >
                            {cell != null && String(cell).trim() ? String(cell) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#faf7f4]">
                    {uploadResult.headers.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2.5 text-[10px] uppercase tracking-wider text-[#7d654e] font-semibold text-left whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e9e0]">
                  {currentRows.map((row, rowIdx) => (
                    <tr key={startIdx + rowIdx} className="hover:bg-[#f7f3ef] transition-colors">
                      {uploadResult.headers.map((col, colIdx) => (
                        <td
                          key={`${rowIdx}-${colIdx}`}
                          className={`px-3 py-2 whitespace-nowrap ${
                            colIdx === 0
                              ? "text-[#1a1510] font-medium"
                              : "text-[#1a1510] tabular-nums"
                          } ${typeof row[col] === "number" ? "text-right" : "text-left"}`}
                        >
                          {row[col] != null ? String(row[col]) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8dfd4]">
                <div className="text-xs text-[#7d654e]">
                  Showing {startIdx + 1} to {Math.min(endIdx, totalRows)} of {totalRows} rows
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#7d654e] text-white"
                              : "text-[#7d654e] hover:bg-[#f7f3ef]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7d654e] text-white text-sm font-medium rounded-lg hover:bg-[#6b5642] transition-colors"
            >
              Map Columns
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
