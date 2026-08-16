import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from 'docx';

/**
 * Creates a REAL Microsoft Word .docx binary blob from plain text, structured lines, or table grids.
 * Preserves Devanagari Hindi Unicode, headings, center alignment, right alignment, tables, and lists.
 */
export async function createRealDocxBlob(
  textContent: string,
  gridMatrix?: string[][],
  docTitle: string = 'Document'
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  // If a structured 2D table grid exists and has multiple rows
  if (gridMatrix && gridMatrix.length > 0 && gridMatrix[0].length > 0) {
    const cleanRows = gridMatrix.filter((r) => r.some((c) => (c || '').trim() !== ''));

    if (cleanRows.length > 0) {
      // Add optional document title paragraph
      if (docTitle && docTitle !== 'Document') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: docTitle,
                bold: true,
                size: 28, // 14pt
                font: 'Noto Sans Devanagari',
                color: '1E293B',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
      }

      const tableRows = cleanRows.map((row, rIdx) => {
        const isHeader = rIdx === 0;
        return new TableRow({
          tableHeader: isHeader,
          children: row.map((cellText) => {
            const rawCell = (cellText || '').trim();
            const lines = rawCell.split('\n');

            return new TableCell({
              width: {
                size: Math.floor(100 / row.length),
                type: WidthType.PERCENTAGE,
              },
              shading: isHeader ? { fill: 'F1F5F9' } : undefined,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              },
              children: lines.map((l) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: l,
                      bold: isHeader,
                      size: 20, // 10pt
                      font: 'Noto Sans Devanagari',
                      color: isHeader ? '0F172A' : '334155',
                    }),
                  ],
                  spacing: { before: 50, after: 50 },
                })
              ),
            });
          }),
        });
      });

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        })
      );
    }
  }

  // Parse text paragraphs if children is empty or alongside table
  if (textContent && children.length === 0) {
    const rawLines = textContent.split('\n');

    rawLines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        children.push(new Paragraph({ spacing: { after: 100 } }));
        return;
      }

      // Check if line represents a table row with delimiters
      if (line.includes('|') || line.includes('\t')) {
        const cells = line
          .split(/[\t|]/)
          .map((c) => c.trim())
          .filter(Boolean);

        if (cells.length >= 2) {
          const row = new TableRow({
            children: cells.map((cellText) =>
              new TableCell({
                width: { size: Math.floor(100 / cells.length), type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cellText,
                        size: 20,
                        font: 'Noto Sans Devanagari',
                      }),
                    ],
                  }),
                ],
              })
            ),
          });

          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [row],
            })
          );
          return;
        }
      }

      const leadingSpaces = line.length - line.trimStart().length;

      const isHeading =
        leadingSpaces > 14 ||
        /^(कार्यालय|शासकीय|प्रमाण पत्र|शपथ पत्र|अनुसूची|RESUME|BIODATA|CURRICULUM|EXPERIENCE|SALARY|RENT|AFFIDAVIT|DECLARATION|स्लोगन|नारे)/i.test(
          trimmed
        ) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        trimmed.startsWith('===');

      const isRightAligned =
        leadingSpaces > 32 ||
        /^(हस्ताक्षर|भवदीय|दिनांक:|Date:|स्थान:|Place:|प्राचार्य|शाखा प्रभारी|अधीक्षक|थाना प्रभारी)/i.test(
          trimmed
        );

      let alignment = AlignmentType.LEFT;
      let isBold = false;
      let fontSize = 22; // 11pt

      if (isHeading) {
        alignment = AlignmentType.CENTER;
        isBold = true;
        fontSize = 24; // 12pt
      } else if (isRightAligned) {
        alignment = AlignmentType.RIGHT;
      } else if (trimmed.startsWith('विषय') || trimmed.startsWith('Subject:') || trimmed.startsWith('महोदय')) {
        isBold = true;
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: isBold,
              size: fontSize,
              font: 'Noto Sans Devanagari',
              color: '1E293B',
            }),
          ],
          alignment,
          spacing: { after: 120, line: 280 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (1440 dxa)
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}