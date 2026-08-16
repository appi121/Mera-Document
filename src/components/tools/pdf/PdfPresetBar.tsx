import React from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Table, FileCheck2 } from 'lucide-react';

interface PdfPresetBarProps {
  lang: Language;
  onSelectPreset: (presetId: 'adobe-scan' | 'new-doc' | 'emp-list') => void;
}

export const PdfPresetBar: React.FC<PdfPresetBarProps> = ({ lang, onSelectPreset }) => {
  return (
    <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-3.5 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-orange-600" />
        {lang === 'hi' ? 'वेरिफाइड फॉर्मेट्स (1-क्लिक टेस्ट करें):' : 'Verified Templates (1-Click Instant Test):'}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectPreset('adobe-scan')}
          className="bg-white hover:bg-orange-100 border-orange-200 text-gray-800 text-xs font-semibold justify-start gap-2 h-auto py-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span className="truncate">Format 1: Adobe Scan शासकीय पत्र</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectPreset('new-doc')}
          className="bg-white hover:bg-orange-100 border-orange-200 text-gray-800 text-xs font-semibold justify-start gap-2 h-auto py-1.5"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">Format 2: New Doc समीक्षा ज्ञापन</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectPreset('emp-list')}
          className="bg-white hover:bg-emerald-50 border-emerald-300 text-gray-800 text-xs font-semibold justify-start gap-2 h-auto py-1.5 shadow-sm"
        >
          <Table className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate text-emerald-800 font-bold">Format 3: Emp Offices Excel टेबल</span>
        </Button>
      </div>
    </div>
  );
};