import React from 'react';
import { Language } from '@/types/document';
import { 
  FileText, 
  Table, 
  Layers, 
  Scissors, 
  Minimize2, 
  Image as ImageIcon, 
  FileImage, 
  RotateCw, 
  Hash, 
  Stamp, 
  FileSpreadsheet 
} from 'lucide-react';

export type PdfToolMode = 
  | 'pdf-to-word' 
  | 'pdf-to-excel'
  | 'pdf-to-jpg'
  | 'word-to-pdf' 
  | 'excel-to-pdf' 
  | 'ppt-to-pdf' 
  | 'img-to-pdf' 
  | 'merge' 
  | 'split' 
  | 'compress'
  | 'rotate'
  | 'page-numbers'
  | 'watermark';

export interface TabConfig {
  id: PdfToolMode;
  titleHi: string;
  titleEn: string;
  icon: React.ReactNode;
  accept: string;
  isMultiple?: boolean;
}

export const PDF_TOOL_TABS: TabConfig[] = [
  { id: 'pdf-to-word', titleHi: 'PDF to Word', titleEn: 'PDF to Word', icon: <FileText className="w-4 h-4 text-red-600" />, accept: '.pdf' },
  { id: 'pdf-to-excel', titleHi: 'PDF to Excel', titleEn: 'PDF to Excel', icon: <Table className="w-4 h-4 text-emerald-600" />, accept: '.pdf' },
  { id: 'merge', titleHi: 'Merge PDF', titleEn: 'Merge PDF', icon: <Layers className="w-4 h-4 text-indigo-600" />, accept: '.pdf', isMultiple: true },
  { id: 'split', titleHi: 'Split PDF', titleEn: 'Split PDF', icon: <Scissors className="w-4 h-4 text-pink-600" />, accept: '.pdf' },
  { id: 'compress', titleHi: 'Compress PDF', titleEn: 'Compress PDF', icon: <Minimize2 className="w-4 h-4 text-teal-600" />, accept: '.pdf' },
  { id: 'pdf-to-jpg', titleHi: 'PDF to JPG', titleEn: 'PDF to JPG', icon: <ImageIcon className="w-4 h-4 text-amber-600" />, accept: '.pdf' },
  { id: 'img-to-pdf', titleHi: 'JPG to PDF', titleEn: 'JPG to PDF', icon: <FileImage className="w-4 h-4 text-blue-600" />, accept: 'image/*', isMultiple: true },
  { id: 'rotate', titleHi: 'Rotate PDF', titleEn: 'Rotate PDF', icon: <RotateCw className="w-4 h-4 text-violet-600" />, accept: '.pdf' },
  { id: 'page-numbers', titleHi: 'Page Numbers', titleEn: 'Page Numbers', icon: <Hash className="w-4 h-4 text-cyan-600" />, accept: '.pdf' },
  { id: 'watermark', titleHi: 'Watermark PDF', titleEn: 'Watermark PDF', icon: <Stamp className="w-4 h-4 text-rose-600" />, accept: '.pdf' },
  { id: 'word-to-pdf', titleHi: 'Word to PDF', titleEn: 'Word to PDF', icon: <FileText className="w-4 h-4 text-blue-600" />, accept: '.doc,.docx,.txt' },
  { id: 'excel-to-pdf', titleHi: 'Excel to PDF', titleEn: 'Excel to PDF', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />, accept: '.xls,.xlsx,.csv' },
];

interface PdfToolTabsProps {
  lang: Language;
  activeTab: PdfToolMode;
  onTabChange: (tab: PdfToolMode) => void;
}

export const PdfToolTabs: React.FC<PdfToolTabsProps> = ({ lang, activeTab, onTabChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 p-1.5 bg-slate-100 rounded-xl">
      {PDF_TOOL_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === tab.id
              ? 'bg-white text-orange-600 shadow-sm border border-orange-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {tab.icon}
          <span className="truncate">{lang === 'hi' ? tab.titleHi : tab.titleEn}</span>
        </button>
      ))}
    </div>
  );
};