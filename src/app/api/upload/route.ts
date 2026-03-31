import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import * as XLSX from "xlsx";

function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function looksLikeHeaderLabel(cell: string): boolean {
  const normalized = cell.toLowerCase().replace(/[^a-z]/g, "");
  return (
    normalized === "fields" ||
    normalized === "columnincsv" ||
    normalized === "metadatatype"
  );
}

function rowHeaderScore(row: unknown[]): number {
  const normalizedCells = row
    .map((cell) => normalizeCell(cell))
    .filter((cell) => cell.length > 0);
  if (normalizedCells.length === 0) return -1000;

  const textLikeCount = normalizedCells.filter((cell) => Number.isNaN(Number(cell))).length;
  const shortCellCount = normalizedCells.filter((cell) => cell.length <= 60).length;
  const firstCell = normalizedCells[0] || "";
  const firstCellBonus = looksLikeHeaderLabel(firstCell) ? 40 : 0;
  const firstCellPenalty =
    /^description$|^\*required$|^accepted values$|^able to update once migrated\??$/i.test(
      firstCell,
    )
      ? 30
      : 0;

  // Prefer rows that look like concise labels, not long descriptive content rows.
  return (
    normalizedCells.length * 3 +
    textLikeCount * 2 +
    shortCellCount +
    firstCellBonus -
    firstCellPenalty
  );
}

function makeUniqueHeaders(rawHeaders: string[]): string[] {
  const seen = new Map<string, number>();
  return rawHeaders.map((header, idx) => {
    const base = header || `Column ${idx + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const selectedSheet = formData.get("sheetName");
    const selectedHeaderRow = formData.get("headerRowIdx");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const workbook = XLSX.read(bytes, { type: "array" });
    const sheetNames = workbook.SheetNames;

    const targetSheet =
      typeof selectedSheet === "string" && sheetNames.includes(selectedSheet)
        ? selectedSheet
        : sheetNames[0];
    const worksheet = workbook.Sheets[targetSheet];
    if (!worksheet) {
      return NextResponse.json(
        { error: "Selected worksheet not found" },
        { status: 400 },
      );
    }
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    }) as unknown[][];
    if (!jsonData.length) {
      return NextResponse.json(
        { error: "Selected sheet is empty" },
        { status: 400 },
      );
    }

    let detectedHeaderRowIdx = 0;
    let bestScore = -1000;
    for (let i = 0; i < Math.min(50, jsonData.length); i++) {
      const row = jsonData[i] as unknown[];
      const score = rowHeaderScore(row || []);
      if (score > bestScore) {
        bestScore = score;
        detectedHeaderRowIdx = i;
      }
    }
    const requestedHeaderRowIdx =
      typeof selectedHeaderRow === "string" && selectedHeaderRow.trim() !== ""
        ? Number(selectedHeaderRow)
        : NaN;
    const headerRowIdx =
      Number.isInteger(requestedHeaderRowIdx) &&
      requestedHeaderRowIdx >= 0 &&
      requestedHeaderRowIdx < jsonData.length
        ? requestedHeaderRowIdx
        : detectedHeaderRowIdx;

    const headerCells = (jsonData[headerRowIdx] as unknown[]) || [];
    let normalizedHeaderCells = headerCells.map((h) => normalizeCell(h));
    let effectiveHeaderRowIdx = headerRowIdx;

    // If auto-detected row is empty, recover by scanning for the next best non-empty row.
    if (
      !Number.isInteger(requestedHeaderRowIdx) &&
      normalizedHeaderCells.filter(Boolean).length === 0
    ) {
      let fallbackIdx = headerRowIdx;
      let fallbackScore = -1000;
      for (let i = 0; i < Math.min(100, jsonData.length); i++) {
        const row = (jsonData[i] as unknown[]) || [];
        const score = rowHeaderScore(row);
        if (score > fallbackScore) {
          fallbackScore = score;
          fallbackIdx = i;
        }
      }
      effectiveHeaderRowIdx = fallbackIdx;
      normalizedHeaderCells = (((jsonData[fallbackIdx] as unknown[]) || []) as unknown[]).map(
        (h) => normalizeCell(h),
      );
    }

    const nonEmptyHeaders = normalizedHeaderCells.filter(Boolean);
    const widestRowLength = jsonData.reduce(
      (max, row) => Math.max(max, (row as unknown[])?.length || 0),
      0,
    );
    const fallbackHeaderCount = Math.max(widestRowLength, 1);
    const headers = makeUniqueHeaders(
      nonEmptyHeaders.length > 0
        ? normalizedHeaderCells.slice(0, Math.max(normalizedHeaderCells.length, 1))
        : Array.from({ length: fallbackHeaderCount }, (_, i) => `Column ${i + 1}`),
    );
    const previewRows = jsonData.slice(0, Math.min(15, jsonData.length));

    const dataRows = jsonData
      .slice(effectiveHeaderRowIdx + 1, effectiveHeaderRowIdx + 21)
      .map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          obj[h] = (row as unknown[])?.[i] ?? null;
        });
        return obj;
      })
      .filter((row) =>
        Object.values(row).some(
          (v) => v !== null && v !== undefined && normalizeCell(v) !== "",
        ),
      );

    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: fileName,
      sheetNames,
      targetSheet,
      detectedHeaderRowIdx,
      headerRowIdx: effectiveHeaderRowIdx,
      previewRows,
      headers,
      dataRows,
      rowCount: Math.max(jsonData.length - effectiveHeaderRowIdx - 1, 0),
      columnCount: headers.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process uploaded file" },
      { status: 500 },
    );
  }
}
