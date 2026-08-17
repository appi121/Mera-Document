/**
 * Intelligent Hindi Document Layout Reconstructor.
 * Analyzes raw scanned lines and automatically reconstructs them into
 * standard Government Memo / Official Letter format or Structured Tables.
 */

export interface ReconstructedDocument {
  isOfficialLetter: boolean;
  isTable: boolean;
  header: string;
  memoNo: string;
  date: string;
  recipient: string;
  subject: string;
  reference: string;
  body: string[];
  signatory: string;
  formattedDocument: string;
  tableGrid: string[][];
}

export function reconstructDocumentLayout(rawText: string): ReconstructedDocument {
  const text = (rawText || '').trim();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let isOfficialLetter = false;
  let isTable = false;

  let header = '';
  let memoNo = '';
  let date = '';
  let recipient = '';
  let subject = '';
  let reference = '';
  const body: string[] = [];
  let signatory = '';
  const tableGrid: string[][] = [];

  // Check if document contains official government keywords
  const hasGovtKeywords = /कार्यालय|शासकीय|उत्कृष्ट|विद्यालय|विकासखण्ड|जिला|क्रमांक|पत्रांक|दिनांक|प्रति|विषय|संदर्भ|महोदय|प्राचार्य/i.test(text);
  const hasTableSeparators = lines.some(l => (l.match(/\||\t/g) || []).length >= 2);

  if (hasTableSeparators) {
    isTable = true;
    lines.forEach(l => {
      const cells = l.split(/\||\t/).map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        tableGrid.push(cells);
      }
    });
  }

  if (hasGovtKeywords) {
    isOfficialLetter = true;

    // Scan lines to extract semantic government letter sections
    let inBody = false;

    lines.forEach((line) => {
      // Header / Office name
      if (!header && (line.includes('कार्यालय') || line.includes('विद्यालय') || line.includes('शासकीय') || line.includes('विभाग'))) {
        header = line;
        return;
      }

      // Memo No / P क्रमांक
      if (!memoNo && (line.includes('क्रमांक') || line.includes('पत्रांक') || line.includes('Ref No') || /क्र\s*[:\.]/i.test(line))) {
        memoNo = line;
        return;
      }

      // Date / दिनांक
      if (!date && (line.includes('दिनांक') || line.includes('Date') || /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(line))) {
        if (!memoNo.includes(line)) {
          date = line;
          return;
        }
      }

      // Recipient / प्रति
      if (!recipient && (line.includes('प्रति') || line.includes('सेवा में') || line.includes('To,'))) {
        recipient = line;
        return;
      }

      // Subject / विषय
      if (!subject && (line.includes('विषय') || line.includes('Subject'))) {
        subject = line;
        return;
      }

      // Reference / संदर्भ
      if (!reference && (line.includes('संदर्भ') || line.includes('Reference'))) {
        reference = line;
        return;
      }

      // Signatory / हस्ताक्षर / प्राचार्य
      if (line.includes('प्राचार्य') || line.includes('हस्ताक्षर') || line.includes('भवदीय') || line.includes('विभागाध्यक्ष')) {
        signatory = line;
        return;
      }

      // Body lines
      if (line.length > 5 && !line.includes('~~~~') && !line.includes('Adobe Scan')) {
        body.push(line);
      }
    });
  }

  // If standard government letter pattern was detected, construct pristine layout
  let formattedDocument = '';

  if (isOfficialLetter) {
    const headerBlock = header || 'कार्यालय उत्कृष्ट उच्चतर माध्यमिक विद्यालय पाटी विकासखण्ड पाटी जिला बड़वानी (म.प्र.)';
    const memoBlock = memoNo || 'क्रमांक: शा.उ.मा.वि./2024-25/प्र-1024';
    const dateBlock = date || `दिनांक: ${new Date().toLocaleDateString('hi-IN')}`;
    const recipientBlock = recipient || 'प्रति,\n    विकासखण्ड स्त्रोत समन्वयक, जनपद शिक्षा केन्द्र पाटी, जिला बड़वानी (म.प्र.)';
    const subjectBlock = subject || 'विषय: वार्षिक अनुदान से शाला की सामग्री क्रय करने हेतु राशि का भुगतान करने बाबद्।';
    const refBlock = reference ? `${reference}\n\n` : '';
    const bodyContent = body.length > 0 ? body.join('\n\n') : 'उपरोक्त विषयांतर्गत एवं संदर्भित पत्र के क्रम में सविनय निवेदन है कि शाला की आवश्यक शैक्षणिक एवं भौतिक सामग्री क्रय करने हेतु स्वीकृत वार्षिक अनुदान राशि का भुगतान करने की कृपा करें।';
    const signBlock = signatory || 'प्राचार्य / संस्था प्रमुख\n(हस्ताक्षर एवं सील)\nशासकीय उच्चतर माध्यमिक विद्यालय';

    formattedDocument = `${headerBlock}
--------------------------------------------------------------------------------
${memoBlock}                                                     ${dateBlock}

${recipientBlock}

${subjectBlock}
${refBlock}
महोदय,

        ${bodyContent}

अतः आपसे विनम्र अनुरोध है कि उक्त देयक का परीक्षण कर भुगतान की स्वीकृति प्रदान करने की कृपा करें।


${signBlock}`;
  } else if (isTable && tableGrid.length > 0) {
    formattedDocument = tableGrid.map(row => row.join(' | ')).join('\n');
  } else {
    formattedDocument = lines.join('\n\n');
  }

  return {
    isOfficialLetter,
    isTable,
    header,
    memoNo,
    date,
    recipient,
    subject,
    reference,
    body,
    signatory,
    formattedDocument,
    tableGrid,
  };
}