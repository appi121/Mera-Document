/**
 * Mera Document Universal AI Intelligence Engine
 * Automatically detects document intent, corrects Devanagari OCR glyphs,
 * reconstructs multi-column tables, centers slogans & headings, and locks official formatting.
 */

export interface ProcessedDocumentResult {
  docType: 'table' | 'letter' | 'slogans' | 'report' | 'general';
  formattedText: string;
  gridMatrix: string[][];
  hasTable: boolean;
  wordCount: number;
}

// Common Devanagari OCR broken character & spelling dictionary
const DEVANAGARI_REPAIR_MAP: Record<string, string> = {
  'भागसर': 'भागसुर',
  'चौक': 'चौकी',
  'कायलय': 'कार्यालय',
  'कायलि': 'कार्यालय',
  'दतावेज़': 'दस्तावेज़',
  'दस्तावेज': 'दस्तावेज़',
  'क्रमाक': 'क्रमांक',
  'अनुक्रमाक': 'अनुक्रमांक',
  'महोद्य': 'महोदय',
  'महदय': 'महोदय',
  'भवदय': 'भवदीय',
  'भवदीया': 'भवदीय',
  'हस्ताक्षर': 'हस्ताक्षर',
  'हस्ताक्षरार्थ': 'हस्ताक्षरार्थ',
  'अवलाकनार्थ': 'अवलोकनार्थ',
  'अनमोदनाथ': 'अनुमोदनार्थ',
  'सप्रमाण': 'सप्रमाण',
  'सामाग्री': 'सामग्री',
  'उपयोगी सामाग्री': 'उपयोगी सामग्री',
  'व्या.शिक्षा': 'व्यावसायिक शिक्षा',
  'पदोन्नती': 'पदोन्नति',
  'अभ्युक्तिया': 'अभ्युक्तियां',
  'अभ्युक्तियां': 'अभ्युक्तियां',
  'प्रधानाध्यापक': 'प्रधानाध्यापक',
  'स्नातकात्तर': 'स्नातकोत्तर',
  'स्वतंत्रता दिवस': 'स्वतंत्रता दिवस',
  'स्लोगन': 'स्लोगन',
  'जय जवान जय किसान': 'जय जवान, जय किसान',
  'सत्यमेव जयते': 'सत्यमेव जयते',
};

/**
 * Repairs broken Devanagari glyphs, matras, halants and punctuation
 */
export function repairDevanagariText(input: string): string {
  if (!input) return '';
  let output = input;

  // Apply lexicon repairs
  Object.entries(DEVANAGARI_REPAIR_MAP).forEach(([wrong, right]) => {
    const reg = new RegExp(wrong, 'g');
    output = output.replace(reg, right);
  });

  // Clean redundant pipes or OCR garbage characters
  output = output
    .replace(/[—_]{3,}/g, '--------------------------------')
    .replace(/(\n\s*){3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ');

  return output.trim();
}

/**
 * Detects if a line or segment represents a table row
 */
export function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.includes('|') || trimmed.includes('\t')) return true;
  
  // Multiple distinct columnar spaces
  const parts = trimmed.split(/\s{3,}/).filter(Boolean);
  return parts.length >= 2;
}

/**
 * Intelligent Universal Document Processor:
 * Analyzes structure, reconstructs tables, and standardizes layout.
 */
export function processDocumentIntelligently(rawContent: string): ProcessedDocumentResult {
  const repaired = repairDevanagariText(rawContent || '');
  const lines = repaired.split('\n');

  let tableRowCount = 0;
  let hasPoetryOrSlogans = false;
  let hasGovtHeader = false;
  const gridMatrix: string[][] = [];

  // Analyze lines
  lines.forEach(line => {
    const tr = line.trim();
    if (isTableRow(line)) {
      tableRowCount++;
      const cells = line.split(/[\t|]/).map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        gridMatrix.push(cells);
      }
    }
    if (/^(स्लोगन|नारे|स्वतंत्रता दिवस|वंदे मातरम|इंकलाब|जय हिन्द)/i.test(tr) || (tr.startsWith('"') && tr.endsWith('"'))) {
      hasPoetryOrSlogans = true;
    }
    if (/^(कार्यालय|शासकीय|थाना|चौकी|विभाग|राजपत्र|अनुसूची|पदोन्नति)/i.test(tr)) {
      hasGovtHeader = true;
    }
  });

  const totalNonEmptyLines = lines.filter(l => l.trim()).length;
  const isTableDoc = tableRowCount >= 2 || (totalNonEmptyLines > 0 && tableRowCount / totalNonEmptyLines > 0.4);

  let docType: 'table' | 'letter' | 'slogans' | 'report' | 'general' = 'general';

  if (isTableDoc) {
    docType = 'table';
  } else if (hasPoetryOrSlogans) {
    docType = 'slogans';
  } else if (hasGovtHeader) {
    docType = 'letter';
  }

  // Format final document text with proper spatial alignment
  const formattedLines = lines.map(line => {
    const tr = line.trim();
    if (!tr) return '';

    // If Slogan/Poem -> enforce centered formatting
    if (docType === 'slogans' || /^(स्लोगन|नारे|स्वतंत्रता दिवस|जय जवान)/i.test(tr)) {
      return `          ${tr}          `;
    }

    // If table row -> normalize delimiters with clean pipes
    if (isTableRow(line)) {
      const parts = line.split(/[\t|]|\s{3,}/).map(p => p.trim()).filter(Boolean);
      return parts.join(' | ');
    }

    // If metadata (Date/Signature) -> right-align
    if (/^(हस्ताक्षर|भवदीय|दिनांक:|Date:|स्थान:|Place:|प्राचार्य|शाखा प्रभारी|चौकी प्रभारी)/i.test(tr)) {
      return `                                                  ${tr}`;
    }

    return tr;
  });

  const formattedText = formattedLines.join('\n');
  const words = formattedText.trim() ? formattedText.trim().split(/\s+/).length : 0;

  return {
    docType,
    formattedText,
    gridMatrix,
    hasTable: gridMatrix.length > 0,
    wordCount: words,
  };
}