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
  Table,
  FileSpreadsheet,
  Presentation,
  FileImage,
  Layers,
  Scissors,
  Minimize2,
  Image as ImageIcon,
  CreditCard
} from 'lucide-react';

interface ToolGridProps {
  lang: Language;
  searchQuery: string;
  onSelectTool: (toolId: string) => void;
}

export const toolsData: ToolItem[] = [
  {
    id: 'photo-resizer',
    titleHi: '🖼️ फोटो व सिग्नेचर रिसाइज़र',
    titleEn: '🖼️ Govt Photo & Signature Resizer',
    descHi: 'SSC, बैंक व रेलवे फॉर्म के लिए फोटो/दस्तखत 20KB या 50KB सेट करें',
    descEn: 'Resize photos & signatures under 20KB/50KB for govt job forms',
    icon: 'photo-resizer',
    category: 'popular',
    badgeHi: 'सरकारी फॉर्म स्पेशल',
    badgeEn: 'Govt Form Special',
  },
  {
    id: 'id-joiner',
    titleHi: '🪪 आधार/ID कार्ड फ्रंट-बैक जोडर',
    titleEn: '🪪 ID Card Front & Back Joiner',
    descHi: 'आधार, पैन व वोटर ID कार्ड के आगे-पीछे का भाग 1 पेज में जोड़ें',
    descEn: 'Combine Front and Back of Aadhaar, PAN or Voter ID onto 1 page',
    icon: 'id-joiner',
    category: 'popular',
    badgeHi: 'उपयोगी',
    badgeEn: 'Useful',
  },
  {
    id: 'pdf-to-word',
    titleHi: '📄 PDF to Word',
    titleEn: '📄 PDF to Word Converter',
    descHi: 'PDF फ़ाइल को एडिटेबल Word (DOCX) फ़ाइल में बदलें',
    descEn: 'Convert PDF files to editable Word (DOCX) document',
    icon: 'pdf-to-word',
    category: 'pdf',
    badgeHi: 'टॉप 1',
    badgeEn: 'Top #1',
  },
  {
    id: 'word-to-pdf',
    titleHi: '📝 Word to PDF',
    titleEn: '📝 Word to PDF Converter',
    descHi: 'Word (DOC/DOCX) फ़ाइल को तुरंत सुरक्षित PDF में बदलें',
    descEn: 'Convert Word document to secure high quality PDF',
    icon: 'word-to-pdf',
    category: 'pdf',
    badgeHi: 'लोकप्रिय',
    badgeEn: 'Popular',
  },
  {
    id: 'excel-to-pdf',
    titleHi: '📊 Excel to PDF',
    titleEn: '📊 Excel to PDF Converter',
    descHi: 'Excel (XLS/XLSX) शीट्स को PDF फॉर्मेट में कन्वर्ट करें',
    descEn: 'Convert Excel spreadsheets into clean PDF documents',
    icon: 'excel-to-pdf',
    category: 'pdf',
  },
  {
    id: 'ppt-to-pdf',
    titleHi: '🖥️ PPT to PDF',
    titleEn: '🖥️ PPT to PDF Converter',
    descHi: 'PowerPoint प्रस्तुति (PPT/PPTX) को आसानी से PDF में बदलें',
    descEn: 'Convert PowerPoint slides to PDF format easily',
    icon: 'ppt-to-pdf',
    category: 'pdf',
  },
  {
    id: 'img-to-pdf',
    titleHi: '🖼️ Image to PDF',
    titleEn: '🖼️ Image to PDF Converter',
    descHi: 'JPG, PNG फोटो से तुरंत 1 क्लिक में PDF बनाएं',
    descEn: 'Convert JPG, PNG photos into single PDF file',
    icon: 'img-to-pdf',
    category: 'pdf',
    badgeHi: 'सुपर फ़ास्ट',
    badgeEn: 'Fast',
  },
  {
    id: 'merge-pdf',
    titleHi: '📚 Merge PDF',
    titleEn: '📚 Merge PDF Files',
    descHi: 'कई PDF फ़ाइलों को जोड़कर एक नया PDF बनाएं',
    descEn: 'Combine multiple PDF files into one single PDF',
    icon: 'merge-pdf',
    category: 'pdf',
  },
  {
    id: 'split-pdf',
    titleHi: '✂️ Split PDF',
    titleEn: '✂️ Split PDF File',
    descHi: 'बड़ी PDF के पन्नों को अलग-अलग टुकड़ों में बांटें',
    descEn: 'Extract or split pages from large PDF document',
    icon: 'split-pdf',
    category: 'pdf',
  },
  {
    id: 'compress-pdf',
    titleHi: '🗜️ Compress PDF',
    titleEn: '🗜️ Compress PDF Size',
    descHi: 'PDF का साइज (MB से KB) क्वालिटी बिना घटाए कम करें',
    descEn: 'Reduce PDF file size without losing quality',
    icon: 'compress-pdf',
    category: 'pdf',
    badgeHi: 'कम साइज',
    badgeEn: 'Reduce MB',
  },
  {
    id: 'ocr',
    titleHi: '📷 OCR (फोटो से टेक्स्ट)',
    titleEn: '📷 OCR Text Extractor',
    descHi: 'कागज़/फोटो से हिंदी व इंग्लिश टेक्स्ट बाहर निकालें',
    descEn: 'Extract Hindi & English text from photos & scanned pages',
    icon: 'ocr',
    category: 'utilities',
    badgeHi: 'AI OCR',
    badgeEn: 'AI OCR',
  },
  {
    id: 'resume',
    titleHi: '🤖 AI रिज्यूमे बिल्डर',
    titleEn: '🤖 AI Resume Builder',
    descHi: '1 मिनट में प्रोफेशनल बायोडाटा/रिज्यूमे बनाएं और डाउनलोड करें',
    descEn: 'Build professional Indian resume in 1 minute',
    icon: 'resume',
    category: 'ai',
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
                    {tool.icon === 'photo-resizer' && <ImageIcon className="w-6 h-6" />}
                    {tool.icon === 'id-joiner' && <CreditCard className="w-6 h-6" />}
                    {tool.icon === 'pdf-to-word' && <FileText className="w-6 h-6" />}
                    {tool.icon === 'word-to-pdf' && <FileText className="w-6 h-6" />}
                    {tool.icon === 'excel-to-pdf' && <FileSpreadsheet className="w-6 h-6" />}
                    {tool.icon === 'ppt-to-pdf' && <Presentation className="w-6 h-6" />}
                    {tool.icon === 'img-to-pdf' && <FileImage className="w-6 h-6" />}
                    {tool.icon === 'merge-pdf' && <Layers className="w-6 h-6" />}
                    {tool.icon === 'split-pdf' && <Scissors className="w-6 h-6" />}
                    {tool.icon === 'compress-pdf' && <Minimize2 className="w-6 h-6" />}
                    {tool.icon === 'ocr' && <Camera className="w-6 h-6" />}
                    {tool.icon === 'resume' && <UserCheck className="w-6 h-6" />}
                    {tool.icon === 'translate' && <Globe className="w-6 h-6" />}
                    {tool.icon === 'letter' && <PenTool className="w-6 h-6" />}
                    {tool.icon === 'govt' && <Building2 className="w-6 h-6" />}
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