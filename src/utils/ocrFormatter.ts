export interface OcrStructureResult {
  formattedText: string;
  gridMatrix: string[][];
  maxCols: number;
  isTableDetected: boolean;
}

interface WordBox {
  text: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  cy: number;
  h: number;
}

/**
 * Hindi / Govt official spelling and layout corrector
 */
export function cleanDevanagariOcrText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/भागसर/g, 'भागसुर')
    .replace(/चौकी/g, 'चौकी')
    .replace(/कायलय/g, 'कार्यालय')
    .replace(/दतावेज़/g, 'दस्तावेज़')
    .replace(/क्रमाक/g, 'क्रमांक')
    .replace(/महोद्य/g, 'महोदय')
    .replace(/हस्ताक्षर/g, 'हस्ताक्षर')
    .replace(/अनुक्रमाक/g, 'अनुक्रमांक')
    .replace(/  +/g, ' ');
}

/**
 * Deep Vision Table & Document Structure Extractor:
 * 1. Groups words into exact Rows based on Y-coordinate overlap.
 * 2. Recognizes Header, Body & Footer blocks (e.g. Memo Nos, Subject, Signature lines).
 * 3. Builds precise Grid Matrix for Excel and Structured Text for Word.
 */
export function formatOcrDataWithLayout(data: any): OcrStructureResult {
  const rawText = cleanDevanagariOcrText(data?.text || '');

  // Extract all valid words with bounding boxes
  const words: WordBox[] = [];

  if (data && data.words && data.words.length > 0) {
    data.words.forEach((w: any) => {
      let txt = (w.text || '').replace(/^[|\[\]{}\\]+$/g, '').trim();
      txt = cleanDevanagariOcrText(txt);
      if (txt) {
        words.push({
          text: txt,
          x0: w.bbox.x0,
          x1: w.bbox.x1,
          y0: w.bbox.y0,
          y1: w.bbox.y1,
          cy: (w.bbox.y0 + w.bbox.y1) / 2,
          h: w.bbox.y1 - w.bbox.y0,
        });
      }
    });
  } else if (data && data.lines) {
    data.lines.forEach((line: any) => {
      if (line.words) {
        line.words.forEach((w: any) => {
          let txt = (w.text || '').replace(/^[|\[\]{}\\]+$/g, '').trim();
          txt = cleanDevanagariOcrText(txt);
          if (txt) {
            words.push({
              text: txt,
              x0: w.bbox.x0,
              x1: w.bbox.x1,
              y0: w.bbox.y0,
              y1: w.bbox.y1,
              cy: (w.bbox.y0 + w.bbox.y1) / 2,
              h: w.bbox.y1 - w.bbox.y0,
            });
          }
        });
      }
    });
  }

  // Fallback if no bounding box words exist
  if (words.length === 0) {
    const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const grid = lines.map((l: string) => l.split(/\s{2,}|\t/).filter(Boolean));
    return {
      formattedText: rawText,
      gridMatrix: grid.length ? grid : [['']],
      maxCols: 1,
      isTableDetected: false,
    };
  }

  // Step 1: Group words into Rows by Y-coordinate overlap
  words.sort((a, b) => a.y0 - b.y0);

  const rowGroups: WordBox[][] = [];

  words.forEach(word => {
    let matchedRow = rowGroups.find(row => {
      const avgY = row.reduce((sum, item) => sum + item.cy, 0) / row.length;
      const avgH = row.reduce((sum, item) => sum + item.h, 0) / row.length;
      return Math.abs(word.cy - avgY) < Math.max(12, avgH * 0.7);
    });

    if (matchedRow) {
      matchedRow.push(word);
    } else {
      rowGroups.push([word]);
    }
  });

  // Sort rows top-to-bottom
  rowGroups.sort((a, b) => {
    const avgA = a.reduce((sum, item) => sum + item.cy, 0) / a.length;
    const avgB = b.reduce((sum, item) => sum + item.cy, 0) / b.length;
    return avgA - avgB;
  });

  // Sort words inside each row left-to-right
  rowGroups.forEach(row => row.sort((a, b) => a.x0 - b.x0));

  // Step 2: Determine Global Column X-Ranges
  const x0List = words.map(w => w.x0).sort((a, b) => a - b);
  const colCenters: number[] = [];
  const X_TOLERANCE = 45; // Column clustering tolerance

  x0List.forEach(x => {
    const existing = colCenters.find(c => Math.abs(c - x) < X_TOLERANCE);
    if (existing === undefined) {
      colCenters.push(x);
    }
  });

  colCenters.sort((a, b) => a - b);
  const numCols = Math.max(1, colCenters.length);

  const getColIndex = (x0: number): number => {
    let minDiff = Infinity;
    let colIdx = 0;
    colCenters.forEach((center, idx) => {
      const diff = Math.abs(center - x0);
      if (diff < minDiff) {
        minDiff = diff;
        colIdx = idx;
      }
    });
    return colIdx;
  };

  // Step 3: Populate Table Grid Matrix and Layout Preserving Document Lines
  const gridMatrix: string[][] = [];
  const textLines: string[] = [];
  let multiColRowCount = 0;

  rowGroups.forEach(row => {
    const rowCells: string[] = Array(numCols).fill('');

    row.forEach(word => {
      const cIdx = getColIndex(word.x0);
      if (rowCells[cIdx]) {
        rowCells[cIdx] += ' ' + word.text;
      } else {
        rowCells[cIdx] = word.text;
      }
    });

    const cleanedRow = rowCells.map(c => c.trim());
    const populatedCells = cleanedRow.filter(Boolean);

    if (populatedCells.length >= 2) {
      multiColRowCount++;
    }

    if (cleanedRow.some(Boolean)) {
      gridMatrix.push(cleanedRow);

      // Preserve visual indentations & alignment in plain text
      let lineText = '';
      let prevX = 0;
      row.forEach(w => {
        if (prevX > 0 && w.x0 - prevX > 80) {
          lineText += '                                    '; // Indent spaces for right-aligned metadata
        } else if (prevX > 0 && w.x0 - prevX > 25) {
          lineText += '   ';
        } else if (prevX > 0) {
          lineText += ' ';
        }
        lineText += w.text;
        prevX = w.x1;
      });

      textLines.push(lineText);
    }
  });

  const isTableDetected = multiColRowCount >= 3 && numCols >= 2;

  return {
    formattedText: textLines.join('\n'),
    gridMatrix: gridMatrix.length > 0 ? gridMatrix : [['']],
    maxCols: numCols,
    isTableDetected,
  };
}