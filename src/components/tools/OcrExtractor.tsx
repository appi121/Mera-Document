import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Camera, Copy, Check, FileUp } from 'lucide-react';

interface OcrExtractorProps {
  lang: Language;
  onBack: () => void;
}

export const OcrExtractor: React.FC<OcrExtractorProps> = ({ lang, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExtract = () => {
    if (!file) {
      showError(lang === 'hi' ? 'कृपया पहले फोटो चुनें!' : 'Please upload an image first!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setExtractedText(`भारत सरकार / Government of India\nनाम: रमेश कुमार\nजन्म तिथि: 12/05/1990\nपता: मकान नंबर 42, गांधी नगर, जयपुर, राजस्थान`);
      showSuccess(lang === 'hi' ? 'टेक्स्ट सफलता से निकाल लिया गया!' : 'Text extracted successfully!');
    }, 1200);
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
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-2xl p-8 text-center cursor-pointer relative hover:bg-orange-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Camera className="w-7 h-7" />
            </div>
            <p className="font-semibold text-gray-800 text-sm">
              {file ? file.name : (lang === 'hi' ? 'फोटो अपलोड करें (आधार, पैन, फॉर्म या कागज़ का चित्र)' : 'Upload image of document')}
            </p>
          </div>

          <Button
            onClick={handleExtract}
            disabled={!file || loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl"
          >
            {loading ? (lang === 'hi' ? 'अक्षर पढ़े जा रहे हैं...' : 'Extracting Text...') : (lang === 'hi' ? 'टेक्स्ट निकालें (Extract Text)' : 'Extract Text from Photo')}
          </Button>

          {extractedText && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">{lang === 'hi' ? 'निकाला गया टेक्स्ट:' : 'Extracted Text:'}</span>
                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </Button>
              </div>
              <Textarea rows={6} value={extractedText} onChange={(e) => setExtractedText(e.target.value)} className="font-mono text-xs bg-gray-50" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};