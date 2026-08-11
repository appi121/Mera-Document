import React from 'react';
import { Language, ToolItem } from '@/types/document';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  UserCheck, 
  Globe, 
  PenTool, 
  Building2, 
  Camera, 
  FileSignature, 
  CopyCheck, 
  Briefcase, 
  Table 
} from 'lucide-react';

interface ToolGridProps {
  lang: Language;
  searchQuery: string;
  onSelectTool: (toolId: string) => void;
}

export const toolsData: ToolItem[] = [
  {
    id: 'pdf',
    titleHi: '📄 PDF टूल्स (Merge & Compress)',
    titleEn: '📄 PDF Tools (Merge & Compress)',
    descHi: 'PDF जोड़ें, साइज कम करें, और इमेज को PDF में बदलें',
    descEn: 'Merge PDFs, compress size & convert images to PDF',
    icon: 'pdf',
    category: 'pdf',
    badgeHi: 'लोकप्रिय',
    badgeEn: 'Popular',
  },
  {
    id: 'resume',
    titleHi: '🤖 AI रिज्यूमे बिल्डर',
    titleEn: '🤖 AI Resume Builder',
    descHi: '1 मिनट में प्रोफेशनल बायोडाटा/रिज्यूमे बनाएं और डाउनलोड करें',
    descEn: 'Build professional Indian resume in 1 minute',
    icon: 'resume',
    category: 'ai',
    badgeHi: 'AI स्पीड',
    badgeEn: 'AI Speed',
  },
  {
    id: 'translate',
    titleHi: '🌐 हिंदी ↔ इंग्लिश ट्रांसलेटर',
    titleEn: '🌐 Hindi ↔ English Translator',
    descHi: 'सरकारी व ऑफिशियल पत्रों का तुरंत सही अनुवाद करें',
    descEn: 'Instant translation for official & govt work',
    icon: 'translate',
    category: 'ai',
  },
  {
    id: 'letter',
    titleHi: '📝 AI आवेदन पत्र (Letter Writer)',
    titleEn: '📝 AI Letter Writer',
    descHi: 'छुट्टी, बैंक और सरकारी दफ्तर के लिए ऑटो-लेटर बनाएं',
    descEn: 'Auto-generate leave, bank & official letters',
    icon: 'letter',
    category: 'ai',
  },
  {
    id: 'govt',
    titleHi: '📑 सरकारी फॉर्म असिस्टेंट',
    titleEn: '📑 Govt Form Assistant',
    descHi: 'आय, जाति, निवास और पैन कार्ड फॉर्म की संपूर्ण गाइड',
    descEn: 'Complete guide & checklist for Indian Govt Forms',
    icon: 'govt',
    category: 'popular',
    badgeHi: 'उपयोगी',
    badgeEn: 'Helpful',
  },
  {
    id: 'ocr',
    titleHi: '📷 OCR (फोटो से टेक्स्ट)',
    titleEn: '📷 OCR Text Extractor',
    descHi: 'कागज़ की फोटो खींचकर हिंदी व इंग्लिश टेक्स्ट निकालें',
    descEn: 'Extract Hindi & English text from photos',
    icon: 'ocr',
    category: 'utilities',
  },
  {
    id: 'signature',
    titleHi: '✍️ डिजिटल सिग्नेचर मेकर',
    titleEn: '✍️ Signature Creator',
    descHi: 'पारदर्शी (Transparent PNG) डिजिटल दस्तखत बनाएं',
    descEn: 'Create transparent PNG digital signatures',
    icon: 'signature',
    category: 'utilities',
  },
  {
    id: 'templates',
    titleHi: '📋 डॉक्यूमेंट टेम्पलेट्स',
    titleEn: '📋 Document Templates',
    descHi: 'किरायानामा, रसीद, सैलेरी स्लिप के रेडीमेड फॉर्मेट्स',
    descEn: 'Ready formats for rent agreement, receipts, salary slips',
    icon: 'templates',
    category: 'popular',
  },
  {
    id: 'excel',
    titleHi: '📊 एक्सेल AI असिस्टेंट',
    titleEn: '📊 Excel AI Assistant',
    descHi: 'एक्सेल फ़ॉर्मूला (VLOOKUP, SUM) और सहायता प्राप्त करें',
    descEn: 'Get instant Excel formulas & data helper',
    icon: 'excel',
    category: 'utilities',
  },
];

export const ToolGrid: React.FC<ToolGridProps> = ({ lang, searchQuery, onSelectTool }) => {
  const filteredTools = toolsData.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.titleHi.toLowerCase().includes(query) ||
      t.titleEn.toLowerCase().includes(query) ||
      t.descHi.toLowerCase().includes(query) ||
      t.descEn.toLowerCase().includes(query)
    );
  });

  return (
    <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {lang === 'hi' ? 'सभी टूल एक ही जगह' : 'All Tools in One Place'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'hi' ? 'अपनी आवश्यकतानुसार टूल पर क्लिक करें:' : 'Click on any tool to get started:'}
          </p>
        </div>
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            {lang === 'hi' ? 'कोई टूल नहीं मिला। कृपया अलग शब्द खोजें।' : 'No tools found matching your query.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group cursor-pointer border-orange-100/80 hover:border-orange-400 bg-white hover:bg-gradient-to-br hover:from-white hover:to-orange-50/30 transition-all duration-300 hover:shadow-xl rounded-2xl p-6 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-sm">
                    {tool.icon === 'pdf' && <FileText className="w-6 h-6" />}
                    {tool.icon === 'resume' && <UserCheck className="w-6 h-6" />}
                    {tool.icon === 'translate' && <Globe className="w-6 h-6" />}
                    {tool.icon === 'letter' && <PenTool className="w-6 h-6" />}
                    {tool.icon === 'govt' && <Building2 className="w-6 h-6" />}
                    {tool.icon === 'ocr' && <Camera className="w-6 h-6" />}
                    {tool.icon === 'signature' && <FileSignature className="w-6 h-6" />}
                    {tool.icon === 'templates' && <CopyCheck className="w-6 h-6" />}
                    {tool.icon === 'excel' && <Table className="w-6 h-6" />}
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
          ))}
        </div>
      )}
    </section>
  );
};