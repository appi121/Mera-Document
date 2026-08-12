import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import { downloadWordDoc } from '@/utils/download';
import { ArrowLeft, Sparkles, Copy, Download, Check, FileCheck2 } from 'lucide-react';

interface AffidavitGeneratorProps {
  lang: Language;
  onBack: () => void;
}

export const AffidavitGenerator: React.FC<AffidavitGeneratorProps> = ({ lang, onBack }) => {
  const [affidavitType, setAffidavitType] = useState('gap-year');
  const [fullName, setFullName] = useState('रमेश शर्मा');
  const [fatherName, setFatherName] = useState('सुरेश शर्मा');
  const [address, setAddress] = useState('गांधी नगर, जयपुर, राजस्थान');
  const [details, setDetails] = useState('वर्ष 2022 से 2023 के दौरान प्रतियोगी परीक्षा की तैयारी हेतु स्टडी गैप रहा');
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    let content = '';

    if (affidavitType === 'gap-year') {
      content = `शपथ पत्र / AFFIDAVIT (GAP YEAR DECLARATION)

मैं, ${fullName}, पुत्र/पुत्री श्री ${fatherName}, निवासी ${address}, सत्यनिष्ठा से निम्नलिखित बयान करता/करती हूँ:

1. यह कि मैं भारत का/की स्थायी निवासी हूँ।
2. यह कि मेरी अंतिम शैक्षणिक योग्यता के पश्चात् वर्ष 2022 से 2024 तक अध्ययन में अंतराल (Gap) रहा है।
3. यह कि इस अंतराल अवधि के दौरान: ${details}।
4. यह कि उक्त अंतराल अवधि में मेरे विरुद्ध किसी भी न्यायालय अथवा पुलिस स्टेशन में कोई आपराधिक मामला दर्ज नहीं है।

अतः यह मेरा सत्य शपथ पत्र है।

दिनांक: ${new Date().toLocaleDateString('hi-IN')}
स्थान: जयपुर

शपथकर्ता (Deponent):
नाम: ${fullName}
हस्ताक्षर: _______________________`;
    } else if (affidavitType === 'name-correction') {
      content = `नाम संशोधन शपथ पत्र / NAME MISMATCH AFFIDAVIT

मैं, ${fullName}, पुत्र/पुत्री श्री ${fatherName}, निवासी ${address}, सत्यनिष्ठा से घोषणा करता/करती हूँ:

1. यह कि मेरे आधार कार्ड/मार्कशीट में मेरा नाम ${fullName} दर्ज है।
2. यह कि मेरे अन्य दस्तावेजों में नाम की स्पेलिंग में मामूली भिन्नता पाई गई है।
3. यह कि ${fullName} एवं दस्तावेज़ों में अंकित नाम दोनों एक ही व्यक्ति (यानी मेरा) के नाम हैं।
4. यह कि भविष्य में सभी सरकारी एवं गैर-सरकारी कार्यों हेतु ${fullName} नाम ही मान्य रहेगा।

दिनांक: ${new Date().toLocaleDateString('hi-IN')}

शपथकर्ता:
नाम: ${fullName}
हस्ताक्षर: _______________________`;
    } else {
      content = `आय / स्व-घोषणा पत्र (SELF DECLARATION FORM)

मैं, ${fullName}, पिता श्री ${fatherName}, निवासी ${address}, शपथपूर्वक घोषणा करता हूँ कि:

1. मैं और मेरा परिवार उपरोक्त पते पर निवास करते हैं।
2. मेरे परिवार की सभी स्रोतों से कुल वार्षिक आय लगभग रु. 1,50,000/- (एक लाख पचास हजार रुपये) है।
3. दी गई सभी जानकारियाँ पूर्णतः सत्य व सही हैं।

दिनांक: ${new Date().toLocaleDateString('hi-IN')}

घोषणाकर्ता:
नाम: ${fullName}
हस्ताक्षर: _______________________`;
    }

    setGeneratedText(content);
    showSuccess(lang === 'hi' ? 'शपथ पत्र फॉर्मेट तैयार है!' : 'Affidavit draft ready!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'टेक्स्ट कॉपी हुआ!' : 'Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = () => {
    downloadWordDoc(`Affidavit_${affidavitType}_${fullName}.doc`, generatedText, 'Affidavit Document');
    showSuccess(lang === 'hi' ? 'MS Word फ़ाइल डाउनलोड हुई!' : 'Word document downloaded!');
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
            📜 {lang === 'hi' ? 'शपथ पत्र व एफ़िडेविट मेकर (Affidavit Generator)' : 'AI Affidavit & Declaration Generator'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'गैप ईयर, नाम सुधार, खोया दस्तावेज व आय स्व-घोषणा पत्र हेतु तुरंत कानूनी ड्राफ्ट तैयार करें' 
              : 'Auto-generate affidavits for Gap Year, Name Correction, Lost Documents & Self Declarations'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {lang === 'hi' ? 'शपथ पत्र का प्रकार' : 'Type of Affidavit'}
              </label>
              <Select value={affidavitType} onValueChange={setAffidavitType}>
                <SelectTrigger className="w-full border-orange-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gap-year">{lang === 'hi' ? '🎓 गैप ईयर शपथ पत्र (Gap Year Affidavit)' : 'Gap Year Affidavit'}</SelectItem>
                  <SelectItem value="name-correction">{lang === 'hi' ? '✏️ नाम भिन्नता / स्पेलिंग सुधार' : 'Name Mismatch Affidavit'}</SelectItem>
                  <SelectItem value="income-declaration">{lang === 'hi' ? '💰 आय स्व-घोषणा पत्र (Income Declaration)' : 'Self Income Declaration'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {lang === 'hi' ? 'आवेदक का नाम (Full Name)' : 'Applicant Full Name'}
              </label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {lang === 'hi' ? 'पिता / पति का नाम' : 'Father / Husband Name'}
              </label>
              <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {lang === 'hi' ? 'पूरा पता (Address)' : 'Full Address'}
              </label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {lang === 'hi' ? 'मुख्य कारण / विवरण (Reason Details)' : 'Reason or Specific Details'}
            </label>
            <Input value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>

          <Button onClick={handleGenerate} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2">
            <Sparkles className="w-4 h-4" />
            {lang === 'hi' ? 'शपथ पत्र ड्राफ्ट तैयार करें' : 'Generate Affidavit Draft'}
          </Button>

          {generatedText && (
            <div className="mt-6 border border-orange-200 rounded-xl p-4 bg-orange-50/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-orange-900 flex items-center gap-1">
                  <FileCheck2 className="w-4 h-4 text-orange-600" />
                  {lang === 'hi' ? 'कानूनी शपथ पत्र लीगल ड्राफ्ट:' : 'Legal Affidavit Draft:'}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs bg-white border-orange-200">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" onClick={handleDownloadWord} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                    <Download className="w-3.5 h-3.5" />
                    Word (.doc)
                  </Button>
                </div>
              </div>

              <Textarea
                rows={10}
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="bg-white font-serif text-xs sm:text-sm p-4 border-gray-300 leading-relaxed"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};