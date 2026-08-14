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
    case 'ai-studio': return <Brain className="w-6 h-6 text-orange-600" />;
    case 'photo-resizer': return <ImageIcon className="w-6 h-6" />;
    case 'image-converter': return <RefreshCw className="w-6 h-6" />;
    case 'gst-calculator': return <Receipt className="w-6 h-6" />;
    case 'typing-counter': return <Keyboard className="w-6 h-6" />;
    case 'age-calculator': return <Clock className="w-6 h-6" />;
    case 'watermark': return <ShieldCheck className="w-6 h-6" />;
    case 'passport-sheet': return <Grid className="w-6 h-6" />;
    case 'id-joiner': return <CreditCard className="w-6 h-6" />;
    case 'affidavit': return <FileCheck2 className="w-6 h-6" />;
    case 'pdf-to-word':
    case 'word-to-pdf': return <FileText className="w-6 h-6" />;
    case 'excel-to-pdf': return <FileSpreadsheet className="w-6 h-6" />;
    case 'ppt-to-pdf': return <Presentation className="w-6 h-6" />;
    case 'img-to-pdf': return <FileImage className="w-6 h-6" />;
    case 'merge-pdf': return <Layers className="w-6 h-6" />;
    case 'split-pdf': return <Scissors className="w-6 h-6" />;
    case 'compress-pdf': return <Minimize2 className="w-6 h-6" />;
    case 'ocr': return <Camera className="w-6 h-6" />;
    case 'resume': return <UserCheck className="w-6 h-6" />;
    case 'translate': return <Globe className="w-6 h-6" />;
    case 'letter': return <PenTool className="w-6 h-6" />;
    case 'govt': return <Building2 className="w-6 h-6" />;
    case 'signature': return <FileSignature className="w-6 h-6" />;
    case 'templates': return <CopyCheck className="w-6 h-6" />;
    case 'excel': return <Table className="w-6 h-6" />;
    default: return <FileText className="w-6 h-6" />;
  }
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, lang, onSelectTool }) => {
  const isAiStudio = tool.id === 'ai-studio';

  return (
    <Card
      onClick={() => onSelectTool(tool.id)}
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl rounded-2xl p-6 relative flex flex-col justify-between ${
        isAiStudio
          ? 'border-2 border-orange-500 bg-gradient-to-br from-orange-50/60 via-amber-50/30 to-white shadow-md hover:border-orange-600'
          : 'border-orange-100/80 hover:border-orange-400 bg-white hover:bg-gradient-to-br hover:from-white hover:to-orange-50/30'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-sm">
            {renderToolIcon(tool.icon)}
          </div>

          {(tool.badgeHi || tool.badgeEn) && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs font-semibold px-2.5 py-0.5">
              {lang === 'hi' ? tool.badgeHi : tool.badgeEn}
            </Badge>
          )}
        </div>

        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">
          {lang === 'hi' ? tool.titleHi : tool.titleEn}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {lang === 'hi' ? tool.descHi : tool.descEn}
        </p>
      </div>

      <div className="pt-2 flex items-center text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
        <span>{lang === 'hi' ? 'उपयोग करें ➔' : 'Use Tool ➔'}</span>
      </div>
    </Card>
  );
};