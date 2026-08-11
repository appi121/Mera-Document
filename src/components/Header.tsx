import React from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, setLang, onHomeClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          onClick={onHomeClick}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl bg-gradient-to-r from-orange-600 to-indigo-700 bg-clip-text text-transparent">
                मेरा डॉक्यूमेंट
              </span>
              <Badge variant="outline" className="border-orange-300 text-orange-600 text-[10px] px-1.5 py-0">
                <Sparkles className="w-2.5 h-2.5 mr-1" /> AI Powered
              </Badge>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">Mera Document • All-in-One Solution</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="rounded-full border-orange-200 hover:bg-orange-50 hover:text-orange-600 font-medium text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-orange-500" />
            <span>{lang === 'hi' ? 'English me dekhein' : 'हिंदी में देखें'}</span>
          </Button>

          <a 
            href="#tools" 
            className="hidden md:inline-flex px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow hover:shadow-md transition-all hover:opacity-95"
          >
            {lang === 'hi' ? 'सभी टूल देखें' : 'View All Tools'}
          </a>
        </div>
      </div>
    </header>
  );
};