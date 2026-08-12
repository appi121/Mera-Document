import React, { useState, useRef } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Download, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface PhotoResizerProps {
  lang: Language;
  onBack: () => void;
}

export const PhotoResizer: React.FC<PhotoResizerProps> = ({ lang, onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<string>('photo-50kb');
  const [quality, setQuality] = useState<number>(75);
  const [targetWidth, setTargetWidth] = useState<number>(200);
  const [targetHeight, setTargetHeight] = useState<number>(230);
  const [outputSizeKb, setOutputSizeKb] = useState<number | null>(null);
  const [resizedDataUrl, setResizedDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResizedDataUrl(null);
      setOutputSizeKb(null);
      processImage(url, preset, quality);
    }
  };

  const processImage = (imgUrl: string, presetType: string, qualVal: number) => {
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      let w = 200;
      let h = 230;

      if (presetType === 'photo-50kb') {
        w = 200; h = 230;
      } else if (presetType === 'sig-20kb') {
        w = 140; h = 60;
      } else if (presetType === 'passport-std') {
        w = 350; h = 450;
      } else {
        w = targetWidth; h = targetHeight;
      }

      setTargetWidth(w);
      setTargetHeight(h);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', qualVal / 100);
        setResizedDataUrl(dataUrl);

        // Estimate KB size
        const head = 'data:image/jpeg;base64,';
        const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
        setOutputSizeKb(Math.round(sizeInBytes / 1024));
      }
    };
  };

  const handlePresetChange = (val: string) => {
    setPreset(val);
    if (previewUrl) {
      processImage(previewUrl, val, quality);
    }
  };

  const handleQualityChange = (val: number[]) => {
    const q = val[0];
    setQuality(q);
    if (previewUrl) {
      processImage(previewUrl, preset, q);
    }
  };

  const handleDownload = () => {
    if (!resizedDataUrl) {
      showError(lang === 'hi' ? 'कृपया पहले फोटो चुनें!' : 'Please upload an image first!');
      return;
    }

    const link = document.createElement('a');
    link.download = `govt_form_resized_${preset}_${outputSizeKb || 30}KB.jpg`;
    link.href = resizedDataUrl;
    link.click();
    showSuccess(lang === 'hi' ? 'रिसाइज की गई फोटो डाउनलोड हुई!' : 'Resized photo downloaded!');
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
            🖼️ {lang === 'hi' ? 'सरकारी फॉर्म फोटो व सिग्नेचर रिसाइज़र' : 'Govt Form Photo & Signature Resizer'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi'
              ? 'SSC, रेलवे, बैंक, पुलिस और ई-मित्र फॉर्म हेतु फोटो/हस्ताक्षर को 20KB या 50KB के अंदर सेट करें'
              : 'Resize & compress photos and signatures for SSC, Police, Railway, Banking & Govt forms under 20KB / 50KB'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '1. फोटो या दस्तखत अपलोड करें:' : '1. Upload Photo or Signature:'}
                </Label>
                <div className="border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-xl p-4 text-center relative cursor-pointer hover:bg-orange-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-orange-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-800">
                      {imageFile ? imageFile.name : (lang === 'hi' ? 'फोटो / सिग्नेचर चुनें' : 'Select Photo / Signature')}
                    </span>
                    {imageFile && (
                      <span className="text-[11px] text-gray-500 mt-1">
                        {lang === 'hi' ? `मूल साइज: ${Math.round(imageFile.size / 1024)} KB` : `Original Size: ${Math.round(imageFile.size / 1024)} KB`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '2. फॉर्म की आवश्यकता चुनें (Preset):' : '2. Select Form Requirement:'}
                </Label>
                <Select value={preset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-full border-orange-200">
                    <SelectValue placeholder="चुने" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo-50kb">
                      {lang === 'hi' ? '📸 पासपोर्ट फोटो (Under 50 KB / 200x230 px)' : '📸 Passport Photo (Under 50 KB)'}
                    </SelectItem>
                    <SelectItem value="sig-20kb">
                      {lang === 'hi' ? '✍️ दस्तखत / Signature (Under 20 KB / 140x60 px)' : '✍️ Signature (Under 20 KB)'}
                    </SelectItem>
                    <SelectItem value="passport-std">
                      {lang === 'hi' ? '🎴 स्टैंडर्ड पासपोर्ट फोटो (3.5cm x 4.5cm)' : '🎴 Standard Passport (3.5x4.5 cm)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compression Slider */}
              <div className="bg-orange-50 p-3.5 rounded-xl border border-orange-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>{lang === 'hi' ? 'फाइल क्वालिटी (कम करने पर KB घटेगा):' : 'Quality Compression:'}</span>
                  <span className="text-orange-700">{quality}%</span>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={handleQualityChange}
                  min={20}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-orange-600"
                />
              </div>

              <Button
                onClick={handleDownload}
                disabled={!resizedDataUrl}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
              >
                <Download className="w-4 h-4" />
                {lang === 'hi' ? `रिसाइज्ड फोटो (लगभग ${outputSizeKb || 0} KB) डाउनलोड करें` : `Download Resized Image (~${outputSizeKb || 0} KB)`}
              </Button>
            </div>

            {/* Live Preview */}
            <div className="flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-6 bg-slate-50 min-h-[280px]">
              {resizedDataUrl ? (
                <div className="text-center space-y-3">
                  <div className="p-2 bg-white rounded-xl shadow-md border inline-block">
                    <img
                      src={resizedDataUrl}
                      alt="Resized Preview"
                      style={{ width: `${targetWidth}px`, height: `${targetHeight}px` }}
                      className="object-contain mx-auto"
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                      ✓ {lang === 'hi' ? `नया साइज: ${outputSizeKb} KB` : `New Size: ${outputSizeKb} KB`}
                    </span>
                    <p className="text-gray-500 text-[11px]">
                      {lang === 'hi' ? `पिक्सेल डायमेंशन: ${targetWidth} x ${targetHeight} px` : `Dimensions: ${targetWidth} x ${targetHeight} px`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-xs">
                    {lang === 'hi' ? 'फोटो अपलोड करने पर लाइव प्रीव्यू यहाँ दिखेगा' : 'Live preview will appear here after upload'}
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