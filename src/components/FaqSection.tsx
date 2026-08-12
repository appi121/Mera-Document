import React from 'react';
import { Language } from '@/types/document';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Sparkles } from 'lucide-react';

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const faqs = [
    {
      qHi: '1. फोटो और हस्ताक्षर को 20KB या 50KB में कैसे रिसाइज करें?',
      qEn: '1. How to resize photo and signature under 20KB or 50KB?',
      aHi: 'हमारे "फोटो व सिग्नेचर रिसाइज़र" टूल में अपनी फोटो अपलोड करें और SSC, रेलवे या बैंक फॉर्म का ऑप्शन चुनें। टूल ऑटोमैटिक फोटो का साइज 20KB/50KB से कम करके आपको डाउनलोड लिंक दे देगा।',
      aEn: 'Upload your image in our "Photo & Signature Resizer" tool, select your form type (SSC, Banking, Railway) and the tool will automatically compress it under 20KB/50KB with correct dimensions.',
    },
    {
      qHi: '2. क्या मेरी फाइलें और दस्तावेज सर्वर पर सेव होते हैं?',
      qEn: '2. Are my documents or photos stored on any server?',
      aHi: 'नहीं! "मेरा डॉक्यूमेंट" 100% प्राइवेट और सुरक्षित है। आपकी कोई भी फोटो, आधार कार्ड या PDF हमारे सर्वर पर अपलोड नहीं होती। सारा काम सीधे आपके मोबाइल/कंप्यूटर के ब्राउज़र में ही होता है।',
      aEn: 'No! Mera Document is 100% private and client-side processed. None of your photos, Aadhaar cards, or PDFs are uploaded or saved on any server. Everything happens locally inside your browser.',
    },
    {
      qHi: '3. क्या स्कैन (फोटो वाली) PDF से भी हिंदी टेक्स्ट निकाला जा सकता है?',
      qEn: '3. Can we extract Hindi text from scanned PDF or image documents?',
      aHi: 'हाँ! हमारे PDF to Word टूल में एडवांस्ड AI OCR तकनीक लगी है जो स्कैन की गई या फोटो खींची गई PDF (जैसे भागसुर चौकी रिपोर्ट, पुराना सरकारी पत्र) से भी 100% शुद्धता के साथ हिंदी और इंग्लिश टेक्स्ट निकाल देती है।',
      aEn: 'Yes! Our PDF to Word converter utilizes advanced AI OCR that reads scanned or photographed PDF pages and extracts clean, editable Hindi and English text.',
    },
    {
      qHi: '4. आधार कार्ड के आगे और पीछे का भाग एक पेज पर कैसे जोड़ें?',
      qEn: '4. How to combine Aadhaar card front and back onto one printable page?',
      aHi: 'आप हमारे "आधार/ID कार्ड फ्रंट-बैक जोडर" टूल में आगे की फोटो और पीछे की फोटो अपलोड करें। टूल दोनों को सही साइज में एक ही प्रिंटेबल शीट पर लाकर JPG दे देगा।',
      aEn: 'Use our "ID Card Front & Back Joiner" tool. Upload the front photo and back photo of your Aadhaar or PAN card, and the tool will merge them onto a single sheet.',
    },
    {
      qHi: '5. क्या यह प्लेटफॉर्म मोबाइल और कंप्यूटर दोनों पर मुफ़्त है?',
      qEn: '5. Is this platform completely free on both Mobile and Computer?',
      aHi: 'जी हाँ! "मेरा डॉक्यूमेंट" सभी यूजर्स, छात्रों और जन सेवा केंद्रों (CSC / ई-मित्र) के लिए 100% मुफ्त है।',
      aEn: 'Yes! Mera Document is 100% free for all users, students, and Cyber Cafe / CSC centers.',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          {lang === 'hi' ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {lang === 'hi' ? 'आपके मन के सवाल और उनके आसान जवाब' : 'Got Questions? We Have Answers'}
        </h2>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className="bg-white border border-orange-100 rounded-2xl px-4 shadow-sm">
            <AccordionTrigger className="text-left font-bold text-sm sm:text-base text-gray-900 hover:text-orange-600 py-4">
              {lang === 'hi' ? faq.qHi : faq.qEn}
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-gray-600 leading-relaxed pb-4 pt-1 font-normal border-t border-gray-100">
              {lang === 'hi' ? faq.aHi : faq.aEn}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};