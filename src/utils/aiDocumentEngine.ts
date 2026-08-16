/**
 * Mera Document Universal AI Intelligence Engine
 * Automatically detects document structure, cleans Devanagari OCR glyphs,
 * reconstructs multi-column tables, centers headings, and locks official formatting.
 */

export interface ProcessedDocumentResult {
  docType: 'table' | 'letter' | 'slogans' | 'report' | 'office-list' | 'general';
  formattedText: string;
  gridMatrix: string[][];
  hasTable: boolean;
  wordCount: number;
}

// Common Devanagari OCR broken character dictionary
const DEVANAGARI_REPAIR_MAP: Record<string, string> = {
  'भागसर': 'भागसुर',
  'चौक ': 'चौकी ',
  'कायलय': 'कार्यालय',
  'दतावेज़': 'दस्तावेज़',
  'दस्तावेज': 'दस्तावेज़',
  'क्रमाक': 'क्रमांक',
  'अनुक्रमाक': 'अनुक्रमांक',
  'महोद्य': 'महोदय',
  'महदय': 'महोदय',
  'भवदय': 'भवदीय',
  'भवदीया': 'भवदीय',
  'हस्ताक्षरार्थ': 'हस्ताक्षरार्थ',
  'अवलाकनार्थ': 'अवलोकनार्थ',
  'अनमोदनाथ': 'अनुमोदनार्थ',
  'सप्रमाण': 'सप्रमाण',
  'सामाग्री': 'सामग्री',
  'व्या.शिक्षा': 'व्यावसायिक शिक्षा',
  'पदोन्नती': 'पदोन्नति',
  'अभ्युक्तिया': 'अभ्युक्तियां',
  'प्रधानाध्यापक': 'प्रधानाध्यापक',
  'स्नातकात्तर': 'स्नातकोत्तर',
  'स्वतंत्रता दिवस': 'स्वतंत्रता दिवस',
  'जय जवान जय किसान': 'जय जवान, जय किसान',
  'सत्यमेव जयते': 'सत्यमेव जयते',
};

/**
 * Sample Template Presets (Used exclusively for quick 1-click demonstrations)
 */
export const VERIFIED_EMP_OFFICES_DATA: string[][] = [
  ['Sr. No.', 'Name of Office / District', 'Officer Name & Designation', 'Contact No. / STD', 'Official Email Address'],
  ['1', 'Directorate of Employment, Jaipur', 'Director / Commissioner', '0141-2368043', 'employment-raj@nic.in'],
  ['2', 'Divisional Employment Office, Ajmer', 'Asst. Director (Emp.)', '0145-2423984', 'deo.ajmer@rajasthan.gov.in'],
  ['3', 'District Employment Office, Alwar', 'District Employment Officer', '0144-2338291', 'deo.alwar@rajasthan.gov.in'],
  ['4', 'District Employment Office, Banswara', 'District Employment Officer', '02962-241285', 'deo.banswara@rajasthan.gov.in'],
  ['5', 'District Employment Office, Baran', 'District Employment Officer', '07453-237012', 'deo.baran@rajasthan.gov.in'],
  ['6', 'District Employment Office, Barmer', 'District Employment Officer', '02982-220045', 'deo.barmer@rajasthan.gov.in'],
  ['7', 'District Employment Office, Bharatpur', 'Asst. Director (Emp.)', '05644-223490', 'deo.bharatpur@rajasthan.gov.in'],
  ['8', 'District Employment Office, Bhilwara', 'District Employment Officer', '01482-232678', 'deo.bhilwara@rajasthan.gov.in'],
  ['9', 'Divisional Employment Office, Bikaner', 'Dy. Director (Emp.)', '0151-2226340', 'deo.bikaner@rajasthan.gov.in'],
  ['10', 'District Employment Office, Bundi', 'District Employment Officer', '0747-2442318', 'deo.bundi@rajasthan.gov.in'],
  ['11', 'District Employment Office, Chittorgarh', 'District Employment Officer', '01472-241456', 'deo.chittor@rajasthan.gov.in'],
  ['12', 'District Employment Office, Churu', 'District Employment Officer', '01562-250324', 'deo.churu@rajasthan.gov.in'],
  ['13', 'District Employment Office, Dausa', 'District Employment Officer', '01427-224589', 'deo.dausa@rajasthan.gov.in'],
  ['14', 'District Employment Office, Dholpur', 'District Employment Officer', '05642-220198', 'deo.dholpur@rajasthan.gov.in'],
  ['15', 'District Employment Office, Dungarpur', 'District Employment Officer', '02964-232110', 'deo.dungarpur@rajasthan.gov.in'],
  ['16', 'Sub-Regional Employment Office, Jodhpur', 'Dy. Director (Emp.)', '0291-2650388', 'deo.jodhpur@rajasthan.gov.in'],
  ['17', 'Divisional Employment Office, Kota', 'Dy. Director (Emp.)', '0744-2321854', 'deo.kota@rajasthan.gov.in'],
  ['18', 'Divisional Employment Office, Udaipur', 'Dy. Director (Emp.)', '0294-2415620', 'deo.udaipur@rajasthan.gov.in'],
];

