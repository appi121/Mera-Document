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
    <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {lang === 'hi' ? 'सभी टूल एक ही जगह' : 'All Tools in One Place'}
            </h2>
            {cleanQuery && (
              <Badge className="bg-orange-600 text-white font-bold text-xs px-2.5 py-0.5">
                {filteredTools.length} {lang === 'hi' ? 'टूल मिले' : 'found'}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {cleanQuery 
              ? (lang === 'hi' ? `"${searchQuery}" से संबंधित टूल नीचे दिए गए हैं:` : `Showing results for "${searchQuery}":`)
              : (lang === 'hi' ? 'अपनी आवश्यकतानुसार श्रेणी या टूल पर क्लिक करें:' : 'Select a category or click on any tool:')}
          </p>
        </div>

        {/* Category Tabs */}
        {!cleanQuery && (
          <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'all' ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'hi' ? 'सभी (All)' : 'All Tools'}
            </button>
            <button
              onClick={() => setActiveCategory('ai')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'ai' ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'hi' ? '🤖 AI सह-पायलट' : 'AI Copilot'}
            </button>
            <button
              onClick={() => setActiveCategory('pdf')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'pdf' ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'hi' ? '📄 PDF टूल' : 'PDF Tools'}
            </button>
            <button
              onClick={() => setActiveCategory('govt')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'govt' ? 'bg-orange-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'hi' ? '🖼️ फॉर्म, फोटो व ID' : 'Forms & Photos'}
            </button>
          </div>
        )}
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-12 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200 space-y-3">
          <p className="text-gray-700 font-bold text-base">
            {lang === 'hi' ? `"${searchQuery}" का कोई टूल नहीं मिला` : `No tools found for "${searchQuery}"`}
          </p>
          <p className="text-xs text-gray-500">
            {lang === 'hi' ? 'कृपया अलग शब्द खोजें जैसे PDF, Word, Excel, फोटो, फॉर्म या AI' : 'Try searching for terms like PDF, Word, Excel, Photo, Form or AI'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                lang={lang}
                onSelectTool={onSelectTool}
              />
            ))}
          </div>

          <AdBanner className="mt-10" />
        </>
      )}
    </section>
  );
};