import React, { useState, useRef, useEffect } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Download, Image as ImageIcon, Grid, Sparkles } from 'lucide-react';

interface PassportPhotoSheetProps {
  lang: Language;
  onBack: () => void;
}

export const PassportPhotoSheet: React.FC<PassportPhotoSheetProps> = ({ lang, onBack }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [sheetSize, setSheetSize] = useState<'4x6' | 'a4'>('4x6');
  const [count, setCount] = useState<number>(8);
  const [sheetDataUrl, setSheetDataUrl] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setSheetDataUrl(null);
    }
  };

  useEffect(() => {
    if (photoUrl) {
      generateSheet();
    }
  }, [photoUrl, sheetSize, count]);

  const generateSheet = () => {
    if (!photoUrl) return;

    const canvas = document.createElement('canvas');
    // High DPI dimensions: 4x6 inch at 300 DPI = 1200x1800 px
    // A4 at 300 DPI = 2480x3508 px
    const isA4 = sheetSize === 'a4';
    canvas.width = isA4 ? 2480 : 1200;
    canvas.height = isA4 ? 3508 : 1800;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = photoUrl;
    img.onload = () => {
      // Passport photo aspect ratio ~ 3.5cm x 4.5cm (approx 350x450 px on 4x6 canvas)
      const pw = isA4 ? 380 : 260;
      const ph = isA4 ? 490 : 335;
      const marginX = isA4 ? 80 : 35;
      const marginY = isA4 ? 100 : 40;
      const gapX = isA4 ? 40 : 25;
      const gapY = isA4 ? 50 : 30;

      const cols = isA4 ? 5 : 4;
      const totalToDraw = count;

      for (let i = 0; i < totalToDraw; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = marginX + col * (pw + gapX);
        const y = marginY + row * (ph + gapY);

        if (y + ph > canvas.height) break; // prevent overflowing page

        // Draw photo
        ctx.drawImage(img, x, y, pw, ph);

        // Thin cutting border around each photo
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, pw, ph);
      }

      setSheetDataUrl(canvas.toDataURL('image/jpeg', 0.95));
    };
  };

  const handleDownload = () => {
    if (!sheetDataUrl) {
      showError(lang === 'hi' ? 'कृपया पहले फोटो अपलोड करें!' : 'Please upload photo first!');
      return;
    }

    const link = document.createElement('a');
    link.download = `Passport_Photos_Sheet_${sheetSize.toUpperCase()}_${count}_copies.jpg`;
    link.href = sheetDataUrl;
    link.click();
    showSuccess(lang === 'hi' ? 'प्रिंट शीट डाउनलोड हुई!' : 'Print sheet downloaded!');
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
            🖨️ {lang === 'hi' ? 'पासपोर्ट फोटो प्रिंट शीट मेकर (Passport Photo Sheet)' : 'Passport Photo Printable Sheet Maker'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'एक फोटो से 4x6 पेपर पर 8 फोटो या A4 पर 30 फोटो की रेडी-टू-प्रिंट शीट बनाएं' 
              : 'Turn a single photo into an 8-photo (4x6 inch) or 30-photo (A4) printable sheet for instant printing'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '1. अपनी पासपोर्ट साइज फोटो चुनें:' : '1. Upload Passport Size Photo:'}
                </Label>
                <div className="border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-xl p-5 text-center relative cursor-pointer hover:bg-orange-50 transition-colors">
                  <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-orange-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-800">
                      {photoUrl ? (lang === 'hi' ? 'दूसरी फोटो चुनें' : 'Change Photo') : (lang === 'hi' ? 'फोटो अपलोड करें' : 'Upload Photo')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '2. प्रिंट पेपर का साइज (Paper Size):' : '2. Select Paper Size:'}
                </Label>
                <Select value={sheetSize} onValueChange={(val: '4x6' | 'a4') => { setSheetSize(val); setCount(val === 'a4' ? 30 : 8); }}>
                  <SelectTrigger className="w-full border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4x6">{lang === 'hi' ? '📸 4x6 इंच फोटो पेपर (8 फोटो)' : '📸 4x6 Inch Photo Paper (8 Copies)'}</SelectItem>
                    <SelectItem value="a4">{lang === 'hi' ? '📄 A4 साइज पेपर (30 फोटो)' : '📄 A4 Size Paper (30 Copies)'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '3. कितनी फोटो प्रिंट करनी हैं?' : '3. Number of Copies:'}
                </Label>
                <Select value={count.toString()} onValueChange={(val) => setCount(Number(val))}>
                  <SelectTrigger className="w-full border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sheetSize === '4x6' ? (
                      <>
                        <SelectItem value="4">4 Photos</SelectItem>
                        <SelectItem value="6">6 Photos</SelectItem>
                        <SelectItem value="8">8 Photos (Full Sheet)</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="10">10 Photos</SelectItem>
                        <SelectItem value="20">20 Photos</SelectItem>
                        <SelectItem value="30">30 Photos (Full A4 Sheet)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleDownload}
                disabled={!sheetDataUrl}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
              >
                <Download className="w-4 h-4" />
                {lang === 'hi' ? `प्रिंट शीट (${sheetSize.toUpperCase()}) डाउनलोड करें` : `Download Printable Sheet (${sheetSize.toUpperCase()})`}
              </Button>
            </div>

            {/* Live Sheet Preview */}
            <div className="flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-4 bg-slate-50 min-h-[300px]">
              {sheetDataUrl ? (
                <div className="text-center space-y-3 w-full">
                  <div className="p-2 bg-white rounded-xl shadow-md border inline-block max-w-full">
                    <img src={sheetDataUrl} alt="Sheet Preview" className="max-h-[350px] object-contain mx-auto rounded-sm border" />
                  </div>
                  <p className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full inline-block">
                    ✓ {lang === 'hi' ? `${count} पासपेार्ट फोटो की शीट तैयार है` : `Ready to print ${count} copies`}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400 space-y-2">
                  <Grid className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-xs">
                    {lang === 'hi' ? 'फोटो अपलोड करते ही रेडी-टू-प्रिंट शीट का प्रीव्यू दिखेगा' : 'Upload photo to generate printable sheet preview'}
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