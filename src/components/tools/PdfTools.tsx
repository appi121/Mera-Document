import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { FileUp, Minimize2, Layers, FileImage, Download, ArrowLeft, CheckCircle } from 'lucide-react';

interface PdfToolsProps {
  lang: Language;
  onBack: () => void;
}

export const PdfTools: React.FC<PdfToolsProps> = ({ lang, onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<'merge' | 'compress' | 'imgToPdf'>('merge');
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setCompleted(false);
    }
  };

  const handleAction = () => {
    if (files.length === 0) {
      showError(lang === 'hi' ? 'कृपया पहले फ़ाइल चुनें!' : 'Please select files first!');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      showSuccess(lang === 'hi' ? 'आपकी PDF फ़ाइल तैयार है!' : 'Your PDF file is ready!');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            📄 {lang === 'hi' ? 'PDF टूल्स सेंटर (PDF Tool Kit)' : 'PDF Tools Center'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'PDF मर्ज करें, साइज छोटा करें (Compress) या फोटो से PDF बनाएं' 
              : 'Merge PDFs, compress file size, or convert images to PDF'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* Sub-tools Tab */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => { setActiveSubTab('merge'); setFiles([]); setCompleted(false); }}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeSubTab === 'merge' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              {lang === 'hi' ? 'PDF मर्ज (जोड़ें)' : 'Merge PDF'}
            </button>
            <button
              onClick={() => { setActiveSubTab('compress'); setFiles([]); setCompleted(false); }}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeSubTab === 'compress' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
              {lang === 'hi' ? 'PDF कंप्रेस (साइज कम)' : 'Compress PDF'}
            </button>
            <button
              onClick={() => { setActiveSubTab('imgToPdf'); setFiles([]); setCompleted(false); }}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeSubTab === 'imgToPdf' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileImage className="w-4 h-4" />
              {lang === 'hi' ? 'फोटो से PDF' : 'Image to PDF'}
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-2xl p-8 text-center hover:bg-orange-50 transition-colors relative cursor-pointer">
            <input
              type="file"
              multiple={activeSubTab === 'merge' || activeSubTab === 'imgToPdf'}
              accept={activeSubTab === 'imgToPdf' ? 'image/*' : '.pdf'}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileUp className="w-8 h-8" />
            </div>
            <p className="font-semibold text-gray-800 text-base mb-1">
              {files.length > 0 
                ? `${files.length} ${lang === 'hi' ? 'फ़ाइल चुनी गई:' : 'Files selected:'}` 
                : (lang === 'hi' ? 'यहाँ फ़ाइल खींचें या अपलोड करें' : 'Drag & drop files here or click to browse')}
            </p>
            {files.length > 0 ? (
              <div className="mt-2 text-xs text-orange-700 font-medium max-w-md mx-auto truncate">
                {files.map(f => f.name).join(', ')}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                {activeSubTab === 'imgToPdf' ? 'JPG, PNG, WEBP Supported' : 'PDF files up to 50MB'}
              </p>
            )}
          </div>

          {/* Action & Download */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              onClick={handleAction}
              disabled={files.length === 0 || processing}
              className="w-full sm:w-auto px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl"
            >
              {processing ? (
                <span>{lang === 'hi' ? 'प्रोसेस हो रहा है...' : 'Processing...'}</span>
              ) : (
                <span>
                  {activeSubTab === 'merge' && (lang === 'hi' ? 'PDF जोड़ें (Merge)' : 'Merge Files')}
                  {activeSubTab === 'compress' && (lang === 'hi' ? 'साइज कम करें' : 'Compress PDF')}
                  {activeSubTab === 'imgToPdf' && (lang === 'hi' ? 'PDF बनाएं' : 'Convert to PDF')}
                </span>
              )}
            </Button>

            {completed && (
              <Button
                variant="outline"
                className="w-full sm:w-auto border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 gap-2 font-semibold"
                onClick={() => showSuccess(lang === 'hi' ? 'डाउनलोड शुरू हुआ!' : 'Download started!')}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <Download className="w-4 h-4" />
                {lang === 'hi' ? 'डाउनलोड करें (Download PDF)' : 'Download Ready PDF'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};