import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { ToolGrid } from '@/components/ToolGrid';
import { AdBanner } from '@/components/AdBanner';
import { PdfTools, PdfToolMode } from '@/components/tools/PdfTools';
import { ResumeBuilder } from '@/components/tools/ResumeBuilder';
import { Translator } from '@/components/tools/Translator';
import { LetterWriter } from '@/components/tools/LetterWriter';
import { GovtFormAssistant } from '@/components/tools/GovtFormAssistant';
import { OcrExtractor } from '@/components/tools/OcrExtractor';
import { SignatureCreator } from '@/components/tools/SignatureCreator';
import { DocTemplates } from '@/components/tools/DocTemplates';
import { ExcelAssistant } from '@/components/tools/ExcelAssistant';
import { PhotoResizer } from '@/components/tools/PhotoResizer';
import { IdCardJoiner } from '@/components/tools/IdCardJoiner';
import { PassportPhotoSheet } from '@/components/tools/PassportPhotoSheet';
import { AffidavitGenerator } from '@/components/tools/AffidavitGenerator';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Index = () => {
  const [lang, setLang] = useState<Language>('hi');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleBackToHome = () => {
    setActiveTool(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPdfToolMode = (toolId: string): PdfToolMode => {
    switch (toolId) {
      case 'pdf-to-word': return 'pdf-to-word';
      case 'word-to-pdf': return 'word-to-pdf';
      case 'excel-to-pdf': return 'excel-to-pdf';
      case 'ppt-to-pdf': return 'ppt-to-pdf';
      case 'img-to-pdf': return 'img-to-pdf';
      case 'merge-pdf': return 'merge';
      case 'split-pdf': return 'split';
      case 'compress-pdf': return 'compress';
      default: return 'pdf-to-word';
    }
  };

  const isPdfTool = (toolId: string | null) => {
    if (!toolId) return false;
    return [
      'pdf-to-word',
      'word-to-pdf',
      'excel-to-pdf',
      'ppt-to-pdf',
      'img-to-pdf',
      'merge-pdf',
      'split-pdf',
      'compress-pdf',
      'pdf'
    ].includes(toolId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <div>
        <Header 
          lang={lang} 
          setLang={setLang} 
          onHomeClick={handleBackToHome} 
        />

        {!activeTool ? (
          <>
            <HeroBanner 
              lang={lang} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />
            
            {/* Monetization Slot below Hero */}
            <AdBanner />

            <ToolGrid 
              lang={lang} 
              searchQuery={searchQuery} 
              onSelectTool={(toolId) => setActiveTool(toolId)} 
            />
          </>
        ) : (
          <div className="py-6">
            <AdBanner />

            {isPdfTool(activeTool) && (
              <PdfTools 
                lang={lang} 
                initialMode={getPdfToolMode(activeTool!)} 
                onBack={handleBackToHome} 
              />
            )}
            {activeTool === 'photo-resizer' && <PhotoResizer lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'passport-sheet' && <PassportPhotoSheet lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'id-joiner' && <IdCardJoiner lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'affidavit' && <AffidavitGenerator lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'ocr' && <OcrExtractor lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'resume' && <ResumeBuilder lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'translate' && <Translator lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'letter' && <LetterWriter lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'govt' && <GovtFormAssistant lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'signature' && <SignatureCreator lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'templates' && <DocTemplates lang={lang} onBack={handleBackToHome} />}
            {activeTool === 'excel' && <ExcelAssistant lang={lang} onBack={handleBackToHome} />}
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-gray-700 text-sm mb-1">
            {lang === 'hi' ? 'मेरा डॉक्यूमेंट (Mera Document) • भारत का अपना AI प्लेटफार्म' : 'Mera Document • India’s AI Document Platform'}
          </p>
          <p className="mb-4">
            {lang === 'hi' ? 'सभी टूल 100% सुरक्षित और मुफ्त हैं' : 'All tools are 100% free and private'}
          </p>
          <MadeWithDyad />
        </div>
      </footer>
    </div>
  );
};

export default Index;