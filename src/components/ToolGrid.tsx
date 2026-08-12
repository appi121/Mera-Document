import React, { useState } from 'react';
import { Language, ToolItem } from '@/types/document';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdBanner } from '@/components/AdBanner';
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
  CreditCard,
  Grid,
  FileCheck2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Keyboard,
  Receipt
} from 'lucide-react';

interface ToolGridProps {
  lang: Language;
  searchQuery: string;
  onSelectTool: (toolId: string) => void;
}

export const toolsData: ToolItem[] = [
  // 1st to 5th Tools (यूर्जर की आवश्यकतानुसार टॉप 5 का क्रम)
  {
    id: 'pdf-to-word',
    titleHi: '📄 PDF to Word (स्कैन OCR स्पेशल)',
    titleEn: '📄 PDF to Word Converter (AI OCR)',
    descHi: 'PDF एवं स्कैन कागज़ात को एडिटेबल Word (DOCX) फ़ाइल में बदलें',
    descEn: 'Convert PDF & scanned paper photos into editable Word documents',
    icon: 'pdf-to-word',
    category: 'popular',
    badgeHi: 'टॉप 1 टूल',
    badgeEn: 'Top #1 Tool',
  },
  {
    id: 'word-to-pdf',
    titleHi: '📝 Word to PDF',
    titleEn: '📝 Word to PDF Converter',
    descHi: 'Word (DOC/DOCX) फ़ाइल को तुरंत सुरक्षित PDF में बदलें',
    descEn: 'Convert Word document to secure high quality PDF',
    icon: 'word-to-pdf',
    category: 'pdf',
    badgeHi: '2nd टूल',
    badgeEn: 'Top #2 Tool',
  },
  {
    id: 'excel-to-pdf',
    titleHi: '📊 Excel to PDF',
    titleEn: '📊 Excel to PDF Converter',
    descHi: 'Excel (XLS/XLSX) शीट्स को PDF फॉर्मेट में कनवर्ट करें',
    descEn: 'Convert Excel spreadsheets into clean PDF documents',
    icon: 'excel-to-pdf',
    category: 'pdf',
    badgeHi: '3rd टूल',
    badgeEn: 'Top #3 Tool',
  },
  {
    id: 'ppt-to-pdf',
    titleHi: '🖥️ PPT to PDF',
    titleEn: '🖥️ PPT to PDF Converter',
    descHi: 'PowerPoint प्रस्तुति (PPT/PPTX) को आसानी से PDF में बदलें',
    descEn: 'Convert PowerPoint slides to PDF format easily',
    icon: 'ppt-to-pdf',
    category: 'pdf',
    badgeHi: '4th टूल',
    badgeEn: 'Top #4 Tool',
  },
  {
    id: 'excel',
    titleHi: '📊 एक्सेल AI असिस्टेंट (Excel Formula)',
    titleEn: '📊 Excel AI Assistant & Formula Helper',
    descHi: 'एक्सेल फ़ॉर्मूला (VLOOKUP, SUM, GST) और डेटा शीट में सहायता पाएं',
    descEn: 'Get instant Excel formulas & data management helper',
    icon: 'excel',
    category: 'utilities',
    badgeHi: '5th टूल',
    badgeEn: 'Top #5 Tool',
  },

  // अन्य सभी मुख्य व उपयोगी टूल्स
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
    id: 'ocr',
    titleHi: '📷 OCR (फोटो से टेक्स्ट निकालें)',
    titleEn: '📷 OCR Photo Text Extractor',
    descHi: 'कागज़/फोटो से हिंदी व इंग्लिश टेक्स्ट बाहर निकालें व कॉपी करें',
    descEn: 'Extract editable Hindi & English text from photos & paper images',
    icon: 'ocr',
    category: 'utilities',
    badgeHi: 'AI OCR',
    badgeEn: 'AI OCR',
  },
  {
    id: 'resume',
    titleHi: '🤖 AI रिज्यूमे व बायोडाटा बिल्डर',
    titleEn: '🤖 AI Resume & Biodata Builder',
    descHi: '1 मिनट में प्रोफेशनल बायोडाटा/रिज्यूमे बनाएं और PDF डाउनलोड करें',
    descEn: 'Build professional Indian resume in 1 minute with instant PDF download',
    icon: 'resume',
    category: 'ai',
    badgeHi: 'AI पावर',
    badgeEn: 'AI Powered',
  },
  {
    id: 'translate',
    titleHi: '🌐 हिंदी ↔ इंग्लिश ट्रांसलेटर',
    titleEn: '🌐 Hindi ↔ English AI Translator',
    descHi: 'सरकारी व ऑफिशियल पत्रों का तुरंत सटीक अनुवाद करें',
    descEn: 'Instant translation for official, legal & govt work',
    icon: 'translate',
    category: 'ai',
    badgeHi: 'अनिवार्य',
    badgeEn: 'Essential',
  },
  {
    id: 'letter',
    titleHi: '📝 AI आवेदन पत्र (Letter Writer)',
    titleEn: '📝 AI Letter & Application Writer',
    descHi: 'छुट्टी, बैंक और सरकारी दफ्तर के लिए ऑटो-लेटर बनाएं',
    descEn: 'Auto-generate leave, bank & official complaint applications',
    icon: 'letter',
    category: 'ai',
  },
  {
    id: 'govt',
    titleHi: '📑 सरकारी फॉर्म असिस्टेंट',
    titleEn: '📑 Govt Form Guide & Assistant',
    descHi: 'आय, जाति, निवास और पैन कार्ड फॉर्म की संपूर्ण गाइड व लिस्ट',
    descEn: 'Complete guide & document checklist for Indian Govt Forms',
    icon: 'govt',
    category: 'popular',
  },
  {
    id: 'signature',
    titleHi: '✍️ डिजिटल सिग्नेचर मेकर',
    titleEn: '✍️ Digital Signature Creator',
    descHi: 'टाइप या हाथ से ड्रा करके पारदर्शी (Transparent PNG) दस्तखत बनाएं',
    descEn: 'Create transparent PNG signatures by typing or drawing',
    icon: 'signature',
    category: 'utilities',
  },
  {
    id: 'passport-sheet',
    titleHi: '🖨️ पासपोर्ट फोटो प्रिंट शीट मेकर',
    titleEn: '🖨️ Passport Photo Sheet Maker',
    descHi: '1 फोटो से 4x6 पर 8 फोटो या A4 पर 30 फोटो की रेडी प्रिंट शीट बनाएं',
    descEn: 'Generate printable 8-photo (4x6) or 30-photo (A4) sheets instantly',
    icon: 'passport-sheet',
    category: 'popular',
    badgeHi: 'मोस्ट वांटेड',
    badgeEn: 'Most Popular',
  },
  {
    id: 'id-joiner',
    titleHi: '🪪 आधार/ID कार्ड फ्रंट-बैक जोडर',
    titleEn: '🪪 ID Card Front & Back Joiner',
    descHi: 'आधार, पैन व वोटर ID कार्ड के आगे-पीछे का भाग 1 पेज में जोड़ें',
    descEn: 'Combine Front and Back of Aadhaar, PAN or Voter ID onto 1 page',
    icon: 'id-joiner',
    category: 'popular',
    badgeHi: 'बहुत उपयोगी',
    badgeEn: 'Must Have',
  },
  {
    id: 'age-calculator',
    titleHi: '🎂 सरकारी फॉर्म आयु कैलकुलेटर',
    titleEn: '🎂 Govt Form Age Calculator',
    descHi: 'कट-ऑफ तारीख तक अपनी सटीक उम्र (वर्ष, महीने, दिन) निकालें',
    descEn: 'Calculate exact age in Years, Months, Days on job cut-off date',
    icon: 'age-calculator',
    category: 'popular',
  },
  {
    id: 'image-converter',
    titleHi: '🔄 इमेज कनवर्टर (JPG, PNG, WEBP)',
    titleEn: '🔄 Image Format & Target KB Converter',
    descHi: 'WEBP/PNG फोटो को JPG में बदलें और मनचाहे KB में सेट करें',
    descEn: 'Convert WEBP/PNG to JPG & squeeze image to exact KB size',
    icon: 'image-converter',
    category: 'popular',
  },
  {
    id: 'watermark',
    titleHi: '🛡️ डॉक्यूमेंट सुरक्षा वाटरमार्क',
    titleEn: '🛡️ Document Security Watermark',
    descHi: 'आधार व पैन कार्ड पर "ONLY FOR KYC" वाटरमार्क लगाकर फ्रॉड रोकें',
    descEn: 'Add protective "ONLY FOR BANK KYC" watermark on ID cards',
    icon: 'watermark',
    category: 'popular',
    badgeHi: 'सुरक्षा स्पेशल',
    badgeEn: 'Anti-Fraud',
  },
  {
    id: 'affidavit',
    titleHi: '📜 शपथ पत्र व एफ़िडेविट मेकर',
    titleEn: '📜 AI Affidavit Generator',
    descHi: 'गैप ईयर, नाम सुधार व आय स्व-घोषणा पत्र लीगल ड्राफ्ट तैयार करें',
    descEn: 'Generate affidavits for Gap Year, Name Mismatch & Declarations',
    icon: 'affidavit',
    category: 'utilities',
    badgeHi: 'लीगल',
    badgeEn: 'Legal Draft',
  },
  {
    id: 'typing-counter',
    titleHi: '⌨️ वर्ड काउंटर व टाइपिंग स्पीड टेस्ट',
    titleEn: '⌨️ Word Counter & WPM Typing Test',
    descHi: 'अक्षर व शब्द गिनें तथा परीक्षा हेतु WPM टाइपिंग स्पीड टेस्ट दें',
    descEn: 'Count words & characters, measure exam WPM typing speed',
    icon: 'typing-counter',
    category: 'utilities',
  },
  {
    id: 'gst-calculator',
    titleHi: '🧾 GST बिल कैलकुलेटर व रसीद',
    titleEn: '🧾 GST Bill Calculator & Receipt',
    descHi: '5%, 12%, 18%, 28% GST बिल जोड़ें व ग्राहक हेतु व्हाट्सएप रसीद बनाएं',
    descEn: 'Calculate GST bill with CGST/SGST breakdown & WhatsApp receipt',
    icon: 'gst-calculator',
    category: 'utilities',
    badgeHi: 'दुकानदार स्पेशल',
    badgeEn: 'Bill & Receipt',
  },
  {
    id: 'img-to-pdf',
    titleHi: '🖼️ Image to PDF',
    titleEn: '🖼️ Image to PDF Converter',
    descHi: 'JPG, PNG फोटो से तुरंत 1 क्लिक में PDF बनाएं',
    descEn: 'Convert JPG, PNG photos into single PDF file',
    icon: 'img-to-pdf',
    category: 'pdf',
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
    id: 'compress-pdf',
    titleHi: '🗜️ Compress PDF',
    titleEn: '🗜️ Compress PDF Size',
    descHi: 'PDF का साइज (MB से KB) क्वालिटी बिना घटाए कम करें',
    descEn: 'Reduce PDF file size without losing quality',
    icon: 'compress-pdf',
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
    id: 'templates',
    titleHi: '📋 डॉक्यूमेंट टेम्पलेट्स',
    titleEn: '📋 Document Templates',
    descHi: 'किरायानामा, रसीद, सैलेरी स्लिप के रेडीमेड फॉर्मेट्स',
    descEn: 'Ready formats for rent agreement, receipts, salary slips',
    icon: 'templates',
    category: 'popular',
  },
];

