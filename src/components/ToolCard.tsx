import React from 'react';
import { Language, ToolItem } from '@/types/document';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FileImage, 
  Layers, 
  Scissors, 
  Minimize2, 
  Image as ImageIcon, 
  RefreshCw, 
  Receipt, 
  Keyboard, 
  Clock, 
  ShieldCheck, 
  Grid, 
  CreditCard, 
  FileCheck2, 
  Camera, 
  UserCheck, 
  Globe, 
  PenTool, 
  Building2, 
  FileSignature, 
  CopyCheck, 
  Table 
} from 'lucide-react';

interface ToolCardProps {
  tool: ToolItem;
  lang: Language;
  onSelectTool: (toolId: string) => void;
}

const renderToolIcon = (iconName: string) => {
  switch (iconName) {
    case 'ai-studio': return <Brain className="w-5 h-5 text-orange-600" />;
    case 'photo-resizer': return <ImageIcon className="w-5 h-5 text-amber-600" />;
    case 'image-converter': return <RefreshCw className="w-5 h-5 text-indigo-600" />;
    case 'gst-calculator': return <Receipt className="w-5 h-5 text-emerald-600" />;
    case 'typing-counter': return <Keyboard className="w-5 h-5 text-slate-600" />;
    case 'age-calculator': return <Clock className="w-5 h-5 text-rose-600" />;
    case 'watermark': return <ShieldCheck className="w-5 h-5 text-teal-600" />;
    case 'passport-sheet': return <Grid className="w-5 h-5 text-blue-600" />;
    case 'id-joiner': return <CreditCard className="w-5 h-5 text-cyan-600" />;
    case 'affidavit': return <FileCheck2 className="w-5 h-5 text-violet-600" />;
    case 'pdf-to-word':
    case 'word-to-pdf': return <FileText className="w-5 h-5 text-red-600" />;
    case 'excel-to-pdf': return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    case 'ppt-to-pdf': return <Presentation className="w-5 h-5 text-orange-600" />;
    case 'img-to-pdf': return <FileImage className="w-5 h-5 text-blue-600" />;
    case 'merge-pdf': return <Layers className="w-5 h-5 text-indigo-600" />;
    case 'split-pdf': return <Scissors className="w-5 h-5 text-pink-600" />;
    case 'compress-pdf': return <Minimize2 className="w-5 h-5 text-slate-600" />;
    case 'ocr': return <Camera className="w-5 h-5 text-amber-600" />;
    case 'resume': return <UserCheck className="w-5 h-5 text-emerald-600" />;
    case 'translate': return <Globe className="w-5 h-5 text-blue-600" />;
    case 'letter': return <PenTool className="w-5 h-5 text-orange-600" />;
    case 'govt': return <Building2 className="w-5 h-5 text-slate-600" />;
    case 'signature': return <FileSignature className="w-5 h-5 text-teal-600" />;
    case 'templates': return <CopyCheck className="w-5 h-5 text-indigo-600" />;
    case 'excel': return <Table className="w-5 h-5 text-emerald-600" />;
    default: return <FileText className="w-5 h-5 text-slate-600" />;
  }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, lang, onSelectTool }) => {
  const isAiStudio = tool.id === 'ai-studio';

  return (
    <Card
      onClick={() => onSelectTool(tool.id)}
      className={`group cursor-pointer transition-all duration-200 hover:shadow-md rounded-xl p-4 flex flex-col justify-between min-h-[140px] ${
        isAiStudio
          ? 'border border-orange-400 bg-orange-50/30 hover:bg-orange-50/50'
          : 'border border-slate-200 hover:border-orange-400 bg-white hover:bg-slate-50/30'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            {renderToolIcon(tool.icon)}
          </div>

          {(tool.badgeHi || tool.badgeEn) && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 text-[9px] font-bold px-1.5 py-0">
              {lang === 'hi' ? tool.badgeHi : tool.badgeEn}
            </Badge>
          )}
        </div>

        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1 group-hover:text-orange-600 transition-colors">
          {lang === 'hi' ? tool.titleHi : tool.titleEn}
        </h3>

        <p className="text-slate-500 text-[11px] leading-relaxed">
          {lang === 'hi' ? tool.descHi : tool.descEn}
        </p>
      </div>

      <div className="pt-2 flex items-center text-[10px] font-bold text-orange-600 group-hover:translate-x-0.5 transition-transform">
        <span>{lang === 'hi' ? 'उपयोग करें ➔' : 'Use Tool ➔'}</span>
      </div>
    </Card>
  );
};