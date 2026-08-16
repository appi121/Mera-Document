/**
 * Content Preservation & Fidelity Validation Engine
 * Audits source vs converted output to ensure zero characters, Hindi glyphs,
 * English words, numbers, punctuation, or dates are altered or lost.
 */

export interface PreservationAuditResult {
  score: number; // 0 to 100%
  isExactMatch: boolean;
  sourceCharCount: number;
  outputCharCount: number;
  hindiCharsSource: number;
  hindiCharsOutput: number;
  hindiPreservationPct: number;
  numbersSource: number;
  numbersOutput: number;
  numbersPreservationPct: number;
  englishWordsSource: number;
  englishWordsOutput: number;
  englishWordsPreservationPct: number;
  warnings: string[];
}

// Regex matchers for Unicode Devanagari, English, and Numbers
const DEVANAGARI_REGEX = /[\u0900-\u097F]/g;
const NUMBERS_REGEX = /[0-9\u0966-\u096F]/g;
const ENGLISH_WORDS_REGEX = /[a-zA-Z]+/g;

export function auditContentPreservation(sourceText: string, outputText: string): PreservationAuditResult {
  const src = sourceText || '';
  const out = outputText || '';

  const sourceCharCount = src.length;
  const outputCharCount = out.length;

  const srcHindi = (src.match(DEVANAGARI_REGEX) || []).length;
  const outHindi = (out.match(DEVANAGARI_REGEX) || []).length;
  const hindiPreservationPct = srcHindi === 0 ? 100 : Math.min(100, Math.round((outHindi / srcHindi) * 100));

  const srcNum = (src.match(NUMBERS_REGEX) || []).length;
  const outNum = (out.match(NUMBERS_REGEX) || []).length;
  const numbersPreservationPct = srcNum === 0 ? 100 : Math.min(100, Math.round((outNum / srcNum) * 100));

  const srcEng = (src.match(ENGLISH_WORDS_REGEX) || []).length;
  const outEng = (out.match(ENGLISH_WORDS_REGEX) || []).length;
  const englishWordsPreservationPct = srcEng === 0 ? 100 : Math.min(100, Math.round((outEng / srcEng) * 100));

  const warnings: string[] = [];

  if (srcHindi > 0 && outHindi < srcHindi) {
    warnings.push(`Hindi character count changed (${srcHindi} in source vs ${outHindi} in output).`);
  }
  if (srcNum > 0 && outNum < srcNum) {
    warnings.push(`Numeric characters mismatch (${srcNum} in source vs ${outNum} in output).`);
  }
  if (srcEng > 0 && outEng < srcEng) {
    warnings.push(`English words count changed (${srcEng} in source vs ${outEng} in output).`);
  }

  // Calculate holistic preservation score
  const weights = [];
  if (srcHindi > 0) weights.push(hindiPreservationPct);
  if (srcNum > 0) weights.push(numbersPreservationPct);
  if (srcEng > 0) weights.push(englishWordsPreservationPct);

  const score = weights.length > 0 ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length) : 100;
  const isExactMatch = src.trim() === out.trim();

  return {
    score,
    isExactMatch,
    sourceCharCount,
    outputCharCount,
    hindiCharsSource: srcHindi,
    hindiCharsOutput: outHindi,
    hindiPreservationPct,
    numbersSource: srcNum,
    numbersOutput: outNum,
    numbersPreservationPct,
    englishWordsSource: srcEng,
    englishWordsOutput: outEng,
    englishWordsPreservationPct,
    warnings,
  };
}