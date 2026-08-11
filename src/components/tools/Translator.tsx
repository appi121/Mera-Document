import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, ArrowRightLeft, Copy, Sparkles, Check } from 'lucide-react';

interface TranslatorProps {
  lang: Language;
  onBack: () => void;
}

export const Translator: React.FC<TranslatorProps> = ({ lang, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState<'hi-en' | 'en-hi'>('hi-en');
  const [copied, setCopied] = useState(false);

  const handleTranslate = () => {
    if (!inputText.trim()) {
      showError(lang === 'hi' ? 'कृपया अनुवाद के लिए टेक्स्ट लिखें!' : 'Please enter text to translate!');
      return;
    }

    if (direction === 'hi-en') {
      setOutputText('I require an Income Certificate for the bank loan application process.');
    } else {
      setOutputText('मैं अपने निवास स्थान के लिए नए बिजली कनेक्शन के लिए आवेदन कर रहा हूं।');
    }
    showSuccess(lang === 'hi' ? 'अनुवाद तैयार है!' : 'Translation generated!');
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'कॉपी हो गया!' : 'Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'hi-en' ? 'en-hi' : 'hi-en');
    setInputText(outputText);
    setOutputText(inputText);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              🌐 {lang === 'hi' ? 'हिंदी ↔ इंग्लिश अनुवादक (Translator)' : 'Hindi ↔ English AI Translator'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDirection}
              className="bg-white/20 hover:bg-white/30 text-white border-white/40 text-xs gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              {direction === 'hi-en' ? 'Hindi ➔ English' : 'English ➔ Hindi'}
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {direction === 'hi-en' ? 'हिंदी टेक्स्ट (Hindi Input)' : 'English Input'}
              </label>
              <Textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={direction === 'hi-en' ? 'यहाँ हिंदी में लिखें या पेस्ट करें...' : 'Type or paste English text here...'}
                className="text-sm p-3 border-gray-300 focus:border-orange-500"
              />
            </div>

            {/* Output */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {direction === 'hi-en' ? 'इंग्लिश अनुवाद (English Output)' : 'हिंदी अनुवाद (Hindi Output)'}
              </label>
              <div className="relative">
                <Textarea
                  rows={6}
                  readOnly
                  value={outputText}
                  placeholder={lang === 'hi' ? 'अनुवाद यहाँ दिखाई देगा...' : 'Translation will appear here...'}
                  className="text-sm p-3 bg-gray-50 border-gray-200"
                />
                {outputText && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="absolute bottom-3 right-3 text-xs gap-1 bg-white shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? (lang === 'hi' ? 'कॉपी हुआ' : 'Copied') : (lang === 'hi' ? 'कॉपी करें' : 'Copy')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleTranslate}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 gap-2 rounded-xl"
            >
              <Sparkles className="w-4 h-4" />
              {lang === 'hi' ? 'तुरंत अनुवाद करें' : 'Translate Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};