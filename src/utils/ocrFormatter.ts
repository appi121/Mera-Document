export interface OcrStructureResult {
  formattedText: string;
  gridMatrix: string[][];
  maxCols: number;
}

/**
 * Strictly preserves exact OCR words and unicode characters without altering any spelling.
 * Maps bounding box X-coordinates to grid columns to preserve original table alignment.
 */
export function formatOcrDataWithLayout(data: any): OcrStructureResult {
  if (!data || !data.lines || data.lines.length === 0) {
    const rawText = data?.text || '';
    const simpleRows = rawText.split('\n').map((l: string) => [l]).filter((r: string[]) => r[0]);
    return {
      formattedText: rawText,
      gridMatrix: simpleRows.length ? simpleRows : [['']],
      maxCols: 1,
    };
  }

  // Step 1: Collect all recognized words preserving 100% original text
  const allWords: { text: string; x0: number; x1: number; y0: number; y1: number; lineIdx: number }[] = [];

  data.lines.forEach((line: any, lineIdx: number) => {
    if (line.words && line.words.length > 0) {
      line.words.forEach((w: any) => {
        // Keep exact original text from Tesseract
        const txt = w.text;
        if (txt && txt.trim()) {
          allWords.push({
            text: txt,
            x0: w.bbox.x0,
            x1: w.bbox.x1,
            y0: w.bbox.y0,
            y1: w.bbox.y1,
            lineIdx,
          });
        }
      });
    }
  });

  if (allWords.length === 0) {
    const fallbackText = data?.text || '';
    const simpleRows = fallbackText.split('\n').map((l: string) => [l]);
    return {
      formattedText: fallbackText,
      gridMatrix: simpleRows.length ? simpleRows : [['']],
      maxCols: 1,
    };
  }

  // Step 2: Cluster X0 positions to discover global Column Starts
  const xPositions = allWords.map(w => w.x0).sort((a, b) => a - b);
  const colClusterCenters: number[] = [];
  const CLUSTER_THRESHOLD = 30; // Distance threshold to group columns

  xPositions.forEach(x => {
    const existing = colClusterCenters.find(c => Math.abs(c - x) < CLUSTER_THRESHOLD);
    if (existing === undefined) {
      colClusterCenters.push(x);
    }
  });

  colClusterCenters.sort((a, b) => a - b);
  const numCols = Math.max(1, colClusterCenters.length);

  const getColIndex = (x: number): number => {
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

  // Step 3: Build Grid Matrix where EVERY row has exactly `numCols` cells
  const gridMatrix: string[][] = [];
  let formattedText = '';

  data.lines.forEach((line: any) => {
    if (!line.words || line.words.length === 0) {
      if (line.text && line.text.trim()) {
        const rowCells: string[] = Array(numCols).fill('');
        rowCells[0] = line.text;
        gridMatrix.push(rowCells);
        formattedText += line.text + '\n';
      }
      return;
    }

    // Preserve words sorted left to right
    const lineWords = [...line.words]
      .filter((w: any) => w.text && w.text.trim())
      .sort((a: any, b: any) => a.bbox.x0 - b.bbox.x0);

    if (lineWords.length === 0) return;

    const rowCells: string[] = Array(numCols).fill('');

    lineWords.forEach((w: any) => {
      const colIdx = getColIndex(w.bbox.x0);
      if (rowCells[colIdx]) {
        rowCells[colIdx] += ' ' + w.text;
      } else {
        rowCells[colIdx] = w.text;
      }
    });

    gridMatrix.push(rowCells);

    const lineTextStr = rowCells.filter(Boolean).join(' \t| ');
    if (lineTextStr) {
      formattedText += lineTextStr + '\n';
    }
  });

  return {
    formattedText: formattedText || data?.text || '',
    gridMatrix: gridMatrix.length > 0 ? gridMatrix : [['']],
    maxCols: numCols,
  };
}