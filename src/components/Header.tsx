import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  FileText, 
  Globe, 
  Sparkles, 
  Home, 
  Brain, 
  Image as ImageIcon, 
  Grid, 
  Menu,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onHomeClick: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, setLang, onHomeClick, onSelectTool }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (toolId?: string, action?: () => void) => {
    setMobileOpen(false);
    if (action) {
      action();
    } else if (toolId && onSelectTool) {
      onSelectTool(toolId);
    }
  };

  const scrollToTools = () => {
    onHomeClick();
    setTimeout(() => {
      const el = document.getElementById('tools');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
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
              <Badge variant="outline" className="border-orange-300 text-orange-600 text-[10px] px-1.5 py-0 hidden sm:inline-flex">
                <Sparkles className="w-2.5 h-2.5 mr-1" /> AI Powered
              </Badge>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">Mera Document • All-in-One Solution</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 font-medium text-xs sm:text-sm">
          <button
            onClick={onHomeClick}
            className="px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4 text-orange-500" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
          </button>

          <button
            onClick={() => handleNavClick('ai-studio')}
            className="px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl flex items-center gap-1.5 transition-colors font-semibold"
          >
            <Brain className="w-4 h-4 text-orange-600" />
            <span>{lang === 'hi' ? 'AI स्टूडियो' : 'AI Studio'}</span>
          </button>

          <button
            onClick={() => handleNavClick('pdf-to-word')}
            className="px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>{lang === 'hi' ? 'PDF टूल्स' : 'PDF Tools'}</span>
          </button>

          <button
            onClick={() => handleNavClick('photo-resizer')}
            className="px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>{lang === 'hi' ? 'फोटो रिसाइज़र' : 'Resizer'}</span>
          </button>

          <button
            onClick={() => handleNavClick(undefined, scrollToTools)}
            className="px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Grid className="w-4 h-4 text-teal-600" />
            <span>{lang === 'hi' ? 'सभी टूल' : 'All Tools'}</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="rounded-full border-orange-200 hover:bg-orange-50 hover:text-orange-600 font-medium text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-orange-500" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </Button>

          {/* Quick CTA button */}
          <button 
            onClick={() => handleNavClick('ai-studio')}
            className="hidden md:inline-flex px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow hover:shadow-md transition-all hover:opacity-95"
          >
            {lang === 'hi' ? '🤖 AI सह-पायलट' : '🤖 AI Copilot'}
          </button>

          {/* Mobile Menu Drawer */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-gray-700 hover:text-orange-600">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-6">
              <SheetHeader className="text-left border-b pb-4 mb-4">
                <SheetTitle className="flex items-center space-x-2 text-orange-600 font-bold text-lg">
                  <FileText className="w-5 h-5" />
                  <span>मेरा डॉक्यूमेंट</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col space-y-2 text-sm font-medium">
                <button
                  onClick={() => handleNavClick(undefined, onHomeClick)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-semibold text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-orange-500" />
                    <span>{lang === 'hi' ? 'मुख्य पृष्ठ (Home)' : 'Home'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleNavClick('ai-studio')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-semibold text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-4 h-4 text-orange-600" />
                    <span>{lang === 'hi' ? '🤖 AI डॉक्यूमेंट स्टूडियो' : 'AI Studio'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleNavClick('pdf-to-word')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-semibold text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>{lang === 'hi' ? '📄 PDF कनवर्टर टूल्स' : 'PDF Tools'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleNavClick('photo-resizer')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-semibold text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'hi' ? '🖼️ फोटो व सिग्नेचर रिसाइज़र' : 'Photo Resizer'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleNavClick('resume')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-semibold text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'hi' ? '🤖 AI बायोडाटा / रिज्यूमे' : 'AI Resume Builder'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => handleNavClick(undefined, scrollToTools)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-semibold text-left border-t pt-3 mt-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Grid className="w-4 h-4 text-teal-600" />
                    <span>{lang === 'hi' ? 'सभी टूल की सूची' : 'View All Tools'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};