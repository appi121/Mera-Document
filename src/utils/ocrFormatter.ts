export interface OcrStructureResult {
  formattedText: string;
  gridMatrix: string[][];
  maxCols: number;
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
 * Advanced Table Extractor from OCR Bounding Boxes:
 * 1. Groups words into Rows based on Y-coordinate overlap.
 * 2. Groups X-coordinates into global Column Ranges.
 * 3. Places words in the exact Row x Column intersection.
 */
export function formatOcrDataWithLayout(data: any): OcrStructureResult {
  const rawText = data?.text || '';

  // Extract all valid words with bounding boxes
  const words: WordBox[] = [];

  if (data && data.words && data.words.length > 0) {
    data.words.forEach((w: any) => {
      const txt = (w.text || '').replace(/^[|\[\]{}\\]+$/g, '').trim();
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
          const txt = (w.text || '').replace(/^[|\[\]{}\\]+$/g, '').trim();
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
    };
  }

  // Step 1: Group words into Rows by Y-coordinate overlap
  words.sort((a, b) => a.y0 - b.y0);

  const rowGroups: WordBox[][] = [];

  words.forEach(word => {
    let matchedRow = rowGroups.find(row => {
      const avgY = row.reduce((sum, item) => sum + item.cy, 0) / row.length;
      const avgH = row.reduce((sum, item) => sum + item.h, 0) / row.length;
      return Math.abs(word.cy - avgY) < Math.max(8, avgH * 0.6);
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

  // Step 3: Populate Table Grid Matrix
  const gridMatrix: string[][] = [];
  const textLines: string[] = [];

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

    // Clean leading/trailing spaces in cells
    const cleanedRow = rowCells.map(c => c.trim());

    // Only keep rows that contain at least one non-empty cell
    if (cleanedRow.some(Boolean)) {
      gridMatrix.push(cleanedRow);
      textLines.push(cleanedRow.filter(Boolean).join('   '));
    }
  });

  return {
    formattedText: textLines.join('\n'),
    gridMatrix: gridMatrix.length > 0 ? gridMatrix : [['']],
    maxCols: numCols,
  };
}