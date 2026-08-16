import { ToolItem } from '@/types/document';

export const toolsData: ToolItem[] = [
  // 1. AI Studio (Featured Copilot)
  {
    id: 'ai-studio',
    titleHi: '🤖 AI डॉक्यूमेंट स्टूडियो & सह-पायलट',
    titleEn: '🤖 AI Document Studio & Copilot',
    descHi: 'ChatGPT/DeepSeek AI: 1-क्लिक में स्पेलिंग सुधार, सरकारी लेटर ड्राफ्टिंग व टेबल एक्सट्रैक्टर',
    descEn: 'AI copilot: Instant grammar fix, official formatting & table grid extraction',
    icon: 'ai-studio',
    category: 'ai',
    badgeHi: 'ChatGPT & DeepSeek',
    badgeEn: 'ChatGPT & DeepSeek',
    keywords: 'ai studio copilot chatgpt deepseek grammar spelling memo format letter'
  },

  // 2. iLovePDF Core Suite: Convert FROM PDF
  {
    id: 'pdf-to-word',
    titleHi: '📄 PDF to Word (AI OCR)',
    titleEn: '📄 PDF to Word Converter',
    descHi: 'PDF एवं स्कैन कागज़ात को 100% शुद्ध एडिटेबल Word (DOCX) में बदलें',
    descEn: 'Convert PDF & scanned documents into clean editable Word docs',
    icon: 'pdf-to-word',
    category: 'convert-from-pdf',
    badgeHi: 'Top #1',
    badgeEn: 'Top #1',
    keywords: 'pdf to word convert doc docx ocr scanner text'
  },
  {
    id: 'pdf-to-excel',
    titleHi: '📊 PDF to Excel (Table Extractor)',
    titleEn: '📊 PDF to Excel Converter',
    descHi: 'PDF तालिकाओं व सूचियों से डाटा निकालकर सीधे Excel (.xls) में बदलें',
    descEn: 'Pull data and tables straight from PDF into editable Excel sheets',
    icon: 'excel-to-pdf',
    category: 'convert-from-pdf',
    badgeHi: 'Excel Grid',
    badgeEn: 'Excel Grid',
    keywords: 'pdf to excel xls xlsx table matrix rows columns directory'
  },
  {
    id: 'pdf-to-jpg',
    titleHi: '🖼️ PDF to JPG',
    titleEn: '🖼️ PDF to JPG Image',
    descHi: 'PDF के पन्नों को अलग-अलग हाई-क्वालिटी JPG फोटो में बदलें',
    descEn: 'Extract each PDF page into high quality JPG images',
    icon: 'img-to-pdf',
    category: 'convert-from-pdf',
    keywords: 'pdf to jpg image extract pages photo export'
  },

  // 3. iLovePDF Core Suite: Convert TO PDF
  {
    id: 'word-to-pdf',
    titleHi: '📝 Word to PDF',
    titleEn: '📝 Word to PDF Converter',
    descHi: 'Word (DOC/DOCX) फ़ाइल को ओरिजिनल लेआउट के साथ PDF में बदलें',
    descEn: 'Convert Word document to PDF with layout & fonts preserved',
    icon: 'word-to-pdf',
    category: 'convert-to-pdf',
    keywords: 'word to pdf doc to pdf docx'
  },
  {
    id: 'excel-to-pdf',
    titleHi: '📊 Excel to PDF',
    titleEn: '📊 Excel to PDF Converter',
    descHi: 'Excel (XLS/XLSX) स्प्रेडशीट को सुंदर प्रिंटेबल PDF में बदलें',
    descEn: 'Convert Excel spreadsheets into clean printable PDF',
    icon: 'excel-to-pdf',
    category: 'convert-to-pdf',
    keywords: 'excel to pdf xls sheet'
  },
  {
    id: 'ppt-to-pdf',
    titleHi: '🖥️ PPT to PDF',
    titleEn: '🖥️ PPT to PDF Converter',
    descHi: 'PowerPoint प्रस्तुति (PPT/PPTX) को आसानी से PDF में बदलें',
    descEn: 'Convert PowerPoint slides to PDF format easily',
    icon: 'ppt-to-pdf',
    category: 'convert-to-pdf',
    keywords: 'ppt to pdf powerpoint slides'
  },
  {
    id: 'img-to-pdf',
    titleHi: '🖼️ JPG to PDF',
    titleEn: '🖼️ JPG to PDF Converter',
    descHi: 'JPG, PNG फोटो को 1 क्लिक में व्यवस्थित PDF फाइल बनाएं',
    descEn: 'Convert JPG, PNG photos into single clean PDF',
    icon: 'img-to-pdf',
    category: 'convert-to-pdf',
    keywords: 'jpg to pdf image to pdf photo to pdf'
  },

  // 4. iLovePDF Core Suite: Organize & Optimize PDF
  {
    id: 'merge-pdf',
    titleHi: '📚 Merge PDF (फाइलें जोड़ें)',
    titleEn: '📚 Merge PDF Files',
    descHi: 'कई PDF फ़ाइलों को क्रम से जोड़कर एक नई संयुक्त PDF बनाएं',
    descEn: 'Combine multiple PDF files into one single organized PDF',
    icon: 'merge-pdf',
    category: 'organize',
    badgeHi: 'पॉपुलर',
    badgeEn: 'Popular',
    keywords: 'merge pdf combine join multiple pdf'
  },
  {
    id: 'split-pdf',
    titleHi: '✂️ Split PDF (पन्ने अलग करें)',
    titleEn: '✂️ Split PDF by Range',
    descHi: 'बड़ी PDF से मनचाहे पेज रेंज (जैसे 1-3 या 2,5) अलग करें',
    descEn: 'Extract specific pages or page ranges from PDF document',
    icon: 'split-pdf',
    category: 'organize',
    keywords: 'split pdf cut extract pages separate'
  },
  {
    id: 'compress-pdf',
    titleHi: '🗜️ Compress PDF (साइज कम करें)',
    titleEn: '🗜️ Compress PDF Size',
    descHi: 'PDF का फाइल साइज (MB से KB) गुणवत्ता बनाए रखते हुए कम करें',
    descEn: 'Reduce PDF file size without losing readability & quality',
    icon: 'compress-pdf',
    category: 'organize',
    keywords: 'compress pdf reduce size small pdf mb to kb'
  },
  {
    id: 'rotate-pdf',
    titleHi: '🔄 Rotate PDF (पन्ने घुमाएं)',
    titleEn: '🔄 Rotate PDF Pages',
    descHi: 'उल्टे या टेढ़े PDF पन्नों को 90°, 180° या 270° पर सीधा करें',
    descEn: 'Rotate PDF pages 90, 180 or 270 degrees clockwise',
    icon: 'image-converter',
    category: 'organize',
    keywords: 'rotate pdf turn pages clockwise 90 degree'
  },
  {
    id: 'page-numbers',
    titleHi: '🔢 Add Page Numbers (पेज नंबर)',
    titleEn: '🔢 Add Page Numbers',
    descHi: 'PDF के सभी पन्नों पर हेडर/फूटर में ऑटोमैटिक पेज नंबर लगाएं',
    descEn: 'Add page numbers into your PDF documents with custom placement',
    icon: 'templates',
    category: 'organize',
    keywords: 'page numbers add number header footer pdf'
  },
  {
    id: 'pdf-watermark',
    titleHi: '🛡️ Add PDF Watermark (वाटरमार्क)',
    titleEn: '🛡️ Add PDF Watermark',
    descHi: 'PDF पर "CONFIDENTIAL", "ONLY FOR KYC" सुरक्षा वाटरमार्क लगाएं',
    descEn: 'Stamp custom security watermark text across all PDF pages',
    icon: 'watermark',
    category: 'security',
    keywords: 'watermark pdf stamp confidential kyc protect'
  },

  // 5. Bharat & Govt Special Daily Tools
  {
    id: 'photo-resizer',
    titleHi: '🖼️ फोटो व सिग्नेचर रिसाइज़र',
    titleEn: '🖼️ Govt Photo & Signature Resizer',
    descHi: 'SSC, बैंक, रेलवे फॉर्म हेतु फोटो/दस्तखत 20KB या 50KB सेट करें',
    descEn: 'Resize photos & signatures under 20KB/50KB for govt job forms',
    icon: 'photo-resizer',
    category: 'popular',
    badgeHi: 'Govt Special',
    badgeEn: 'Govt Special',
    keywords: 'photo resizer signature 20kb 50kb compress image ssc railway bank'
  },
  {
    id: 'passport-sheet',
    titleHi: '🖨️ पासपोर्ट फोटो प्रिंट शीट मेकर',
    titleEn: '🖨️ Passport Photo Sheet Maker',
    descHi: '1 फोटो से 4x6 पर 8 फोटो या A4 पर 30 फोटो की प्रिंटेबल शीट बनाएं',
    descEn: 'Generate printable 8-photo (4x6) or 30-photo (A4) sheets instantly',
    icon: 'passport-sheet',
    category: 'popular',
    keywords: 'passport photo sheet printable 4x6 a4 copies 8 photos 30'
  },
  {
    id: 'id-joiner',
    titleHi: '🪪 आधार/ID CARD फ्रंट-बैक जोडर',
    titleEn: '🪪 ID Card Front & Back Joiner',
    descHi: 'आधार, पैन व वोटर ID कार्ड के आगे-पीछे का भाग 1 पेज में जोड़ें',
    descEn: 'Combine Front and Back of Aadhaar, PAN or Voter ID onto 1 page',
    icon: 'id-joiner',
    category: 'popular',
    keywords: 'aadhaar joiner id card join front back side combine one page'
  },
  {
    id: 'resume',
    titleHi: '🤖 AI रिज्यूमे व बायोडाटा बिल्डर',
    titleEn: '🤖 AI Resume & Biodata Builder',
    descHi: '1 मिनट में प्रोफेशनल बायोडाटा/रिज्यूमे बनाएं और PDF डाउनलोड करें',
    descEn: 'Build professional Indian resume in 1 minute with instant PDF download',
    icon: 'resume',
    category: 'ai',
    keywords: 'resume builder biodata cv maker job create pdf'
  },
  {
    id: 'translate',
    titleHi: '🌐 हिंदी ↔ इंग्लिश ट्रांसलेटर',
    titleEn: '🌐 Hindi ↔ English AI Translator',
    descHi: 'सरकारी व ऑफिशियल पत्रों का तुरंत सटीक कानूनी अनुवाद करें',
    descEn: 'Instant translation for official, legal & govt work',
    icon: 'translate',
    category: 'ai',
    keywords: 'translate translator hindi english translation'
  },
  {
    id: 'ocr',
    titleHi: '📷 AI OCR (फोटो से टेक्स्ट निकालें)',
    titleEn: '📷 AI OCR Deep Scanner',
    descHi: 'कागज़/फोटो से हिंदी व इंग्लिश टेक्स्ट बाहर निकालें व टेबल बनाएं',
    descEn: 'Extract editable Hindi & English text from photos & paper images',
    icon: 'ocr',
    category: 'utilities',
    keywords: 'ocr photo to text image text extractor hindi english reader'
  },
  {
    id: 'age-calculator',
    titleHi: '🎂 सरकारी फॉर्म आयु कैलकुलेटर',
    titleEn: '🎂 Govt Form Age Calculator',
    descHi: 'कट-ऑफ तारीख तक अपनी सटीक उम्र (वर्ष, महीने, दिन) निकालें',
    descEn: 'Calculate exact age in Years, Months, Days on job cut-off date',
    icon: 'age-calculator',
    category: 'utilities',
    keywords: 'age calculator dob date of birth cutoff age calculate'
  },
  {
    id: 'gst-calculator',
    titleHi: '🧾 GST बिल कैलकुलेटर व रसीद',
    titleEn: '🧾 GST Bill Calculator & Receipt',
    descHi: '5%, 12%, 18%, 28% GST बिल जोड़ें व ग्राहक हेतु व्हाट्सएप रसीद बनाएं',
    descEn: 'Calculate GST bill with CGST/SGST breakdown & WhatsApp receipt',
    icon: 'gst-calculator',
    category: 'utilities',
    keywords: 'gst bill calculator cgst sgst receipt whatsapp bill'
  },
  {
    id: 'letter',
    titleHi: '📝 AI आवेदन पत्र (Letter Writer)',
    titleEn: '📝 AI Letter & Application Writer',
    descHi: 'छुट्टी, बैंक और सरकारी दफ्तर के लिए ऑटो-लेटर बनाएं',
    descEn: 'Auto-generate leave, bank & official complaint applications',
    icon: 'letter',
    category: 'ai',
    keywords: 'letter writer application leave request bank aavedan'
  },
  {
    id: 'affidavit',
    titleHi: '📜 शपथ पत्र व एफ़िडेविट मेकर',
    titleEn: '📜 AI Affidavit Generator',
    descHi: 'गैप ईयर, नाम सुधार व आय स्व-घोषणा पत्र लीगल ड्राफ्ट तैयार करें',
    descEn: 'Generate affidavits for Gap Year, Name Mismatch & Declarations',
    icon: 'affidavit',
    category: 'utilities',
    keywords: 'affidavit generator shapath patra gap year name correction legal'
  },
  {
    id: 'typing-counter',
    titleHi: '⌨️ वर्ड काउंटर व टाइपिंग टेस्ट',
    titleEn: '⌨️ Word Counter & Typing Test',
    descHi: 'अक्षर व शब्द गिनें तथा परीक्षा हेतु WPM टाइपिंग स्पीड टेस्ट दें',
    descEn: 'Count words & characters, measure exam WPM typing speed',
    icon: 'typing-counter',
    category: 'utilities',
    keywords: 'word counter character count typing speed test wpm'
  },
  {
    id: 'excel',
    titleHi: '📊 एक्सेल AI असिस्टेंट (Formula Helper)',
    titleEn: '📊 Excel AI Assistant',
    descHi: 'एक्सेल फ़ॉर्मूला (VLOOKUP, SUM, GST) और डेटा शीट में सहायता पाएं',
    descEn: 'Get instant Excel formulas & data management helper',
    icon: 'excel',
    category: 'utilities',
    keywords: 'excel formula vlookup sum gst calculation assistant'
  },
  {
    id: 'govt',
    titleHi: '📑 सरकारी फॉर्म गाइड',
    titleEn: '📑 Govt Form Guide',
    descHi: 'आय, जाति, निवास और पैन कार्ड फॉर्म की संपूर्ण चेकलिस्ट',
    descEn: 'Complete guide & document checklist for Indian Govt Forms',
    icon: 'govt',
    category: 'popular',
    keywords: 'govt form income certificate caste certificate pan checklist'
  },
  {
    id: 'signature',
    titleHi: '✍️ डिजिटल सिग्नेचर मेकर',
    titleEn: '✍️ Digital Signature Creator',
    descHi: 'टाइप या हाथ से ड्रा करके पारदर्शी (Transparent PNG) दस्तखत बनाएं',
    descEn: 'Create transparent PNG signatures by typing or drawing',
    icon: 'signature',
    category: 'utilities',
    keywords: 'signature maker digital sign draw signature transparent'
  },
  {
    id: 'templates',
    titleHi: '📋 रेडीमेड लीगल टेम्पलेट्स',
    titleEn: '📋 Ready Legal Templates',
    descHi: 'किरायानामा, रसीद, सैलेरी स्लिप व अनुभव प्रमाण पत्र फॉर्मैट्स',
    descEn: 'Ready formats for rent agreement, receipts, salary slips',
    icon: 'templates',
    category: 'popular',
    keywords: 'document templates rent agreement payment receipt salary slip'
  },
];