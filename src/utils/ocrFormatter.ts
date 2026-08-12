/**
 * Formats Tesseract OCR data by preserving table column spaces, 
 * letter alignments, line gaps, and tab stops.
 */
export function formatOcrDataWithLayout(data: any): string {
  if (!data || !data.lines || data.lines.length === 0) {
    return data?.text || '';
  }

  let formattedOutput = '';

  data.lines.forEach((line: any) => {
    if (!line.words || line.words.length === 0) {
      formattedOutput += (line.text || '').trim() + '\n';
      return;
    }

    // Sort words in the line by their horizontal X0 position
    const sortedWords = [...line.words].sort((a: any, b: any) => a.bbox.x0 - b.bbox.x0);

    let lineStr = '';
    let prevWordEnd = -1;
    let wordCountInLine = 0;

    sortedWords.forEach((word: any) => {
      const wText = word.text.trim();
      if (!wText) return;

      if (prevWordEnd !== -1) {
        const gap = word.bbox.x0 - prevWordEnd;

        // Large gap (> 40px) implies a table column gap
        if (gap > 40) {
          lineStr += ' \t| ';
        } else if (gap > 18) {
          lineStr += '   ';
        } else {
          lineStr += ' ';
        }
      }

      lineStr += wText;
      prevWordEnd = word.bbox.x1;
      wordCountInLine++;
    });

    if (lineStr.trim()) {
      formattedOutput += lineStr + '\n';
    }
  });

  return formattedOutput.trim() || data.text || '';
}