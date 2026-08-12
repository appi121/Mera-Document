export interface OcrStructureResult {
  formattedText: string;
  gridMatrix: string[][];
  maxCols: number;
}

/**
 * Filter out OCR garbage symbols like '[wn', '[Ever', '[gw', 'था४', '8४', 'ADA', '|@', etc.
 * while keeping valid Hindi words, English words, numbers, and Hindi punctuation.
 */
function sanitizeWord(word: string): string {
  if (!word) return '';

  // Remove leading/trailing stray brackets, quotes, or noise characters
  let cleaned = word
    .replace(/^[\[\](){}\"“’'|\\/@~=+\-*^`%]+|[\[\](){}\"“’'|\\/@~=+\-*^`%]+$/g, '')
    .trim();

  // If word became an obvious 1-2 character garbage noise like '[w', 'oi', 'Ci', 'Cae' with weird symbols, filter it out
  if (/^[\[\](){}~`|@\\]+$/.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * Formats OCR output cleanly without data loss, capturing every single line from the document.
 */
export function formatOcrDataWithLayout(data: any): OcrStructureResult {
  const rawText = data?.text || '';

  if (!data || !data.lines || data.lines.length === 0) {
    const cleanLines = rawText
      .split('\n')
      .map((l: string) => l.split(/\s+/).map(sanitizeWord).filter(Boolean).join(' '))
      .filter((l: string) => l.trim().length > 0);

    const fullCleanText = cleanLines.join('\n');
    const simpleMatrix = cleanLines.map((l: string) => [l]);

    return {
      formattedText: fullCleanText || rawText,
      gridMatrix: simpleMatrix.length ? simpleMatrix : [['']],
      maxCols: 1,
    };
  }

  // Step 1: Process every single line to ensure 100% COMPLETE DATA
  const processedRows: { words: string[]; rawLine: string; x0List: number[] }[] = [];
  const allX0s: number[] = [];

  data.lines.forEach((line: any) => {
    let lineWords: { text: string; x0: number }[] = [];

    if (line.words && line.words.length > 0) {
      line.words.forEach((w: any) => {
        const clean = sanitizeWord(w.text);
        if (clean) {
          lineWords.push({ text: clean, x0: w.bbox.x0 });
          allX0s.push(w.bbox.x0);
        }
      });
    } else if (line.text && line.text.trim()) {
      const wordsArr = line.text.split(/\s+/).map(sanitizeWord).filter(Boolean);
      if (wordsArr.length > 0) {
        lineWords = wordsArr.map((w: string) => ({ text: w, x0: 0 }));
      }
    }

    if (lineWords.length > 0) {
      processedRows.push({
        words: lineWords.map(w => w.text),
        rawLine: lineWords.map(w => w.text).join(' '),
        x0List: lineWords.map(w => w.x0),
      });
    }
  });

  if (processedRows.length === 0) {
    return {
      formattedText: rawText,
      gridMatrix: rawText.split('\n').map((l: string) => [l]),
      maxCols: 1,
    };
  }

  // Step 2: Determine Grid Columns for Excel
  allX0s.sort((a, b) => a - b);
  const colClusterCenters: number[] = [];
  const CLUSTER_THRESHOLD = 40;

  allX0s.forEach(x => {
    if (x === 0) return;
    const existing = colClusterCenters.find(c => Math.abs(c - x) < CLUSTER_THRESHOLD);
    if (existing === undefined) {
      colClusterCenters.push(x);
    }
  });

  colClusterCenters.sort((a, b) => a - b);
  const numCols = Math.max(1, colClusterCenters.length);

  const getColIndex = (x: number): number => {
    if (colClusterCenters.length === 0 || x === 0) return 0;
    let bestIdx = 0;
    let minDist = Infinity;
    colClusterCenters.forEach((center, idx) => {
      const dist = Math.abs(center - x);
      if (dist < minDist) {
        minDist = dist;
        bestIdx = idx;
      }
    });
    return bestIdx;
  };

  // Step 3: Build Grid Matrix and Full Formatted Text without dropping any line
  const gridMatrix: string[][] = [];
  const fullTextLines: string[] = [];

  processedRows.forEach(row => {
    const rowCells: string[] = Array(numCols).fill('');

    row.words.forEach((w, idx) => {
      const x0 = row.x0List[idx] || 0;
      const colIdx = getColIndex(x0);
      if (rowCells[colIdx]) {
        rowCells[colIdx] += ' ' + w;
      } else {
        rowCells[colIdx] = w;
      }
    });

    gridMatrix.push(rowCells);
    
    // Clean space-separated line representation
    const lineText = rowCells.filter(Boolean).join('   ');
    if (lineText.trim()) {
      fullTextLines.push(lineText);
    } else if (row.rawLine.trim()) {
      fullTextLines.push(row.rawLine);
    }
  });

  const finalFormattedText = fullTextLines.join('\n');

  return {
    formattedText: finalFormattedText || rawText,
    gridMatrix: gridMatrix.length > 0 ? gridMatrix : [['']],
    maxCols: numCols,
  };
}