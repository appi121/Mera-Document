import React, { useState, useEffect } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Timer, Copy, Check, Play, RotateCcw, FileText } from 'lucide-react';

interface TypingWordCounterProps {
  lang: Language;
  onBack: () => void;
}

export const TypingWordCounter: React.FC<TypingWordCounterProps> = ({ lang, onBack }) => {
  const [text, setText] = useState('');
  const [testTimeMinutes, setTestTimeMinutes] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTestActive, setIsTestActive] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sample typing passage in Hindi/English for exams
  const samplePassage = 'भारत एक महान और विशाल देश है। यहाँ विभिन्न संस्कृतियों और भाषाओं का सुंदर संगम देखने को मिलता है। डिजिटल भारत के इस युग में सभी सरकारी सेवाएँ अब ऑनलाइन उपलब्ध हो चुकी हैं।';

  useEffect(() => {
    let timer: any = null;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTestActive) {
      setIsTestActive(false);
      setTestFinished(true);
      showSuccess(lang === 'hi' ? 'टाइपिंग समय समाप्त!' : 'Typing test finished!');
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  // Statistics calculation
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s+/g, '').length;
  const sentences = trimmed ? trimmed.split(/[.!?।]+/).filter(Boolean).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0;

  // WPM Calculation
  const minutesElapsed = (testTimeMinutes * 60 - timeLeft) / 60;
  const wpm = minutesElapsed > 0 ? Math.round(words / minutesElapsed) : 0;

  const startTest = () => {
    setText('');
    setTimeLeft(testTimeMinutes * 60);
    setIsTestActive(true);
    setTestFinished(false);
  };

  const resetTest = () => {
    setIsTestActive(false);
    setTestFinished(false);
    setTimeLeft(testTimeMinutes * 60);
    setText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'टेक्स्ट कॉपी हुआ!' : 'Copied!');
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
            ⌨️ {lang === 'hi' ? 'हिंदी व इंग्लिश वर्ड काउंटर एवं टाइपिंग टेस्ट' : 'Hindi & English Word Counter & Typing Test'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi'
              ? 'अक्षर, शब्द, पैराग्राफ गिनें तथा हाई कोर्ट/SSC टाइपिंग परीक्षा हेतु WPM टाइपिंग स्पीड टेस्ट दें'
              : 'Count words, characters, sentences and measure WPM typing speed for exams'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-orange-50 p-3.5 rounded-xl border border-orange-200 text-center">
              <span className="text-2xl font-black text-orange-600 block">{words}</span>
              <span className="text-xs font-bold text-gray-600">{lang === 'hi' ? 'कुल शब्द (Words)' : 'Words'}</span>
            </div>
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-center">
              <span className="text-2xl font-black text-amber-600 block">{charactersWithSpaces}</span>
              <span className="text-xs font-bold text-gray-600">{lang === 'hi' ? 'कुल अक्षर (Chars)' : 'Characters'}</span>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center">
              <span className="text-2xl font-black text-emerald-600 block">{wpm}</span>
              <span className="text-xs font-bold text-gray-600">{lang === 'hi' ? 'टाइपिंग स्पीड (WPM)' : 'WPM Speed'}</span>
            </div>
            <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 text-center">
              <span className="text-2xl font-black text-indigo-600 block">{sentences}</span>
              <span className="text-xs font-bold text-gray-600">{lang === 'hi' ? 'वाक्य (Sentences)' : 'Sentences'}</span>
            </div>
          </div>

          {/* Typing Speed Timer Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Timer className="w-6 h-6 text-orange-600 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-gray-700 block">
                  {lang === 'hi' ? 'टाइपिंग टेस्ट टाइमर:' : 'Typing Test Timer:'}
                </span>
                <span className="font-mono text-xl font-bold text-orange-700">
                  {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={testTimeMinutes.toString()} onValueChange={(v) => { setTestTimeMinutes(Number(v)); setTimeLeft(Number(v) * 60); }}>
                <SelectTrigger className="w-[120px] bg-white border-gray-300 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Minute</SelectItem>
                  <SelectItem value="3">3 Minutes</SelectItem>
                  <SelectItem value="5">5 Minutes</SelectItem>
                </SelectContent>
              </Select>

              {!isTestActive ? (
                <Button size="sm" onClick={startTest} className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs">
                  <Play className="w-3.5 h-3.5" />
                  {lang === 'hi' ? 'टेस्ट शुरू करें' : 'Start Test'}
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={resetTest} className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5 text-xs">
                  <RotateCcw className="w-3.5 h-3.5" />
                  {lang === 'hi' ? 'रीसेट' : 'Reset'}
                </Button>
              )}
            </div>
          </div>

          {/* Sample Text for Typing Practice */}
          <div className="bg-orange-50/40 p-3.5 rounded-xl border border-orange-100 text-xs text-gray-700 space-y-1">
            <span className="font-bold text-orange-900 block">{lang === 'hi' ? 'अभ्यास हेतु नमूना पैराग्राफ (Sample Text):' : 'Sample Practice Passage:'}</span>
            <p className="italic font-serif leading-relaxed text-gray-800">{samplePassage}</p>
          </div>

          {/* Input Text Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-700">
                {lang === 'hi' ? 'यहाँ अपना टेक्स्ट टाइप करें या पेस्ट करें:' : 'Type or paste your text here:'}
              </label>
              {text && (
                <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs gap-1 h-7 border-gray-300">
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              )}
            </div>

            <Textarea
              rows={8}
              value={text}
              disabled={testFinished}
              onChange={(e) => setText(e.target.value)}
              placeholder={lang === 'hi' ? 'यहाँ हिंदी या इंग्लिश में टाइप करना शुरू करें...' : 'Start typing in Hindi or English here...'}
              className="text-sm p-3.5 border-gray-300 focus-visible:ring-orange-500 leading-relaxed font-sans"
            />
          </div>

          {testFinished && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm">
                🎉 {lang === 'hi' ? 'टाइपिंग टेस्ट समाप्त हुआ!' : 'Typing Test Completed!'}
              </h4>
              <p className="text-xs text-emerald-800">
                {lang === 'hi' ? `आपकी टाइपिंग गति ${wpm} WPM रही, जिसमें कुल ${words} शब्द टाइप किए गए।` : `Your Typing Speed: ${wpm} WPM with ${words} total words.`}
              </p>
              <Button size="sm" onClick={startTest} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 mt-2">
                <RotateCcw className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'दोबारा टेस्ट दें' : 'Try Again'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};