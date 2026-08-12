import React, { useState, useRef } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Download, Layers, CreditCard, Sparkles } from 'lucide-react';

interface IdCardJoinerProps {
  lang: Language;
  onBack: () => void;
}

export const IdCardJoiner: React.FC<IdCardJoinerProps> = ({ lang, onBack }) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [joinedDataUrl, setJoinedDataUrl] = useState<string | null>(null);

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFrontImage(url);
      setJoinedDataUrl(null);
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackImage(url);
      setJoinedDataUrl(null);
    }
  };

  const handleJoin = () => {
    if (!frontImage || !backImage) {
      showError(lang === 'hi' ? 'कृपया आगे और पीछे दोनों तरफ की फोटो अपलोड करें!' : 'Please upload both front and back photos!');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Title
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IDENTITY CARD / पहचान पत्र (FRONT & BACK)', 400, 45);

      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 65);
      ctx.lineTo(750, 65);
      ctx.stroke();

      const imgFront = new Image();
      const imgBack = new Image();

      imgFront.src = frontImage;
      imgFront.onload = () => {
        // Draw Front Photo
        ctx.drawImage(imgFront, 100, 90, 600, 380);

        imgBack.src = backImage;
        imgBack.onload = () => {
          // Draw Back Photo
          ctx.drawImage(imgBack, 100, 520, 600, 380);

          const resultUrl = canvas.toDataURL('image/jpeg', 0.9);
          setJoinedDataUrl(resultUrl);
          showSuccess(lang === 'hi' ? 'दोनों साइड्स एक पेज पर जुड़ गईं!' : 'Front and back combined onto single page!');
        };
      };
    }
  };

  const handleDownload = () => {
    if (!joinedDataUrl) return;
    const link = document.createElement('a');
    link.download = 'ID_Card_Combined_Front_Back.jpg';
    link.href = joinedDataUrl;
    link.click();
    showSuccess(lang === 'hi' ? 'संयुक्त ID कार्ड डाउनलोड हुआ!' : 'Combined ID Card Downloaded!');
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
            🪪 {lang === 'hi' ? 'आधार व ID कार्ड फ्रंट-बैक जोड़ने वाला टूल' : 'ID Card Front & Back Joiner'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'आधार कार्ड, वोटर ID, पैन या ड्राइविंग लाइसेंस के आगे और पीछे वाले भाग को एक ही पेज/फोटो में जोड़ें' 
              : 'Combine Front and Back sides of Aadhaar, PAN, Voter ID or DL into a single printable page'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Front */}
            <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-xl p-4 text-center relative hover:bg-orange-50 transition-colors">
              <input type="file" accept="image/*" onChange={handleFrontUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
              <div className="flex flex-col items-center">
                <CreditCard className="w-8 h-8 text-orange-600 mb-2" />
                <span className="font-bold text-xs text-gray-800">
                  {lang === 'hi' ? '1. आगे की फोटो (Front Side) अपलोड करें' : '1. Upload Front Side Image'}
                </span>
                {frontImage && <span className="text-[11px] text-emerald-600 font-bold mt-1">✓ {lang === 'hi' ? 'आगे का भाग अपलोड हुआ' : 'Front Uploaded'}</span>}
              </div>
            </div>

            {/* Upload Back */}
            <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-xl p-4 text-center relative hover:bg-orange-50 transition-colors">
              <input type="file" accept="image/*" onChange={handleBackUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
              <div className="flex flex-col items-center">
                <CreditCard className="w-8 h-8 text-amber-600 mb-2" />
                <span className="font-bold text-xs text-gray-800">
                  {lang === 'hi' ? '2. पीछे की फोटो (Back Side) अपलोड करें' : '2. Upload Back Side Image'}
                </span>
                {backImage && <span className="text-[11px] text-emerald-600 font-bold mt-1">✓ {lang === 'hi' ? 'पीछे का भाग अपलोड हुआ' : 'Back Uploaded'}</span>}
              </div>
            </div>
          </div>

          <Button
            onClick={handleJoin}
            disabled={!frontImage || !backImage}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {lang === 'hi' ? 'दोनों साइड्स एक साथ जोड़ें (Combine ID Card)' : 'Combine Front & Back Sides'}
          </Button>

          {joinedDataUrl && (
            <div className="mt-6 border border-orange-200 rounded-2xl p-4 bg-orange-50/30 text-center space-y-4">
              <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                {lang === 'hi' ? 'संयुक्त ID कार्ड (एक पेज प्रीव्यू):' : 'Combined ID Card Preview:'}
              </h4>
              <div className="inline-block p-2 bg-white rounded-xl shadow-md border max-w-sm">
                <img src={joinedDataUrl} alt="Combined ID Card" className="max-h-[350px] w-auto mx-auto rounded-md" />
              </div>

              <div>
                <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-xl gap-2">
                  <Download className="w-4 h-4" />
                  {lang === 'hi' ? 'कंबाइंड ID कार्ड (JPG) डाउनलोड करें' : 'Download Combined ID Card (JPG)'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};