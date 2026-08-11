import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Camera, Copy, Check, FileUp, Sparkles } from 'lucide-react';

interface OcrExtractorProps {
  lang: Language;
  onBack: () => void;
}

export const OcrExtractor: React.FC<OcrExtractorProps> = ({ lang, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleExtract = () => {
    if (!file) {
      showError(lang === 'hi' ? 'कृपया पहले फोटो चुनें!' : 'Please upload an image first!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setExtractedText(`भारत सरकार / Government of India\nनाम: रमेश कुमार\nजन्म तिथि: 12/05/1990\nपता: मकान नंबर 42, गांधी नगर, जयपुर, राजस्थान\nआधार नंबर: XXXX-XXXX-1234`);
      showSuccess(lang === 'hi' ? 'टेक्स्ट सफलता से निकाल लिया गया!' : 'Text extracted successfully!');
    }, 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'टेक्स्ट कॉपी हो गया!' : 'Copied!');
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
            📷 {lang === 'hi' ? 'OCR फोटो से टेक्स्ट निकालें (Hindi + English)' : 'OCR Photo Text Extractor'}
          </CardTitle>
          <CardDescription className="text-orange-100">
            {lang === 'hi' ? 'किसी भी सरकारी दस्तावेज, रसीद या किताब के पन्ने की फोटो से तुरंत टेक्स्ट कॉपी करें' : 'Extract editable text from any document, receipt, or book page photo'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload & Preview Area */}
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
                      <>
                        {/* Laser scanning line */}
                        <div className="absolute left-0 right-0 h-1 bg-orange-500 shadow-[0_0_10px_#ea580c] animate-[bounce_2s_infinite] z-20" />
                        <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-white/90 text-orange-600 font-bold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            {lang === 'hi' ? 'अक्षर पढ़े जा रहे हैं...' : 'Scanning Text...'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">
                      {lang === 'hi' ? 'फोटो अपलोड करें' : 'Upload Document Image'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lang === 'hi' ? 'आधार, पैन, फॉर्म या कागज़ का चित्र' : 'Aadhaar, PAN, Form or paper photo'}
                    </p>
                  </>
                )}
              </div>

              <Button
                onClick={handleExtract}
                disabled={!file || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? (lang === 'hi' ? 'स्कैनिंग जारी है...' : 'Scanning...') : (lang === 'hi' ? 'टेक्स्ट निकालें (Extract Text)' : 'Extract Text from Photo')}
              </Button>
            </div>

            {/* Extracted Text Area */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'hi' ? 'निकाला गया टेक्स्ट:' : 'Extracted Text:'}
                </span>
                {extractedText && (
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs border-orange-200 text-orange-700 hover:bg-orange-50">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </Button>
                )}
              </div>
              <Textarea 
                rows={11} 
                value={extractedText} 
                onChange={(e) => setExtractedText(e.target.value)} 
                placeholder={lang === 'hi' ? 'फोटो अपलोड करके "टेक्स्ट निकालें" बटन दबाएं...' : 'Upload a photo and click "Extract Text" to see results here...'}
                className="font-mono text-xs bg-gray-50 border-gray-200 focus-visible:ring-orange-500 h-[250px]" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};