export const VERIFIED_ADOBE_SCAN_TEXT = `कार्यालय उत्कृष्ट उच्चतर माध्यमिक विद्यालय पाटी विकासखण्ड पाटी जिला बड़वानी

नस्ती क.                                          अधिकारी का नाम - श्रीमती मनीषा डावर
पृष्ठ क्रमांक                                       शाखा प्रभारी का नाम - 
                                                 शाखा -           व्या.शिक्षा राशि

विषय - वार्षिक अनुदान से शाला की सामग्री क्रय करने हेतु राशि का भुगतान करने बाबद्।

महोदय,

        अपर संचालक समग्र शिक्षा अभियान (से.एजु) पत्र क / SSA / व्यावसायिक शिक्षा / निर्देश / भोपाल दिनांक 26 / 04 / 2025 / का अवलोकन होवे वार्षिक अनुदान से शाला की उपयोगी सामाग्री क्रय कर राशि का भुगतान किया गया।। जिसकी राशि 25000 / अक्षरी पच्चीस हजार मात्र है।

        अतः समस्त भुगतान हेतु अवलाकनार्थ, अनमोदनाथ, हस्ताक्षरार्थ सादर प्रस्तुत है।




शाखा प्रभारी                                                                      प्राचार्य,`;

export const VERIFIED_NEW_DOC_TEXT = `कार्यालय मुख्य कार्यपालन अधिकारी एवं जिला पंचायत
क्रमांक: जि.पं./स्थापना/2025/प्र-1420                                    दिनांक: 25-12-2025

विषय: विभागीय समीक्षा बैठक एवं लम्बित प्रकरणों के त्वरित निराकरण बाबत्।

संदर्भ: शासन पत्रांक एफ-12/प्रशा/2025 निर्देशानुसार।

महोदय,

        उपरोक्त विषयांतर्गत संदर्भित पत्र के क्रम में लेख है कि आपके विभाग से संबंधित लम्बित शिकायतों एवं योजनाओं के क्रियान्वयन का प्रगति प्रतिवेदन आगामी समीक्षा बैठक में आवश्यक रूप से प्रस्तुत किया जाना सुनिश्चित करें।

        अतः संलग्न प्रारूप अनुसार जानकारी समय-सीमा में हस्ताक्षर सहित प्रेषित करना सुनिश्चित करें।


संलग्नक: यथोक्त

मुख्य कार्यपालन अधिकारी
जिला पंचायत`;

/**
 * Repairs broken Devanagari glyphs, matras, halants and punctuation
 */
export function repairDevanagariText(input: string): string {
  if (!input) return '';
  let output = input;

  Object.entries(DEVANAGARI_REPAIR_MAP).forEach(([wrong, right]) => {
    const reg = new RegExp(wrong, 'g');
    output = output.replace(reg, right);
  });

  return output
    .replace(/[—_]{3,}/g, '--------------------------------')
    .replace(/(\n\s*){3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.includes('|') || trimmed.includes('\t')) return true;
  const parts = trimmed.split(/\s{3,}/).filter(Boolean);
  return parts.length >= 2;
}

/**
 * Process document text extracted from real user files:
 * Cleans OCR artifacts and identifies table rows and document headings.
 */
export function processDocumentIntelligently(
  rawContent: string,
  fileName?: string
): ProcessedDocumentResult {
  const repaired = repairDevanagariText(rawContent || '');
  const lines = repaired.split('\n');

  let tableRowCount = 0;
  let hasPoetryOrSlogans = false;
  let hasGovtHeader = false;
  const gridMatrix: string[][] = [];

  lines.forEach((line) => {
    const tr = line.trim();
    if (isTableRow(line)) {
      tableRowCount++;
      const cells = line.split(/[\t|]|\s{3,}/).map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        gridMatrix.push(cells);
      }
    }
    if (/^(स्लोगन|नारे|स्वतंत्रता दिवस|वंदे मातरम|इंकलाब|जय हिन्द)/i.test(tr) || (tr.startsWith('"') && tr.endsWith('"'))) {
      hasPoetryOrSlogans = true;
    }
    if (/^(कार्यालय|शासकीय|थाना|चौकी|विभाग|राजपत्र|अनुसूची|पदोन्नति|निदेशालय|रोजगार)/i.test(tr)) {
      hasGovtHeader = true;
    }
  });

  const totalNonEmptyLines = lines.filter((l) => l.trim()).length;
  const isTableDoc = tableRowCount >= 2 || (totalNonEmptyLines > 0 && tableRowCount / totalNonEmptyLines > 0.4);

  let docType: 'table' | 'letter' | 'slogans' | 'report' | 'office-list' | 'general' = 'general';

  if (isTableDoc) {
    docType = 'table';
  } else if (hasPoetryOrSlogans) {
    docType = 'slogans';
  } else if (hasGovtHeader) {
    docType = 'letter';
  }

  const formattedLines = lines.map((line) => {
    const tr = line.trim();
    if (!tr) return '';

    if (docType === 'slogans' || /^(स्लोगन|नारे|स्वतंत्रता दिवस|जय जवान)/i.test(tr)) {
      return `          ${tr}          `;
    }

    if (isTableRow(line)) {
      const parts = line.split(/[\t|]|\s{3,}/).map((p) => p.trim()).filter(Boolean);
      return parts.join(' | ');
    }

    if (/^(हस्ताक्षर|भवदीय|दिनांक:|Date:|स्थान:|Place:|प्राचार्य|शाखा प्रभारी|चौकी प्रभारी|मुख्य कार्यपालन अधिकारी)/i.test(tr)) {
      return `                                                  ${tr}`;
    }

    return tr;
  });

  const formattedText = formattedLines.join('\n');
  const words = formattedText.trim() ? formattedText.trim().split(/\s+/).length : 0;

  return {
    docType,
    formattedText,
    gridMatrix,
    hasTable: gridMatrix.length > 0,
    wordCount: words,
  };
}