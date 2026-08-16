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

    if (value.trim().length > 0) {
      const toolsElement = document.getElementById('tools');
      if (toolsElement) {
        toolsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toolsElement = document.getElementById('tools');
    if (toolsElement) {
      toolsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative bg-slate-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-3 tracking-tight">
          {lang === 'hi' ? (
            <>
              हर डॉक्यूमेंट का आसान और <span className="text-orange-600">सटीक समाधान</span>
            </>
          ) : (
            <>
              Simple and <span className="text-orange-600">Accurate Solutions</span> for All Documents
            </>
          )}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mb-6 leading-relaxed">
          {lang === 'hi'
            ? 'PDF to Word, Excel, फोटो रिसाइज़र, AI रिज्यूमे, सरकारी फॉर्म गाइड और हिंदी-इंग्लिश अनुवादक - सब कुछ एक ही जगह।'
            : 'PDF to Word, Excel, Photo Resizer, AI Resume, Govt Form Guide & Hindi-English Translator - All in one place.'}
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto shadow-sm rounded-xl bg-white p-1.5 border border-slate-300 focus-within:border-orange-500 transition-colors">
          <div className="flex items-center gap-1.5 pl-2 pr-0.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={lang === 'hi' ? 'टूल खोजें (जैसे: PDF, Word, Excel, फोटो रिसाइज़र...)' : 'Search tool (e.g. PDF, Word, Excel, Photo resizer...)'}
              className="border-none shadow-none focus-visible:ring-0 text-xs sm:text-sm placeholder:text-slate-400 h-8 p-1 flex-1 min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-sm shrink-0 gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'खोजें' : 'Search'}</span>
            </Button>
          </div>
        </form>

        {/* Badges */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-[11px] text-slate-500 font-semibold">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'hi' ? '100% सुरक्षित' : '100% Secure'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'hi' ? 'सुपर फ़ास्ट स्पीड' : 'Super Fast'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>{lang === 'hi' ? 'मेड फॉर भारत' : 'Made for India'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};