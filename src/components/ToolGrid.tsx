import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { AdBanner } from '@/components/AdBanner';
import { ToolCard } from '@/components/ToolCard';
import { toolsData } from '@/data/toolsData';

interface ToolGridProps {
  lang: Language;
  searchQuery: string;
  onSelectTool: (toolId: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ lang, searchQuery, onSelectTool }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredTools = toolsData.filter(t => {
    if (!cleanQuery) {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'convert-from-pdf') return t.category === 'convert-from-pdf' || t.id === 'pdf-to-word' || t.id === 'pdf-to-excel' || t.id === 'pdf-to-jpg';
      if (activeCategory === 'convert-to-pdf') return t.category === 'convert-to-pdf' || t.id === 'word-to-pdf' || t.id === 'excel-to-pdf' || t.id === 'ppt-to-pdf' || t.id === 'img-to-pdf';
      if (activeCategory === 'organize') return t.category === 'organize' || t.category === 'security' || t.id === 'merge-pdf' || t.id === 'split-pdf' || t.id === 'compress-pdf' || t.id === 'rotate-pdf' || t.id === 'page-numbers' || t.id === 'pdf-watermark';
      if (activeCategory === 'bharat-tools') return t.id === 'photo-resizer' || t.id === 'passport-sheet' || t.id === 'id-joiner' || t.id === 'resume' || t.id === 'translate' || t.id === 'age-calculator' || t.id === 'gst-calculator' || t.id === 'affidavit' || t.id === 'letter' || t.id === 'govt' || t.id === 'signature' || t.id === 'templates';
      if (activeCategory === 'ai') return t.category === 'ai' || t.id === 'ai-studio' || t.id === 'ocr' || t.id === 'excel';
      return true;
    }

    return (
      t.titleHi.toLowerCase().includes(cleanQuery) ||
      t.titleEn.toLowerCase().includes(cleanQuery) ||
      t.descHi.toLowerCase().includes(cleanQuery) ||
      t.descEn.toLowerCase().includes(cleanQuery) ||
      t.id.toLowerCase().includes(cleanQuery) ||
      (t.badgeHi && t.badgeHi.toLowerCase().includes(cleanQuery)) ||
      (t.badgeEn && t.badgeEn.toLowerCase().includes(cleanQuery)) ||
      (t.keywords && t.keywords.toLowerCase().includes(cleanQuery))
    );
  });

  return (
    <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {lang === 'hi' ? 'सभी टूल्स एवं पीडीएफ सुइट' : 'All PDF Tools & Suite'}
            </h2>
            {cleanQuery && (
              <Badge className="bg-orange-600 text-white font-bold text-[10px] px-1.5 py-0">
                {filteredTools.length} {lang === 'hi' ? 'मिले' : 'found'}
              </Badge>
            )}
          </div>
        </div>

        {/* Category Tabs - Systematic Menu Bar like iLovePDF */}
        {!cleanQuery && (
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeCategory === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'सभी (All)' : 'All'}
            </button>
            <button
              onClick={() => setActiveCategory('convert-from-pdf')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeCategory === 'convert-from-pdf' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'PDF से बदलें' : 'Convert from PDF'}
            </button>
            <button
              onClick={() => setActiveCategory('convert-to-pdf')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeCategory === 'convert-to-pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'PDF में बदलें' : 'Convert to PDF'}
            </button>
            <button
              onClick={() => setActiveCategory('organize')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeCategory === 'organize' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'Merge & Split' : 'Organize PDF'}
            </button>
            <button
              onClick={() => setActiveCategory('bharat-tools')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeCategory === 'bharat-tools' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? '🇮🇳 फॉर्म व फोटो' : 'Govt & Photo'}
            </button>
          </div>
        )}
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
          <p className="text-slate-700 font-bold text-sm">
            {lang === 'hi' ? `"${searchQuery}" का कोई टूल नहीं मिला` : `No tools found for "${searchQuery}"`}
          </p>
          <p className="text-[11px] text-slate-500">
            {lang === 'hi' ? 'कृपया अलग शब्द खोजें जैसे PDF, Merge, Split, Word, Excel, फोटो या AI' : 'Try searching for PDF, Merge, Split, Word, Excel, Photo or AI'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                lang={lang}
                onSelectTool={onSelectTool}
              />
            ))}
          </div>

          <AdBanner className="mt-8" />
        </>
      )}
    </section>
  );
};