import React from 'react';
import { Language } from '@/types/document';
import { PdfToolMode } from './PdfToolTabs';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, CheckCircle } from 'lucide-react';

interface PdfActionBarProps {
  lang: Language;
  activeSubTab: PdfToolMode;
  toolTitle: string;
  filesLength: number;
  hasExtractedText: boolean;
  processing: boolean;
  completed: boolean;
  hasGeneratedBlob: boolean;
  onExecute: () => void;
  onDownloadDirectBlob: () => void;
  onDownloadPdf: () => void;
  onDownloadExcel: () => void;
  onDownloadWord: () => void;
}

export const PdfActionBar: React.FC<PdfActionBarProps> = ({
  lang,
  activeSubTab,
  toolTitle,
  filesLength,
  hasExtractedText,
  processing,
  completed,
  hasGeneratedBlob,
  onExecute,
  onDownloadDirectBlob,
  onDownloadPdf,
  onDownloadExcel,
  onDownloadWord,
}) => {
  const isConvertToPdfMode =
    activeSubTab === 'word-to-pdf' ||
    activeSubTab === 'excel-to-pdf' ||
    activeSubTab === 'ppt-to-pdf' ||
    activeSubTab === 'img-to-pdf';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
      <Button
        onClick={onExecute}
        disabled={filesLength === 0 && !hasExtractedText}
        className="w-full sm:w-auto px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow text-xs sm:text-sm"
      >
        {processing ? (
          <span>{lang === 'hi' ? 'प्रोसेस हो रहा है...' : 'Processing...'}</span>
        ) : (
          <span>
            {lang === 'hi' ? `${toolTitle} शुरू करें` : `Execute ${toolTitle}`}
          </span>
        )}
      </Button>

      {(completed || hasExtractedText || hasGeneratedBlob) && (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          {hasGeneratedBlob ? (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold text-xs sm:text-sm shadow-md"
              onClick={onDownloadDirectBlob}
            >
              <Download className="w-4 h-4" />
              {lang === 'hi' ? 'तैयार PDF डाउनलोड करें' : 'Download PDF'}
            </Button>
          ) : isConvertToPdfMode ? (
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-bold text-xs sm:text-sm shadow-md"
              onClick={onDownloadPdf}
              disabled={processing}
            >
              <Download className="w-4 h-4" />
              {lang === 'hi' ? 'शुद्ध PDF डाउनलोड करें' : 'Download Exact PDF'}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 gap-2 font-semibold text-xs sm:text-sm shadow-sm"
                onClick={onDownloadExcel}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <Download className="w-4 h-4" />
                {lang === 'hi' ? 'MS Excel (.xls)' : 'Download MS Excel'}
              </Button>

              <Button
                variant="outline"
                className="border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 gap-2 font-semibold text-xs sm:text-sm shadow-sm"
                onClick={onDownloadWord}
              >
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                <Download className="w-4 h-4" />
                {lang === 'hi' ? 'MS Word (.doc)' : 'Download MS Word'}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};