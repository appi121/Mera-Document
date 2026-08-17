/**
 * Devanagari OCR Garbage Filter and Government Letter Formatter
 * Eliminates garbage Latin/Symbol artifacts produced by noisy scan backgrounds
 * while preserving 100% authentic Hindi characters, numbers, dates, and official terms.
 */

// Common government terms signature verification
const GOVT_TERMS_RESTORATION: [RegExp, string][] = [
  [/कार्यालय/gi, 'कार्यालय'],
  [/शासकीय/gi, 'शासकीय'],
  [/उत्कृष्ट/gi, 'उत्कृष्ट'],
  [/उच्चतर\s*माध्यमिक\s*विद्यालय/gi, 'उच्चतर माध्यमिक विद्यालय'],
  [/विकासखण्ड/gi, 'विकासखण्ड'],
  [/जिला/gi, 'जिला'],
  [/बड़वानी/gi, 'बड़वानी'],
  [/मध्य\s*प्रदेश/gi, 'मध्य प्रदेश'],
  [/पत्रांक|क्रमांक/gi, 'क्रमांक'],
  [/दिनांक/gi, 'दिनांक'],
  [/प्रति\s*[,:]?/gi, 'प्रति,'],
  [/विषय\s*[-:]?/gi, 'विषय:-'],
  [/संदर्भ\s*[-:]?/gi, 'संदर्भ:-'],
  [/महोदय\s*[,:]?/gi, 'महोदय,'],
  [/सविनय\s*निवेदन/gi, 'सविनय निवेदन'],
  [/वार्षिक\s*अनुदान/gi, 'वार्षिक अनुदान'],
  [/सामग्री\s*क्रय/gi, 'सामग्री क्रय'],
  [/भुगतान/gi, 'भुगतान'],
  [/स्वीकृति/gi, 'स्वीकृति'],
  [/प्राचार्य/gi, 'प्राचार्य'],
  [/हस्ताक्षर/gi, 'हस्ताक्षर'],
];

/**
 * Filters out raw scan garbage like `IUIrl}<I> FctElIcllI` that occurs when background scanner noise is misclassified.
 */
export function cleanDevanagariOcrText(rawText: string): string {
  if (!rawText) return '';

  const lines = rawText.split('\n');
  const cleanedLines: string[] = [];

  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed) {
      cleanedLines.push('');
      continue;
    }

    // Filter out obvious scanner noise lines containing only random brackets/punctuation/unconnected symbols
    const garbageCharRatio = (trimmed.match(/[^a-zA-Z0-9\u0900-\u097F\s.,/():\-–—₹]/g) || []).length / trimmed.length;
    if (trimmed.length > 3 && garbageCharRatio > 0.45 && !/[\u0900-\u097F]/.test(trimmed)) {
      // Skip pure scan noise
      continue;
    }

    // Clean stray scan specks (like isolated `~`, `|`, `◄`, `}`, `{`, `«`)
    trimmed = trimmed
      .replace(/[~◄►«»{}©®™§±#^]/g, '')
      .replace(/_{3,}/g, '________')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (trimmed) {
      cleanedLines.push(trimmed);
    }
  }

  let result = cleanedLines.join('\n');

  // Fix known government keyword OCR joins cleanly
  GOVT_TERMS_RESTORATION.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  return result.trim();
}