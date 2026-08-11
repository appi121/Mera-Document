import React from 'react';
import { Language } from '@/types/document';
import { Search, Sparkles, ShieldCheck, Zap, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeroBannerProps {
  lang: Language;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ lang, searchQuery, setSearchQuery }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-amber-50/40 to-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-orange-100">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-orange-800 text-xs sm:text-sm font-semibold mb-4 border border-orange-200/60 shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-orange-600" />
          {lang === 'hi' 
            ? 'भारत का अपना भरोसेमंद AI डॉक्यूमेंट प्लेटफॉर्म' 
            : 'India’s Favorite AI Document Platform'}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
          {lang === 'hi' ? (
            <>
              एक ही जगह <span className="text-orange-600 underline decoration-amber-400 decoration-wavy decoration-2">सभी डॉक्यूमेंट्स</span> बनाएं, ट्रांसलेट और एडिट करें
            </>
          ) : (
            <>
              Create, Translate & Edit <span className="text-orange-600 underline decoration-amber-400 decoration-wavy decoration-2">All Documents</span> in One Place
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          {lang === 'hi'
            ? 'PDF एडिट, AI रिज्यूमे, सरकारी फॉर्म, हिंदी-इंग्लिश अनुवाद, डिजिटल सिग्नेचर और OCR - सब कुछ आसान और मुफ्त!'
            : 'PDF Edit, AI Resume Builder, Govt Form Guide, Hindi ↔ English Translation, OCR & Digital Signatures - All Free & Easy!'}
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative shadow-lg rounded-2xl bg-white p-2 border border-orange-200">
          <div className="flex items-center px-3">
            <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'टूल खोजें (जैसे: रिज्यूमे, PDF, OCR, फॉर्म, लेटर...)' : 'Search tool (e.g. Resume, PDF, OCR, Form, Letter...)'}
              className="border-none shadow-none focus-visible:ring-0 text-sm sm:text-base placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Badges */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs sm:text-sm text-gray-600 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? '100% सुरक्षित और सुरक्षित' : '100% Secure & Private'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{lang === 'hi' ? 'सुपर फ़ास्ट AI स्पीड' : 'Super Fast AI Speed'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>{lang === 'hi' ? 'मेड फॉर भारत' : 'Made for India'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};