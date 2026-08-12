export interface OcrStructureResult {
  formattedText: string;
  gridMatrix: string[][];
  maxCols: number;
}

/**
 * Advanced OCR Structure Preserver & Grid Matrix Generator.
 * Uses 1D X-Coordinate Clustering to map words to global table columns.
 * Guarantees uniform column counts for every row so Excel stays 100% aligned.
 */
export function formatOcrDataWithLayout(data: any): OcrStructureResult {
  if (!data || !data.lines || data.lines.length === 0) {
    const rawText = data?.text || '';
    const simpleRows = rawText.split('\n').map((l: string) => [l.trim()]).filter((r: string[]) => r[0]);
    return {
      formattedText: rawText,
      gridMatrix: simpleRows.length ? simpleRows : [['']],
      maxCols: 1,
    };
  }

  // Step 1: Collect all valid words with X-Y coordinates
  const allWords: { text: string; x0: number; x1: number; y0: number; y1: number; lineIdx: number }[] = [];

  data.lines.forEach((line: any, lineIdx: number) => {
    if (line.words && line.words.length > 0) {
      line.words.forEach((w: any) => {
        const txt = w.text.trim();
        if (txt) {
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
    return {
      formattedText: data?.text || '',
      gridMatrix: [['']],
      maxCols: 1,
    };
  }

  // Step 2: Cluster X0 positions to discover global Column Starts
  const xPositions = allWords.map(w => w.x0).sort((a, b) => a - b);
  const colClusterCenters: number[] = [];
  const CLUSTER_THRESHOLD = 35; // Pixels distance threshold to group columns

  xPositions.forEach(x => {
    const existing = colClusterCenters.find(c => Math.abs(c - x) < CLUSTER_THRESHOLD);
    if (existing === undefined) {
      colClusterCenters.push(x);
    }
  });

  colClusterCenters.sort((a, b) => a - b);
  const numCols = Math.max(1, colClusterCenters.length);

  // Helper to map an X position to closest Column Index
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
    if (!line.words || line.words.length === 0) return;

    // Filter words in line
    const lineWords = line.words
      .map((w: any) => ({ text: w.text.trim(), x0: w.bbox.x0, x1: w.bbox.x1 }))
      .filter((w: any) => w.text);

    if (lineWords.length === 0) return;

    // Check if line looks like a single long sentence / title across page
    const isSingleHeader = lineWords.length === 1 || (lineWords.length < 3 && lineWords.map((w: any) => w.text).join(' ').length > 40);

    const rowCells: string[] = Array(numCols).fill('');

    if (isSingleHeader && numCols > 1) {
      // Put full line text into first cell
      rowCells[0] = lineWords.map((w: any) => w.text).join(' ');
    } else {
      // Assign words to column slots
      lineWords.forEach((w: any) => {
        const colIdx = getColIndex(w.x0);
        if (rowCells[colIdx]) {
          rowCells[colIdx] += ' ' + w.text;
        } else {
          rowCells[colIdx] = w.text;
        }
      });
    }

    // Append to matrix
    gridMatrix.push(rowCells);

    // Build human readable tabbed text
    const lineTextStr = rowCells.filter(Boolean).join(' \t| ');
    if (lineTextStr) {
      formattedText += lineTextStr + '\n';
    }
  });

  return {
    formattedText: formattedText.trim() || data?.text || '',
    gridMatrix: gridMatrix.length > 0 ? gridMatrix : [['']],
    maxCols: numCols,
  };
}