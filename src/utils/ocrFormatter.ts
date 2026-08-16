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
 * Pure bounding-box spatial layout builder without character modification.
 */
export function formatOcrDataWithLayout(data: any): OcrStructureResult {
  const rawText = data?.text || '';
  const words: WordBox[] = [];

  if (data && data.words && data.words.length > 0) {
    data.words.forEach((w: any) => {
      const txt = (w.text || '').trim();
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

  // Sort words top-to-bottom
  words.sort((a, b) => a.y0 - b.y0);

  const rowGroups: WordBox[][] = [];

  words.forEach((word) => {
    const matchedRow = rowGroups.find((row) => {
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

  rowGroups.sort((a, b) => {
    const avgA = a.reduce((sum, item) => sum + item.cy, 0) / a.length;
    const avgB = b.reduce((sum, item) => sum + item.cy, 0) / b.length;
    return avgA - avgB;
  });

  rowGroups.forEach((row) => row.sort((a, b) => a.x0 - b.x0));

  const textLines: string[] = [];
  const gridMatrix: string[][] = [];

  rowGroups.forEach((row) => {
    const rowWords = row.map((w) => w.text);
    textLines.push(rowWords.join(' '));
    gridMatrix.push(rowWords);
  });

  return {
    formattedText: textLines.join('\n'),
    gridMatrix: gridMatrix.length > 0 ? gridMatrix : [['']],
    maxCols: Math.max(...gridMatrix.map((r) => r.length), 1),
    isTableDetected: gridMatrix.some((r) => r.length > 1),
  };
}