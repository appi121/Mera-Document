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
      if (activeCategory === 'pdf') return t.category === 'pdf' || t.id.includes('pdf');
      if (activeCategory === 'govt') return (t.id === 'photo-resizer' || t.id === 'image-converter' || t.id === 'age-calculator' || t.id === 'watermark' || t.id === 'passport-sheet' || t.id === 'id-joiner' || t.id === 'govt' || t.id === 'affidavit');
      if (activeCategory === 'ai') return (t.category === 'ai' || t.category === 'utilities' || t.id === 'ai-studio' || t.id === 'excel' || t.id === 'typing-counter' || t.id === 'gst-calculator');
      return true;
    }

    // Deep Search Matching across title, description, badges, id and keywords
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
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {lang === 'hi' ? 'सभी टूल्स' : 'All Tools'}
            </h2>
            {cleanQuery && (
              <Badge className="bg-orange-600 text-white font-bold text-[10px] px-1.5 py-0">
                {filteredTools.length} {lang === 'hi' ? 'मिले' : 'found'}
              </Badge>
            )}
          </div>
        </div>

        {/* Category Tabs - Systematic Menu Bar */}
        {!cleanQuery && (
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeCategory === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'सभी (All)' : 'All'}
            </button>
            <button
              onClick={() => setActiveCategory('ai')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeCategory === 'ai' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? '🤖 AI टूल्स' : 'AI Tools'}
            </button>
            <button
              onClick={() => setActiveCategory('pdf')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeCategory === 'pdf' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? '📄 PDF टूल्स' : 'PDF Tools'}
            </button>
            <button
              onClick={() => setActiveCategory('govt')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeCategory === 'govt' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? '🖼️ फॉर्म व फोटो' : 'Forms & Photos'}
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
            {lang === 'hi' ? 'कृपया अलग शब्द खोजें जैसे PDF, Word, Excel, फोटो, फॉर्म या AI' : 'Try searching for terms like PDF, Word, Excel, Photo, Form or AI'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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