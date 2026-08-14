import React from 'react';
import { Language } from '@/types/document';
import { Search, Sparkles, ShieldCheck, Zap, Heart, Brain, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeroBannerProps {
  lang: Language;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAiStudio?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ lang, searchQuery, setSearchQuery, onOpenAiStudio }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Smooth scroll to tools grid if user starts typing
    if (value.trim().length > 0) {
      const toolsElement = document.getElementById('tools');
      if (toolsElement) {
        toolsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-amber-50/40 to-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-orange-100">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-orange-800 text-xs sm:text-sm font-semibold mb-4 border border-orange-200/60 shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-orange-600" />
          {lang === 'hi' 
            ? 'भारत का अपना भरोसेमंद ChatGPT & DeepSeek AI डॉक्यूमेंट प्लेटफॉर्म' 
            : 'India’s Favorite AI Document Platform (ChatGPT & DeepSeek Powered)'}
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

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 font-normal leading-relaxed">
          {lang === 'hi'
            ? 'ChatGPT/DeepSeek लेवल AI: फोटो से शुद्ध डॉक्यूमेंट कनवर्टर, AI रिज्यूमे, सरकारी फॉर्म, हिंदी-इंग्लिश अनुवाद व डिजिटल सिग्नेचर!'
            : 'ChatGPT/DeepSeek Level AI: Error-Free Document Fixer, AI Resume Builder, Govt Form Guide & Table Extractor!'}
        </p>

        {/* AI Studio Call to Action Banner */}
        {onOpenAiStudio && (
          <div className="mb-6 max-w-xl mx-auto bg-gradient-to-r from-orange-600 to-amber-600 text-white p-3 rounded-2xl shadow-md flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <Brain className="w-7 h-7 text-amber-200 shrink-0" />
              <div>
                <p className="font-extrabold text-xs sm:text-sm">
                  {lang === 'hi' ? '🤖 AI डॉक्यूमेंट स्टूडियो व सह-पायलट' : '🤖 AI Document Studio & Copilot'}
                </p>
                <p className="text-[11px] text-orange-100">
                  {lang === 'hi' ? 'किसी भी कागज़/टेक्स्ट में 1-क्लिक त्रुटि सुधार व फॉर्मेटिंग' : 'Fix grammar, official format & table grid instantly'}
                </p>
              </div>
            </div>

            <Button
              onClick={onOpenAiStudio}
              className="bg-white hover:bg-orange-50 text-orange-700 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shrink-0 shadow"
            >
              {lang === 'hi' ? 'AI चालू करें ➔' : 'Open AI Studio ➔'}
            </Button>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative shadow-lg rounded-2xl bg-white p-2 border-2 border-orange-300 focus-within:border-orange-500 transition-colors">
          <div className="flex items-center px-3">
            <Search className="w-5 h-5 text-orange-600 mr-2 shrink-0" />
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={lang === 'hi' ? 'टूल खोजें (जैसे: PDF, Word, Excel, फोटो रिसाइज़र, रिज्यूमे, OCR...)' : 'Search tool (e.g. PDF, Word, Excel, Photo resizer, Resume, OCR...)'}
              className="border-none shadow-none focus-visible:ring-0 text-sm sm:text-base placeholder:text-gray-400 p-1"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs sm:text-sm text-gray-600 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? '100% सुरक्षित और मुफ्त' : '100% Secure & Private'}</span>
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