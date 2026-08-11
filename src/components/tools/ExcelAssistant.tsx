import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';
import { ArrowLeft, Sparkles, Copy, Check } from 'lucide-react';

interface ExcelAssistantProps {
  lang: Language;
  onBack: () => void;
}

export const ExcelAssistant: React.FC<ExcelAssistantProps> = ({ lang, onBack }) => {
  const [query, setQuery] = useState('मुझे दो कॉलम A और B के नंबर्स का टोटल जोड़ना है और 18% GST लगाना है');
  const [formula, setFormula] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setFormula('=SUM(A2:B2) * 1.18');
    showSuccess(lang === 'hi' ? 'एक्सेल फ़ॉर्मूला तैयार है!' : 'Excel Formula Generated!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formula);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'फ़ॉर्मूला कॉपी हुआ!' : 'Formula Copied!');
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
            📊 {lang === 'hi' ? 'एक्सेल AI असिस्टेंट (Excel Formula Helper)' : 'Excel AI Formula Assistant'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {lang === 'hi' ? 'आप एक्सेल में क्या करना चाहते हैं?' : 'What do you want to calculate in Excel?'}
            </label>
            <Textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="उदा. Column A से duplicates हटाएं या VLOOKUP कैसे लगाएं..."
            />
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {lang === 'hi' ? 'एक्सेल फ़ॉर्मूला प्राप्त करें' : 'Get Excel Formula'}
          </Button>

          {formula && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 block">{lang === 'hi' ? 'Excel Formula:' : 'Excel Formula:'}</span>
                <span className="font-mono text-base font-bold text-emerald-900">{formula}</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs border-emerald-300">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};