export const ToolGrid: React.FC<ToolGridProps> = ({ lang, searchQuery, onSelectTool }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTools = toolsData.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      t.titleHi.toLowerCase().includes(query) ||
      t.titleEn.toLowerCase().includes(query) ||
      t.descHi.toLowerCase().includes(query) ||
      t.descEn.toLowerCase().includes(query)
    );

    if (activeCategory === 'all') return matchesSearch;
    if (activeCategory === 'pdf') return matchesSearch && (t.category === 'pdf' || t.id.includes('pdf'));
    if (activeCategory === 'govt') return matchesSearch && (t.id === 'photo-resizer' || t.id === 'image-converter' || t.id === 'age-calculator' || t.id === 'watermark' || t.id === 'passport-sheet' || t.id === 'id-joiner' || t.id === 'govt' || t.id === 'affidavit');
    if (activeCategory === 'ai') return matchesSearch && (t.category === 'ai' || t.category === 'utilities' || t.id === 'excel' || t.id === 'typing-counter' || t.id === 'gst-calculator');

    return matchesSearch;
  });

  return (
    <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {lang === 'hi' ? 'सभी टूल एक ही जगह' : 'All Tools in One Place'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'hi' ? 'अपनी आवश्यकतानुसार श्रेणी या टूल पर क्लिक करें:' : 'Select a category or click on any tool:'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'all' ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {lang === 'hi' ? 'सभी (All)' : 'All Tools'}
          </button>
          <button
            onClick={() => setActiveCategory('pdf')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'pdf' ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {lang === 'hi' ? '📄 PDF टूल' : 'PDF Tools'}
          </button>
          <button
            onClick={() => setActiveCategory('govt')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'govt' ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {lang === 'hi' ? '🖼️ फॉर्म, फोटो व ID' : 'Forms & Photos'}
          </button>
          <button
            onClick={() => setActiveCategory('ai')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'ai' ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {lang === 'hi' ? '🤖 AI व यूटिलिटीज' : 'AI & Utilities'}
          </button>
        </div>
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            {lang === 'hi' ? 'कोई टूल नहीं मिला। कृपया अलग शब्द खोजें।' : 'No tools found matching your query.'}
          </p>
        </div>
      ) : (
        <>
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
                      {tool.icon === 'image-converter' && <RefreshCw className="w-6 h-6" />}
                      {tool.icon === 'gst-calculator' && <Receipt className="w-6 h-6" />}
                      {tool.icon === 'typing-counter' && <Keyboard className="w-6 h-6" />}
                      {tool.icon === 'age-calculator' && <Clock className="w-6 h-6" />}
                      {tool.icon === 'watermark' && <ShieldCheck className="w-6 h-6" />}
                      {tool.icon === 'passport-sheet' && <Grid className="w-6 h-6" />}
                      {tool.icon === 'id-joiner' && <CreditCard className="w-6 h-6" />}
                      {tool.icon === 'affidavit' && <FileCheck2 className="w-6 h-6" />}
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

          {/* Strategic AdSense Placement Slot */}
          <AdBanner className="mt-10" />
        </>
      )}
    </section>
  );
};