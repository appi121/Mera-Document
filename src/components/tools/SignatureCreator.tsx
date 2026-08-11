import React, { useState, useRef, useEffect } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Download, Trash2, PenTool, Type } from 'lucide-react';

interface SignatureCreatorProps {
  lang: Language;
  onBack: () => void;
}

export const SignatureCreator: React.FC<SignatureCreatorProps> = ({ lang, onBack }) => {
  const [typedName, setTypedName] = useState('Rahul Sharma');
  const [selectedStyle, setSelectedStyle] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const fontStyles = [
    "italic 32px Georgia, serif",
    "italic 32px 'Courier New', monospace",
    "bold italic 32px Arial, sans-serif",
  ];

  const fontClasses = [
    "font-serif italic text-3xl text-slate-800 tracking-wide",
    "font-mono italic text-3xl text-indigo-900",
    "font-sans font-bold italic text-3xl text-blue-900 tracking-widest",
  ];

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [canvasRef.current]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showSuccess(lang === 'hi' ? 'कैनवास साफ किया गया!' : 'Canvas cleared!');
  };

  const handleDownloadTyped = () => {
    if (!typedName.trim()) {
      showError(lang === 'hi' ? 'कृपया अपना नाम दर्ज करें!' : 'Please enter your name!');
      return;
    }
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 500;
    tempCanvas.height = 150;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.font = fontStyles[selectedStyle] || "italic 32px Georgia, serif";
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, tempCanvas.width / 2, tempCanvas.height / 2);

      const link = document.createElement('a');
      link.download = `signature_${typedName.replace(/\s+/g, '_')}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
      showSuccess(lang === 'hi' ? 'सिग्नेचर PNG डाउनलोड हुआ!' : 'Signature PNG downloaded!');
    }
  };

  const handleDownloadDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      if (!buffer.some(color => color !== 0)) {
        showError(lang === 'hi' ? 'कृपया पहले सिग्नेचर ड्रा करें!' : 'Please draw a signature first!');
        return;
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'digital_signature.png';
    link.href = dataUrl;
    link.click();
    showSuccess(lang === 'hi' ? 'आपका ड्रा किया हुआ सिग्नेचर डाउनलोड हुआ!' : 'Your drawn signature downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            ✍️ {lang === 'hi' ? 'डिजिटल सिग्नेचर मेकर' : 'Digital Signature Creator'}
          </CardTitle>
          <CardDescription className="text-orange-100">
            {lang === 'hi' ? 'टाइप करके या हाथ से ड्रा करके पारदर्शी (Transparent PNG) सिग्नेचर बनाएं' : 'Create transparent PNG signatures by typing or drawing'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="draw" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-orange-50 p-1 rounded-xl">
              <TabsTrigger value="draw" className="rounded-lg gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <PenTool className="w-4 h-4" />
                {lang === 'hi' ? 'हाथ से ड्रा करें' : 'Draw Signature'}
              </TabsTrigger>
              <TabsTrigger value="type" className="rounded-lg gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <Type className="w-4 h-4" />
                {lang === 'hi' ? 'नाम टाइप करें' : 'Type Signature'}
              </TabsTrigger>
            </TabsList>

            {/* Draw Signature Tab */}
            <TabsContent value="draw" className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative border-2 border-dashed border-orange-200 rounded-2xl bg-slate-50 overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={250}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair max-w-full block bg-white"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={clearCanvas} className="bg-white/90 hover:bg-red-50 hover:text-red-600 border-gray-200 gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" />
                      {lang === 'hi' ? 'साफ करें' : 'Clear'}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {lang === 'hi' ? 'ऊपर दिए गए बॉक्स में माउस या उंगली से दस्तखत करें' : 'Use your mouse or finger to sign inside the box above'}
                </p>
              </div>

              <Button
                onClick={handleDownloadDrawn}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
              >
                <Download className="w-4 h-4" />
                {lang === 'hi' ? 'पारदर्शी सिग्नेचर (PNG) डाउनलोड करें' : 'Download Transparent Signature PNG'}
              </Button>
            </TabsContent>

            {/* Type Signature Tab */}
            <TabsContent value="type" className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? 'अपना नाम टाइप करें:' : 'Type Your Name:'}
                </label>
                <Input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="max-w-md border-orange-200 focus-visible:ring-orange-500"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">
                  {lang === 'hi' ? 'सिग्नेचर स्टाइल चुनें:' : 'Select Signature Style:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {fontClasses.map((style, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedStyle(idx)}
                      className={`p-6 border rounded-xl cursor-pointer text-center bg-gray-50 flex items-center justify-center min-h-[100px] transition-all ${
                        selectedStyle === idx ? 'border-2 border-orange-500 bg-orange-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={style}>{typedName || 'Signature'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleDownloadTyped}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
              >
                <Download className="w-4 h-4" />
                {lang === 'hi' ? 'चुना हुआ स्टाइल (PNG) डाउनलोड करें' : 'Download Selected Style PNG'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};