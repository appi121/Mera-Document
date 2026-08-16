import React from 'react';
import { Language } from '@/types/document';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Copy, Check, Download } from 'lucide-react';

interface PdfPreviewSectionProps {
  lang: Language;
  extractedText: string;
  setExtractedText: (t: string) => void;
  tableGrid: string[][];
  isAiOptimized: boolean;
  copied: boolean;
  onCopyText: () => void;
  pdfImages: { dataUrl: string; pageNum: number }[];
}

export const PdfPreviewSection: React.FC<PdfPreviewSectionProps> = ({
  lang,
  extractedText,
  setExtractedText,
  tableGrid,
  isAiOptimized,
  copied,
  onCopyText,
  pdfImages,
}) => {
  return (
    <div className="space-y-4">
      {/* Extracted Images Gallery for PDF-to-JPG */}
      {pdfImages.length > 0 && (
        <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/40 space-y-3">
          <span className="text-xs font-bold text-amber-900">
            {lang === 'hi' ? 'निकाली गई JPG फोटोज (1-क्लिक डाउनलोड):' : 'Extracted JPG Images:'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pdfImages.map((img, idx) => (
              <div key={idx} className="bg-white p-2 rounded-lg border shadow-sm text-center space-y-2">
                <img src={img.dataUrl} alt={`Page ${img.pageNum}`} className="h-32 object-contain mx-auto border" />
                <a
                  href={img.dataUrl}
                  download={`Page_${img.pageNum}.jpg`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline"
                >
                  <Download className="w-3 h-3" /> Page {img.pageNum} JPG
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Text / Table Matrix Preview */}
      {extractedText && (
        <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/30 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-orange-600" />
                {lang === 'hi' ? 'दस्तावेज़ लाइव प्रीव्यू:' : 'Live Preview:'}
              </span>
              {isAiOptimized && (
                <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0">
                  ✓ AI 100% Formatted
                </Badge>
              )}
            </div>

            <Button size="sm" variant="outline" onClick={onCopyText} className="gap-1.5 text-xs bg-white border-orange-300">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-orange-600" />}
              {copied ? (lang === 'hi' ? 'कॉपी हो गया' : 'Copied') : (lang === 'hi' ? 'टेक्स्ट कॉपी' : 'Copy Text')}
            </Button>
          </div>

          {tableGrid.length > 0 && (
            <div className="border border-emerald-200 rounded-xl overflow-x-auto max-h-[260px] bg-white p-2">
              <table className="w-full text-xs text-left border-collapse font-sans min-w-[650px]">
                <tbody>
                  {tableGrid.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx === 0 ? 'bg-orange-600 text-white font-bold' : rIdx % 2 === 0 ? 'bg-orange-50/30' : 'bg-white'}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="border border-slate-300 p-2 vertical-top font-medium text-slate-800">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Textarea
            rows={7}
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="bg-white text-xs sm:text-sm font-sans p-3 border-orange-200 leading-relaxed font-medium whitespace-pre"
          />
        </div>
      )}
    </div>
  );
};