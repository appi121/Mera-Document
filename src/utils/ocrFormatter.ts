export interface OcrCell {
  text: string;
  confidence: number; // 0 to 100
  isLowConfidence: boolean;
  isNumeric: boolean;
}

export interface OcrStructureResult {
  formattedText: string;
  gridMatrix: string[][];
  cellConfidences: number[][];
  maxCols: number;
  isTableDetected: boolean;
  headerText: string;
  footerText: string;
  warnings: string[];
}

interface WordBox {
  text: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  cy: number;
  h: number;
  confidence: number;
}

/**
 * Advanced Spatial Layout and Table Detection Engine.
 * Segments document into Header, Table, and Footer regions, clusters columns,
 * resolves numeric confusions, and flags low-confidence cells.
 */
export function formatOcrDataWithLayout(data: any): OcrStructureResult {
  const rawText = data?.text || '';
  const words: WordBox[] = [];
  const warnings: string[] = [];

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
          confidence: w.confidence || 0,
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
      cellConfidences: grid.map(row => row.map(() => 100)),
      maxCols: 1,
      isTableDetected: false,
      headerText: '',
      footerText: '',
      warnings: ['No spatial word coordinates found. Fallback to plain text parsing.'],
    };
  }

  // 1. Sort words top-to-bottom
  words.sort((a, b) => a.y0 - b.y0);

  // Find page boundaries
  const minY = Math.min(...words.map(w => w.y0));
  const maxY = Math.max(...words.map(w => w.y1));
  const pageHeight = maxY - minY;

  // Define Header and Footer regions (top 15% and bottom 15%)
  const headerThreshold = minY + pageHeight * 0.15;
  const footerThreshold = maxY - pageHeight * 0.15;

  const headerWords = words.filter(w => w.y1 <= headerThreshold);
  const footerWords = words.filter(w => w.y0 >= footerThreshold);
  const bodyWords = words.filter(w => w.y1 > headerThreshold && w.y0 < footerThreshold);

  // 2. Group body words into rows using vertical overlap
  const rowGroups: WordBox[][] = [];
  bodyWords.forEach((word) => {
    const matchedRow = rowGroups.find((row) => {
      const avgY = row.reduce((sum, item) => sum + item.cy, 0) / row.length;
      const avgH = row.reduce((sum, item) => sum + item.h, 0) / row.length;
      return Math.abs(word.cy - avgY) < Math.max(12, avgH * 0.75);
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

  // Sort words within each row left-to-right
  rowGroups.forEach((row) => row.sort((a, b) => a.x0 - b.x0));

  // 3. Dynamic Column Detection via X-coordinate clustering
  const xCoordinates = bodyWords.map(w => w.x0).sort((a, b) => a - b);
  const columnClusters: number[] = [];
  const clusterTolerance = 45; // px

  xCoordinates.forEach((x) => {
    const matchedCluster = columnClusters.find(c => Math.abs(c - x) < clusterTolerance);
    if (!matchedCluster) {
      columnClusters.push(x);
    }
  });
  columnClusters.sort((a, b) => a - b);
  const numCols = Math.max(1, columnClusters.length);

  // 4. Map words into structured 2D Grid Matrix
  const gridMatrix: string[][] = [];
  const cellConfidences: number[][] = [];

  rowGroups.forEach((row) => {
    const gridRow = Array(numCols).fill('');
    const confidenceRow = Array(numCols).fill(100);
    const cellWords: WordBox[][] = Array.from({ length: numCols }, () => []);

    row.forEach((word) => {
      // Find closest column cluster
      let colIdx = 0;
      let minDiff = Infinity;
      columnClusters.forEach((c, idx) => {
        const diff = Math.abs(c - word.x0);
        if (diff < minDiff) {
          minDiff = diff;
          colIdx = idx;
        }
      });
      cellWords[colIdx].push(word);
    });

    cellWords.forEach((wordsInCell, colIdx) => {
      if (wordsInCell.length > 0) {
        // Sort left-to-right
        wordsInCell.sort((a, b) => a.x0 - b.x0);
        const cellText = wordsInCell.map(w => w.text).join(' ');
        const avgConfidence = Math.round(wordsInCell.reduce((sum, w) => sum + w.confidence, 0) / wordsInCell.length);

        gridRow[colIdx] = cellText;
        confidenceRow[colIdx] = avgConfidence;
      }
    });

    // Only add rows that contain actual text
    if (gridRow.some(cell => cell !== '')) {
      gridMatrix.push(gridRow);
      cellConfidences.push(confidenceRow);
    }
  });

  // 5. Column Context Analysis & Numeric Correction
  // Identify columns that are predominantly numeric (e.g., Enrolled, Passed, Percentage)
  const colNumericScores = Array(numCols).fill(0);
  gridMatrix.forEach((row) => {
    row.forEach((cell, colIdx) => {
      if (cell && /^[0-9%.\s\-०-९]+$/.test(cell)) {
        colNumericScores[colIdx]++;
      }
    });
  });

  const totalRows = gridMatrix.length;
  gridMatrix.forEach((row, rIdx) => {
    row.forEach((cell, colIdx) => {
      if (!cell) return;

      const isNumericColumn = totalRows > 2 && (colNumericScores[colIdx] / totalRows) > 0.5;
      const confidence = cellConfidences[rIdx][colIdx];

      if (isNumericColumn) {
        // Resolve common OCR confusions in numeric columns
        let corrected = cell
          .replace(/[Oo]/g, '0') // Confused 0 and O
          .replace(/०/g, '0')   // Devanagari 0
          .replace(/१/g, '1')
          .replace(/२/g, '2')
          .replace(/३/g, '3')
          .replace(/४/g, '4')
          .replace(/५/g, '5')
          .replace(/६/g, '6')
          .replace(/७/g, '7')
          .replace(/८/g, '8')
          .replace(/९/g, '9');

        // Safety Rule: If numeric column contains letters and confidence is low, flag it
        if (/[a-zA-Z\u0900-\u097F]/.test(corrected) && confidence < 65) {
          corrected += ' [Needs verification]';
          warnings.push(`Row ${rIdx + 1}, Col ${colIdx + 1}: Low confidence numeric cell contains letters.`);
        }
        row[colIdx] = corrected;
      } else {
        // Safety Rule for text columns (e.g., Teacher Names, Subjects)
        if (confidence < 55) {
          row[colIdx] = cell + ' [Needs verification]';
          warnings.push(`Row ${rIdx + 1}, Col ${colIdx + 1}: Low confidence text cell.`);
        }
      }
    });
  });

  // 6. Format Header and Footer text
  const formatRegionText = (regionWords: WordBox[]) => {
    const lines: { y: number; words: WordBox[] }[] = [];
    regionWords.forEach((w) => {
      let line = lines.find(l => Math.abs(l.y - w.cy) < 10);
      if (line) {
        line.words.push(w);
      } else {
        lines.push({ y: w.cy, words: [w] });
      }
    });
    lines.sort((a, b) => a.y - b.y);
    lines.forEach(l => l.words.sort((a, b) => a.x0 - b.x0));
    return lines.map(l => l.words.map(w => w.text).join(' ')).join('\n');
  };

  const headerText = formatRegionText(headerWords);
  const footerText = formatRegionText(footerWords);

  // 7. Build final formatted text representation
  const formattedLines: string[] = [];
  if (headerText) formattedLines.push(headerText, '');
  gridMatrix.forEach(row => {
    formattedLines.push(row.filter(Boolean).join(' | '));
  });
  if (footerText) formattedLines.push('', footerText);

  return {
    formattedText: formattedLines.join('\n'),
    gridMatrix: gridMatrix.length > 0 ? gridMatrix : [['']],
    cellConfidences: cellConfidences.length > 0 ? cellConfidences : [[100]],
    maxCols: numCols,
    isTableDetected: numCols > 1 && gridMatrix.length > 1,
    headerText,
    footerText,
    warnings,
  };
}