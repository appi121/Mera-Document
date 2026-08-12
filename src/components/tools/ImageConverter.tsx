import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Download, RefreshCw, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface ImageConverterProps {
  lang: Language;
  onBack: () => void;
}

export const ImageConverter: React.FC<ImageConverterProps> = ({ lang, onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [targetKb, setTargetKb] = useState<number>(50);
  const [outputDataUrl, setOutputDataUrl] = useState<string | null>(null);
  const [outputSizeKb, setOutputSizeKb] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setOutputDataUrl(null);
      setOutputSizeKb(null);
      convertImage(url, targetFormat, targetKb);
    }
  };

  const convertImage = (imgUrl: string, mimeType: string, maxKb: number) => {
    setProcessing(true);
    const img = new Image();
    img.src = imgUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setProcessing(false);
        return;
      }

      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      // Squeeze logic to reach target KB
      let lowQuality = 0.1;
      let highQuality = 1.0;
      let bestDataUrl = canvas.toDataURL(mimeType, 0.85);
      let bestKb = Math.round((bestDataUrl.length * 3) / 4 / 1024);

      if (mimeType === 'image/jpeg' || mimeType === 'image/webp') {
        for (let i = 0; i < 7; i++) {
          const midQuality = (lowQuality + highQuality) / 2;
          const currentUrl = canvas.toDataURL(mimeType, midQuality);
          const currentKb = Math.round((currentUrl.length * 3) / 4 / 1024);

          if (currentKb <= maxKb) {
            bestDataUrl = currentUrl;
            bestKb = currentKb;
            lowQuality = midQuality;
          } else {
            highQuality = midQuality;
          }
        }
      } else {
        bestDataUrl = canvas.toDataURL(mimeType);
        bestKb = Math.round((bestDataUrl.length * 3) / 4 / 1024);
      }

      setOutputDataUrl(bestDataUrl);
      setOutputSizeKb(bestKb);
      setProcessing(false);
      showSuccess(lang === 'hi' ? 'इमेज फॉर्मेट कन्वर्ट हो गई!' : 'Image converted successfully!');
    };
  };

  const handleFormatChange = (val: 'image/jpeg' | 'image/png' | 'image/webp') => {
    setTargetFormat(val);
    if (previewUrl) {
      convertImage(previewUrl, val, targetKb);
    }
  };

  const handleKbChange = (val: number) => {
    setTargetKb(val);
    if (previewUrl) {
      convertImage(previewUrl, targetFormat, val);
    }
  };

  const handleDownload = () => {
    if (!outputDataUrl) {
      showError(lang === 'hi' ? 'कृपया पहले इमेज अपलोड करें!' : 'Please upload image first!');
      return;
    }

    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/png' ? 'png' : 'webp';
    const link = document.createElement('a');
    link.download = `Converted_Image_${outputSizeKb || 0}KB.${ext}`;
    link.href = outputDataUrl;
    link.click();
    showSuccess(lang === 'hi' ? 'कन्वर्टेड फोटो डाउनलोड हुई!' : 'Converted image downloaded!');
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
            🔄 {lang === 'hi' ? 'इमेज फॉर्मेट कनवर्टर व कस्टम KB कंप्रेसर' : 'Image Format Converter & KB Squeezer'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi'
              ? 'WEBP/PNG/GIF फोटो को JPG में बदलें और मनचाहे KB (जैसे 30KB, 45KB) में सेट करें'
              : 'Convert WEBP, PNG, GIF photos to JPG and squeeze to exact target KB size for online forms'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '1. फोटो चुनें (WEBP, PNG, JPG, GIF):' : '1. Upload Photo (WEBP, PNG, JPG):'}
                </Label>
                <div className="border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-xl p-5 text-center relative cursor-pointer hover:bg-orange-50 transition-colors">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-orange-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-800">
                      {imageFile ? imageFile.name : (lang === 'hi' ? 'फोटो अपलोड करें' : 'Choose Photo')}
                    </span>
                    {imageFile && (
                      <span className="text-[11px] text-gray-500 mt-1">
                        {lang === 'hi' ? `मूल साइज: ${Math.round(imageFile.size / 1024)} KB` : `Original: ${Math.round(imageFile.size / 1024)} KB`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '2. किस फॉर्मेट में बदलना है? (Target Format):' : '2. Select Output Format:'}
                </Label>
                <Select value={targetFormat} onValueChange={(val: 'image/jpeg' | 'image/png' | 'image/webp') => handleFormatChange(val)}>
                  <SelectTrigger className="w-full border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">📸 JPG / JPEG (सरकारी फॉर्म हेतु मान्य)</SelectItem>
                    <SelectItem value="image/png">🖼️ PNG (उच्च गुणवत्ता)</SelectItem>
                    <SelectItem value="image/webp">🌐 WEBP (लाइटवेट वेब)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '3. अधिकतम KB साइज (Target Size):' : '3. Max Target KB Size:'}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={targetKb}
                    onChange={(e) => handleKbChange(Number(e.target.value) || 50)}
                    min={5}
                    max={2000}
                    className="border-orange-200"
                  />
                  <span className="text-xs font-bold text-gray-600">KB</span>
                </div>
              </div>

              <Button
                onClick={handleDownload}
                disabled={!outputDataUrl || processing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
              >
                <Download className="w-4 h-4" />
                {lang === 'hi' ? `कन्वर्टेड फोटो (${outputSizeKb || 0} KB) डाउनलोड करें` : `Download Converted Image (~${outputSizeKb || 0} KB)`}
              </Button>
            </div>

            {/* Live Preview */}
            <div className="flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-4 bg-slate-50 min-h-[280px]">
              {outputDataUrl ? (
                <div className="text-center space-y-3 w-full">
                  <div className="p-2 bg-white rounded-xl shadow-md border inline-block max-w-full">
                    <img src={outputDataUrl} alt="Converted Preview" className="max-h-[260px] object-contain mx-auto rounded-md" />
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                      ✓ {lang === 'hi' ? `नया साइज: ${outputSizeKb} KB (${targetFormat === 'image/jpeg' ? 'JPG' : targetFormat === 'image/png' ? 'PNG' : 'WEBP'})` : `Converted: ${outputSizeKb} KB`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 space-y-2">
                  <RefreshCw className="w-12 h-12 mx-auto text-orange-300" />
                  <p className="text-xs">
                    {lang === 'hi' ? 'फोटो अपलोड करते ही कन्वर्टेड प्रीव्यू यहाँ दिखेगा' : 'Upload photo to see converted preview'}
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