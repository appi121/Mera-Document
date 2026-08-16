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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm h-14 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={onHomeClick}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base text-slate-900 tracking-tight">
                Mera Document
              </span>
              <Badge variant="outline" className="border-orange-200 text-orange-600 text-[9px] px-1 py-0 hidden sm:inline-flex font-bold">
                AI
              </Badge>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 font-semibold text-xs text-slate-600">
          <button
            onClick={onHomeClick}
            className="px-3 py-1.5 hover:text-orange-600 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
          </button>

          <button
            onClick={() => handleNavClick('ai-studio')}
            className="px-3 py-1.5 hover:text-orange-600 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-orange-500" />
            <span>{lang === 'hi' ? 'AI स्टूडियो' : 'AI Studio'}</span>
          </button>

          <button
            onClick={() => handleNavClick('pdf-to-word')}
            className="px-3 py-1.5 hover:text-orange-600 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'hi' ? 'PDF टूल्स' : 'PDF Tools'}</span>
          </button>

          <button
            onClick={() => handleNavClick('photo-resizer')}
            className="px-3 py-1.5 hover:text-orange-600 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'hi' ? 'फोटो रिसाइज़र' : 'Resizer'}</span>
          </button>

          <button
            onClick={() => handleNavClick(undefined, scrollToTools)}
            className="px-3 py-1.5 hover:text-orange-600 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Grid className="w-3.5 h-3.5 text-teal-500" />
            <span>{lang === 'hi' ? 'सभी टूल' : 'All Tools'}</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="h-8 rounded-lg border-slate-200 hover:bg-slate-50 hover:text-orange-600 font-bold text-xs flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </Button>

          {/* Quick CTA button */}
          <button 
            onClick={() => handleNavClick('ai-studio')}
            className="hidden md:inline-flex h-8 items-center px-3 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all"
          >
            {lang === 'hi' ? 'AI सह-पायलट' : 'AI Copilot'}
          </button>

          {/* Mobile Menu Drawer */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-slate-700 hover:text-orange-600">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] p-4">
              <SheetHeader className="text-left border-b pb-3 mb-3">
                <SheetTitle className="flex items-center space-x-2 text-orange-600 font-bold text-base">
                  <FileText className="w-4 h-4" />
                  <span>Mera Document</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col space-y-1 text-xs font-semibold">
                <button
                  onClick={() => handleNavClick(undefined, onHomeClick)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-800 hover:text-orange-600 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-slate-500" />
                    <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleNavClick('ai-studio')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-800 hover:text-orange-600 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-orange-500" />
                    <span>{lang === 'hi' ? 'AI डॉक्यूमेंट स्टूडियो' : 'AI Studio'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleNavClick('pdf-to-word')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-800 hover:text-orange-600 text-left"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>{lang === 'hi' ? 'PDF कनवर्टर टूल्स' : 'PDF Tools'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleNavClick('photo-resizer')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-800 hover:text-orange-600 text-left"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>{lang === 'hi' ? 'फोटो व सिग्नेचर रिसाइज़र' : 'Photo Resizer'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => handleNavClick('resume')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-800 hover:text-orange-600 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'hi' ? 'AI बायोडाटा / रिज्यूमे' : 'AI Resume Builder'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};