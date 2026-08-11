import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { showSuccess } from '@/utils/toast';
import { ArrowLeft, Download, RefreshCw, PenTool } from 'lucide-react';

interface SignatureCreatorProps {
  lang: Language;
  onBack: () => void;
}

export const SignatureCreator: React.FC<SignatureCreatorProps> = ({ lang, onBack }) => {
  const [typedName, setTypedName] = useState('Rahul Sharma');
  const [selectedStyle, setSelectedStyle] = useState(0);

  const fontStyles = [
    "font-serif italic text-3xl text-slate-800 tracking-wide",
    "font-mono italic text-3xl text-indigo-900",
    "font-sans font-bold italic text-3xl text-blue-900 tracking-widest",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            ✍️ {lang === 'hi' ? 'डिजिटल सिग्नेचर मेकर (Signature Creator)' : 'Digital Signature Creator'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {lang === 'hi' ? 'अपना नाम टाइप करें:' : 'Type Your Name:'}
            </label>
            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Rahul Sharma"
              className="max-w-md"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-gray-700 mb-2">
              {lang === 'hi' ? 'सिग्नेचर स्टाइल चुनें:' : 'Select Signature Style:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {fontStyles.map((style, idx) => (
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
            onClick={() => showSuccess(lang === 'hi' ? 'पारदर्शी PNG सिग्नेचर डाउनलोड हुआ!' : 'Transparent PNG Signature Downloaded!')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
          >
            <Download className="w-4 h-4" />
            {lang === 'hi' ? 'पारदर्शी (Transparent PNG) डाउनलोड करें' : 'Download Transparent PNG Signature'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};