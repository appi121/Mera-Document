export interface OcrStructureResult {
  formattedText: string;
  gridMatrix: string[][];
  maxCols: number;
}

/**
 * Cleans OCR artifacts and formats clean text/table cells without injecting artificial '|' pipe symbols.
 */
export function formatOcrDataWithLayout(data: any): OcrStructureResult {
  if (!data || !data.lines || data.lines.length === 0) {
    const rawText = cleanNoise(data?.text || '');
    const simpleRows = rawText.split('\n').map((l: string) => [l]).filter((r: string[]) => r[0]);
    return {
      formattedText: rawText,
      gridMatrix: simpleRows.length ? simpleRows : [['']],
      maxCols: 1,
    };
  }

  // Helper to remove obvious OCR artifacts like random single brackets or pipes
  function cleanNoise(str: string): string {
    if (!str) return '';
    return str
      .replace(/^[|\[\]{}\\]+$/g, '') // remove pure pipe or bracket noise
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Step 1: Collect valid words with coordinates
  const allWords: { text: string; x0: number; x1: number; y0: number; y1: number; confidence: number }[] = [];

  data.lines.forEach((line: any) => {
    if (line.words && line.words.length > 0) {
      line.words.forEach((w: any) => {
        const txt = cleanNoise(w.text);
        // Ignore single random garbage symbols if confidence is low
        if (txt && !(txt.length === 1 && w.confidence < 30 && ['|', '[', ']', '{', '}', '\\', '/'].includes(txt))) {
          allWords.push({
            text: txt,
            x0: w.bbox.x0,
            x1: w.bbox.x1,
            y0: w.bbox.y0,
            y1: w.bbox.y1,
            confidence: w.confidence || 100,
          });
        }
      });
    }
  });

  if (allWords.length === 0) {
    const fallbackText = cleanNoise(data?.text || '');
    const simpleRows = fallbackText.split('\n').map((l: string) => [l]);
    return {
      formattedText: fallbackText,
      gridMatrix: simpleRows.length ? simpleRows : [['']],
      maxCols: 1,
    };
  }

  // Step 2: Cluster X0 positions for column positions
  const xPositions = allWords.map(w => w.x0).sort((a, b) => a - b);
  const colClusterCenters: number[] = [];
  const CLUSTER_THRESHOLD = 35;

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

  // Step 3: Build Grid Matrix cleanly WITHOUT inserting '|' pipe characters
  const gridMatrix: string[][] = [];
  let formattedTextLines: string[] = [];

  data.lines.forEach((line: any) => {
    if (!line.words || line.words.length === 0) {
      const lineTxt = cleanNoise(line.text);
      if (lineTxt) {
        const rowCells: string[] = Array(numCols).fill('');
        rowCells[0] = lineTxt;
        gridMatrix.push(rowCells);
        formattedTextLines.push(lineTxt);
      }
      return;
    }

    const lineWords = line.words
      .map((w: any) => ({ text: cleanNoise(w.text), x0: w.bbox.x0, confidence: w.confidence || 100 }))
      .filter((w: any) => w.text);

    if (lineWords.length === 0) return;

    const rowCells: string[] = Array(numCols).fill('');

    lineWords.forEach((w: any) => {
      const colIdx = getColIndex(w.x0);
      if (rowCells[colIdx]) {
        rowCells[colIdx] += ' ' + w.text;
      } else {
        rowCells[colIdx] = w.text;
      }
    });

    gridMatrix.push(rowCells);

    // Join with natural double spaces or tabs instead of '|'
    const lineTextStr = rowCells.filter(Boolean).join('   ');
    if (lineTextStr.trim()) {
      formattedTextLines.push(lineTextStr);
    }
  });

  const finalFormattedText = formattedTextLines.join('\n');

  return {
    formattedText: finalFormattedText || cleanNoise(data?.text || ''),
    gridMatrix: gridMatrix.length > 0 ? gridMatrix : [['']],
    maxCols: numCols,
  };
}