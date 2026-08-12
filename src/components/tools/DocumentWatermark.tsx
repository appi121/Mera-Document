import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Download, ShieldCheck, Image as ImageIcon, Sparkles } from 'lucide-react';

interface DocumentWatermarkProps {
  lang: Language;
  onBack: () => void;
}

export const DocumentWatermark: React.FC<DocumentWatermarkProps> = ({ lang, onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [watermarkPreset, setWatermarkPreset] = useState('ONLY FOR BANK KYC');
  const [customText, setCustomText] = useState('ONLY FOR SBI BANK KYC - DATE 2025');
  const [watermarkedDataUrl, setWatermarkedDataUrl] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setWatermarkedDataUrl(null);
      applyWatermark(url, watermarkPreset === 'CUSTOM' ? customText : watermarkPreset);
    }
  };

  const applyWatermark = (imgUrl: string, text: string) => {
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Setup watermark style
      const fontSize = Math.max(24, Math.floor(canvas.width / 18));
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.45)'; // Semi-transparent red
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Save context state for rotation
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6); // 30 degree tilt

      // Draw repeat watermarks
      const textToDraw = text.toUpperCase();
      ctx.fillText(textToDraw, 0, 0);
      ctx.fillText(textToDraw, 0, -fontSize * 3);
      ctx.fillText(textToDraw, 0, fontSize * 3);

      ctx.restore();

      const result = canvas.toDataURL('image/jpeg', 0.92);
      setWatermarkedDataUrl(result);
      showSuccess(lang === 'hi' ? 'सुरक्षा वाटरमार्क लगा दिया गया है!' : 'Security watermark applied!');
    };
  };

  const handlePresetChange = (val: string) => {
    setWatermarkPreset(val);
    const textToUse = val === 'CUSTOM' ? customText : val;
    if (previewUrl) {
      applyWatermark(previewUrl, textToUse);
    }
  };

  const handleCustomTextChange = (txt: string) => {
    setCustomText(txt);
    if (previewUrl && watermarkPreset === 'CUSTOM') {
      applyWatermark(previewUrl, txt);
    }
  };

  const handleDownload = () => {
    if (!watermarkedDataUrl) {
      showError(lang === 'hi' ? 'कृपया पहले दस्तावेज़ अपलोड करें!' : 'Please upload document first!');
      return;
    }
    const link = document.createElement('a');
    link.download = `Protected_Watermarked_Document.jpg`;
    link.href = watermarkedDataUrl;
    link.click();
    showSuccess(lang === 'hi' ? 'सुरक्षित दस्तावेज़ डाउनलोड हुआ!' : 'Protected document downloaded!');
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
            🛡️ {lang === 'hi' ? 'आधार व डॉक्यूमेंट सुरक्षा वाटरमार्क टूल' : 'Document Fraud Protection Watermark'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi'
              ? 'आधार, पैन व मार्कशीट पर "ONLY FOR BANK KYC" या "FOR ADMISSION ONLY" लिखकर फ्रॉड से बचें'
              : 'Add safe watermarks to Aadhaar, PAN & ID cards before sharing with anyone online'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '1. आधार/पैन/डॉक्यूमेंट फोटो अपलोड करें:' : '1. Upload Document Image:'}
                </Label>
                <div className="border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-xl p-5 text-center relative cursor-pointer hover:bg-orange-50 transition-colors">
                  <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-orange-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-800">
                      {imageFile ? imageFile.name : (lang === 'hi' ? 'फोटो / आईडी कार्ड चुनें' : 'Upload ID Card Photo')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '2. सुरक्षा टेक्स्ट चुनें (Watermark Text):' : '2. Select Watermark Stamp:'}
                </Label>
                <Select value={watermarkPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-full border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLY FOR BANK KYC">ONLY FOR BANK KYC</SelectItem>
                    <SelectItem value="ONLY FOR ADMISSION">ONLY FOR ADMISSION</SelectItem>
                    <SelectItem value="FOR SIM CARD VERIFICATION ONLY">FOR SIM VERIFICATION ONLY</SelectItem>
                    <SelectItem value="FOR LOAN APPLICATION ONLY">FOR LOAN APPLICATION ONLY</SelectItem>
                    <SelectItem value="CUSTOM">{lang === 'hi' ? '✏️ अपना कस्टम टेक्स्ट लिखें' : '✏️ Write Custom Text'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watermarkPreset === 'CUSTOM' && (
                <div>
                  <Label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'कस्टम वाटरमार्क लिखें:' : 'Custom Watermark Text:'}
                  </Label>
                  <Input
                    value={customText}
                    onChange={(e) => handleCustomTextChange(e.target.value)}
                    placeholder="ONLY FOR ABC COLLEGE ADMISSION 2025"
                    className="border-orange-200"
                  />
                </div>
              )}

              <Button
                onClick={handleDownload}
                disabled={!watermarkedDataUrl}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl gap-2"
              >
                <Download className="w-4 h-4" />
                {lang === 'hi' ? 'सुरक्षित (Watermarked) फोटो डाउनलोड करें' : 'Download Protected Image'}
              </Button>
            </div>

            {/* Live Preview */}
            <div className="flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-4 bg-slate-50 min-h-[280px]">
              {watermarkedDataUrl ? (
                <div className="text-center space-y-3 w-full">
                  <div className="p-2 bg-white rounded-xl shadow-md border inline-block max-w-full">
                    <img src={watermarkedDataUrl} alt="Watermark Preview" className="max-h-[300px] object-contain mx-auto rounded-md" />
                  </div>
                  <p className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full inline-block">
                    ✓ {lang === 'hi' ? 'वाटरमार्क लग चुका है (100% सुरक्षित)' : '100% Protected against Fraud'}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400 space-y-2">
                  <ShieldCheck className="w-12 h-12 mx-auto text-orange-300" />
                  <p className="text-xs">
                    {lang === 'hi' ? 'फोटो अपलोड करते ही सुरक्षा वाटरमार्क के साथ प्रीव्यू यहाँ दिखेगा' : 'Upload image to see protected preview'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};