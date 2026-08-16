/**
 * Mera Document Engine:
 * Standard conversions strictly preserve source Unicode characters, numbers, and grammar.
 */

export interface ProcessedDocumentResult {
  docType: 'table' | 'letter' | 'slogans' | 'report' | 'office-list' | 'general';
  formattedText: string;
  gridMatrix: string[][];
  hasTable: boolean;
  wordCount: number;
}

/**
 * Verbatim text processor: passes text through WITHOUT dictionary mutations or character substitutions.
 */
export function processDocumentIntelligently(
  rawContent: string,
  fileName?: string
): ProcessedDocumentResult {
  const text = rawContent || '';
  const lines = text.split('\n');
  const gridMatrix: string[][] = [];

  lines.forEach((line) => {
    if (line.includes('|') || line.includes('\t')) {
      const cells = line.split(/[\t|]/).map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        gridMatrix.push(cells);
      }
    }
  });

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return {
    docType: gridMatrix.length > 0 ? 'table' : 'general',
    formattedText: text,
    gridMatrix,
    hasTable: gridMatrix.length > 0,
    wordCount: words,
  };
}

// Sample templates exclusively for 1-click preview demo buttons
export const VERIFIED_EMP_OFFICES_DATA: string[][] = [
  ['Sr. No.', 'Name of Office / District', 'Officer Name & Designation', 'Contact No. / STD', 'Official Email Address'],
  ['1', 'Directorate of Employment, Jaipur', 'Director / Commissioner', '0141-2368043', 'employment-raj@nic.in'],
  ['2', 'Divisional Employment Office, Ajmer', 'Asst. Director (Emp.)', '0145-2423984', 'deo.ajmer@rajasthan.gov.in'],
  ['3', 'District Employment Office, Alwar', 'District Employment Officer', '0144-2338291', 'deo.alwar@rajasthan.gov.in'],
];

export const VERIFIED_ADOBE_SCAN_TEXT = `कार्यालय उत्कृष्ट उच्चतर माध्यमिक विद्यालय पाटी विकासखण्ड पाटी जिला बड़वानी
विषय - वार्षिक अनुदान से शाला की सामग्री क्रय करने हेतु राशि का भुगतान करने बाबद्।`;

export const VERIFIED_NEW_DOC_TEXT = `कार्यालय मुख्य कार्यपालन अधिकारी एवं जिला पंचायत
क्रमांक: जि.पं./स्थापना/2025/प्र-1420                                    दिनांक: 25-12-2025
विषय: विभागीय समीक्षा बैठक एवं लम्बित प्रकरणों के त्वरित निराकरण बाबत्।`;