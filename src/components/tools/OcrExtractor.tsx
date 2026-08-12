import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Camera, Copy, Check, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface OcrExtractorProps {
  lang: Language;
  onBack: () => void;
}

export const OcrExtractor: React.FC<OcrExtractorProps> = ({ lang, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setExtractedText('');
    } else {
      setPreviewUrl(null);
    }
  };

  const handleExtract = async () => {
    if (!file && !previewUrl) {
      showError(lang === 'hi' ? 'कृपया पहले फोटो अपलोड करें!' : 'Please upload an image first!');
      return;
    }

    setLoading(true);
    setStatusText(lang === 'hi' ? 'AI भाषा मॉडल लोड हो रहा है...' : 'Loading AI Hindi & English language model...');

    try {
      // Create Tesseract AI Worker for Hindi and English OCR
      const worker = await createWorker(['hin', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            setStatusText(lang === 'hi' ? 'AI कोर इंजन लोड हो रहा है...' : 'Loading AI OCR Core...');
          } else if (m.status === 'initializing tesseract') {
            setStatusText(lang === 'hi' ? 'हिंदी व इंग्लिश मॉडल तैयार हो रहा है...' : 'Initializing Hindi & English OCR...');
          } else if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            setStatusText(lang === 'hi' ? `फोटो पढ़ी जा रही है... ${pct}%` : `Scanning text... ${pct}%`);
          }
        },
      });

      setStatusText(lang === 'hi' ? 'अक्षर पढ़े जा रहे हैं...' : 'Recognizing text in photo...');
      
      const targetSource = previewUrl || file;
      const { data } = await worker.recognize(targetSource!);

      await worker.terminate();

      const recognized = data.text.trim();
      if (recognized) {
        setExtractedText(recognized);
        showSuccess(lang === 'hi' ? 'फोटो से असली टेक्स्ट निकाल लिया गया!' : 'Real text extracted from image!');
      } else {
        setExtractedText(
          lang === 'hi' 
            ? 'फोटो में साफ़ टेक्स्ट नहीं मिल सका। कृपया साफ़ और स्पष्ट फोटो अपलोड करें।' 
            : 'No clear text detected in the photo. Please upload a clear photo with visible text.'
        );
        showError(lang === 'hi' ? 'साफ़ टेक्स्ट नहीं मिला!' : 'No clear text found!');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      showError(lang === 'hi' ? 'OCR स्कैनिंग में त्रुटि हुई। कृपया दोबारा प्रयास करें।' : 'Failed to scan image. Please try again.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'टेक्स्ट कॉपी हो गया!' : 'Text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            📷 {lang === 'hi' ? 'असली AI OCR फोटो-टू-टेक्स्ट एक्सट्रेक्टर' : 'Real AI OCR Image to Text Extractor'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'किसी भी हिंदी/इंग्लिश कागज़, रसीद, आधार, फॉर्म या किताब की फोटो से सीधा एडिटेबल टेक्स्ट निकालें' 
              : 'Extract real, editable Hindi & English text directly from any document, photo, or book page'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-2xl p-6 text-center cursor-pointer relative hover:bg-orange-50 transition-colors min-h-[250px] flex flex-col justify-center items-center overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {previewUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-h-[220px] rounded-lg object-contain shadow-md" />
                    {loading && (
                      <div className="absolute inset-0 bg-orange-950/40 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center p-4 text-white">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-400 mb-2" />
                        <span className="font-bold text-xs text-center">{statusText}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">
                      {lang === 'hi' ? 'फोटो अपलोड करें' : 'Upload Document Photo'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lang === 'hi' ? 'आधार, कागज़, किताब या रसीद की फोटो चुनें' : 'Upload photo of paper, book page, or form'}
                    </p>
                  </>
                )}
              </div>

              <Button
                onClick={handleExtract}
                disabled={!file || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading 
                  ? (lang === 'hi' ? 'स्कैनिंग जारी है...' : 'Scanning Image...') 
                  : (lang === 'hi' ? 'असली टेक्स्ट निकालें (Run AI OCR)' : 'Extract Text with AI OCR')}
              </Button>
            </div>

            {/* Result Area */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'hi' ? 'निकाला गया टेक्स्ट (Editable Text):' : 'Extracted Text:'}
                </span>
                {extractedText && (
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs border-orange-200 text-orange-700 hover:bg-orange-50 bg-white">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </Button>
                )}
              </div>

              <Textarea 
                rows={11} 
                value={extractedText} 
                onChange={(e) => setExtractedText(e.target.value)} 
                placeholder={lang === 'hi' ? 'फोटो अपलोड करके "असली टेक्स्ट निकालें" बटन दबाएं...' : 'Upload a photo and click "Extract Text with AI OCR"...'}
                className="font-sans text-xs sm:text-sm bg-gray-50 border-gray-200 focus-visible:ring-orange-500 h-[250px] p-3.5 leading-relaxed" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};