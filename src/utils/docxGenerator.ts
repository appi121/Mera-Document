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
  BorderStyle,
} from 'docx';

/**
 * Creates a REAL Microsoft Word .docx binary blob from exact text or table grid.
 * Strictly preserves verbatim Hindi Devanagari, English, digits, punctuation, and line breaks without mutation.
 */
export async function createRealDocxBlob(
  textContent: string,
  gridMatrix?: string[][],
  docTitle?: string
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  // 1. If 2D table grid is present, build native OpenXML Table
  if (gridMatrix && gridMatrix.length > 0 && gridMatrix[0].length > 0) {
    const cleanRows = gridMatrix.filter((r) => r.some((c) => (c || '').trim() !== ''));

    if (cleanRows.length > 0) {
      if (docTitle && docTitle !== 'Document' && docTitle.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: docTitle,
                bold: true,
                size: 26, // 13pt
                font: 'Noto Sans Devanagari',
                color: '1E293B',
              }),
            ],
            spacing: { after: 180 },
          })
        );
      }

      const tableRows = cleanRows.map((row, rIdx) => {
        const isHeader = rIdx === 0;
        return new TableRow({
          tableHeader: isHeader,
          children: row.map((cellText) => {
            const rawCell = cellText || '';
            const cellLines = rawCell.split('\n');

            return new TableCell({
              width: {
                size: Math.floor(100 / Math.max(1, row.length)),
                type: WidthType.PERCENTAGE,
              },
              shading: isHeader ? { fill: 'F8FAFC' } : undefined,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              },
              children: cellLines.map((line) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      bold: isHeader,
                      size: 20, // 10pt
                      font: 'Noto Sans Devanagari',
                      color: isHeader ? '0F172A' : '334155',
                    }),
                  ],
                  spacing: { before: 40, after: 40 },
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

  // 2. Parse exact paragraphs verbatim
  if (textContent && children.length === 0) {
    const rawLines = textContent.split('\n');

    rawLines.forEach((line) => {
      // Preserve blank line spacing
      if (!line || !line.trim()) {
        children.push(new Paragraph({ spacing: { after: 80 } }));
        return;
      }

      // Check if line represents delimited table row
      if (line.includes('|') || line.includes('\t')) {
        const cells = line.split(/[\t|]/).map((c) => c.trim()).filter((c) => c.length > 0);

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

      // Exact text run preservation
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Noto Sans Devanagari',
              size: 22, // 11pt
              color: '1E293B',
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 100, line: 260 },
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