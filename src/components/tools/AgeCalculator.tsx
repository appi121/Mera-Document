import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Calendar as CalendarIcon, Sparkles, Copy, Check, Clock } from 'lucide-react';

interface AgeCalculatorProps {
  lang: Language;
  onBack: () => void;
}

export const AgeCalculator: React.FC<AgeCalculatorProps> = ({ lang, onBack }) => {
  const [dob, setDob] = useState('2000-01-15');
  const [targetDate, setTargetDate] = useState('2025-01-01');
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalMonths: number;
    nextBirthdayDays: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const calculateAge = () => {
    if (!dob || !targetDate) {
      showError(lang === 'hi' ? 'कृपया जन्म तिथि और कट-ऑफ तारीख चुनें!' : 'Please select both dates!');
      return;
    }

    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (birth > target) {
      showError(lang === 'hi' ? 'जन्म तिथि कट-ऑफ तारीख से पहले की होनी चाहिए!' : 'Birth date must be before target date!');
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffTime = Math.abs(target.getTime() - birth.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalMonths = years * 12 + months;

    // Next birthday calculation
    const currentYearBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (target > currentYearBirthday) {
      currentYearBirthday.setFullYear(target.getFullYear() + 1);
    }
    const nextBdayTime = Math.abs(currentYearBirthday.getTime() - target.getTime());
    const nextBirthdayDays = Math.ceil(nextBdayTime / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      totalDays,
      totalMonths,
      nextBirthdayDays,
    });

    showSuccess(lang === 'hi' ? 'आयु की गणना हो गई है!' : 'Age calculated successfully!');
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `उम्र / Age: ${result.years} वर्ष (Years), ${result.months} महीने (Months), ${result.days} दिन (Days)\nकट-ऑफ तारीख: ${targetDate}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'कॉपी हो गया!' : 'Copied to clipboard!');
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
            🎂 {lang === 'hi' ? 'सरकारी फॉर्म आयु कैलकुलेटर (Age Calculator)' : 'Govt Form Age Calculator'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'SSC, पुलिस, रेलवे व बैंक फॉर्म हेतु कट-ऑफ तारीख तक अपनी सटीक उम्र (वर्ष, महीने, दिन) निकालें' 
              : 'Calculate exact age in Years, Months and Days as on job cut-off date'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '1. जन्म तिथि (Date of Birth):' : '1. Date of Birth:'}
                </Label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="border-orange-200 focus-visible:ring-orange-500"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '2. किस तारीख तक उम्र निकालनी है (Cut-off Date):' : '2. Age as on Date (Cut-off):'}
                </Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="border-orange-200 focus-visible:ring-orange-500"
                />
              </div>

              <Button
                onClick={calculateAge}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {lang === 'hi' ? 'आयु की गणना करें' : 'Calculate Age'}
              </Button>
            </div>

            {/* Results Display Area */}
            <div className="flex flex-col justify-center border border-orange-100 rounded-2xl p-6 bg-gradient-to-br from-orange-50/60 to-amber-50/40 min-h-[250px]">
              {result ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-orange-200 pb-3">
                    <span className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                      {lang === 'hi' ? 'आपकी कुल उम्र:' : 'Your Calculated Age:'}
                    </span>
                    <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs bg-white border-orange-200">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-orange-600" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  {/* Highlight Cards */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
                      <span className="text-2xl font-black text-orange-600 block">{result.years}</span>
                      <span className="text-[11px] font-bold text-gray-600">{lang === 'hi' ? 'वर्ष (Years)' : 'Years'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
                      <span className="text-2xl font-black text-amber-600 block">{result.months}</span>
                      <span className="text-[11px] font-bold text-gray-600">{lang === 'hi' ? 'महीने (Months)' : 'Months'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
                      <span className="text-2xl font-black text-emerald-600 block">{result.days}</span>
                      <span className="text-[11px] font-bold text-gray-600">{lang === 'hi' ? 'दिन (Days)' : 'Days'}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-xs space-y-1.5 text-gray-600 font-medium">
                    <p className="flex justify-between">
                      <span>{lang === 'hi' ? 'कुल महीने:' : 'Total Months:'}</span>
                      <span className="font-bold text-gray-900">{result.totalMonths} {lang === 'hi' ? 'महीने' : 'Months'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>{lang === 'hi' ? 'कुल दिन (Total Days):' : 'Total Days:'}</span>
                      <span className="font-bold text-gray-900">{result.totalDays} {lang === 'hi' ? 'दिन' : 'Days'}</span>
                    </p>
                    <p className="flex justify-between text-orange-800 font-bold pt-1 border-t border-orange-200/60">
                      <span>{lang === 'hi' ? 'अगला जन्मदिन आने में:' : 'Next Birthday in:'}</span>
                      <span>{result.nextBirthdayDays} {lang === 'hi' ? 'दिन शेष' : 'days left'}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 space-y-2">
                  <Clock className="w-10 h-10 mx-auto text-orange-300" />
                  <p className="text-xs">
                    {lang === 'hi' ? 'अपनी जन्म तिथि डालकर "आयु की गणना करें" पर क्लिक करें' : 'Select birth date and click Calculate Age'}
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