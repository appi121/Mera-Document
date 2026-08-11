import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Sparkles, Copy, Download, Check } from 'lucide-react';

interface LetterWriterProps {
  lang: Language;
  onBack: () => void;
}

export const LetterWriter: React.FC<LetterWriterProps> = ({ lang, onBack }) => {
  const [letterType, setLetterType] = useState('leave');
  const [recipient, setRecipient] = useState('शाखा प्रबंधक / बैंक मैनेजर');
  const [reason, setReason] = useState('खाता बंद करने हेतु / नए चेकबुक के लिए आवेदन');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const letter = `सेवा में,
${recipient},
शाखा कार्यालय, जयपुर।

विषय: ${reason}

महोदय/महोदया,

सप्रमाण निवेदन है कि मैं आपके बैंक का एक नियमित खाताधारक हूँ। मुझे ${reason} की सख्त आवश्यकता है।

अतः आपसे विनम्र निवेदन है कि इस विषय पर उचित कार्यवाही करने की कृपा करें। इसके लिए मैं आपका सदैव आभारी रहूँगा।

धन्यवाद,
भवदीय,
[आपका नाम]
मोबाइल: [आपका नंबर]
दिनांक: ${new Date().toLocaleDateString('hi-IN')}`;

    setGeneratedLetter(letter);
    showSuccess(lang === 'hi' ? 'आवेदन पत्र तैयार है!' : 'Letter generated successfully!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'टेक्स्ट कॉपी हुआ!' : 'Text copied!');
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
            📝 {lang === 'hi' ? 'AI पत्र एवं आवेदन लेखक (Letter Writer)' : 'AI Letter & Application Writer'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {lang === 'hi' ? 'आवेदन का प्रकार' : 'Type of Application'}
              </label>
              <Select value={letterType} onValueChange={setLetterType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="चुने" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leave">{lang === 'hi' ? 'छुट्टी का आवेदन (Leave Application)' : 'Leave Application'}</SelectItem>
                  <SelectItem value="bank">{lang === 'hi' ? 'बैंक आवेदन पत्र (Bank Request)' : 'Bank Request'}</SelectItem>
                  <SelectItem value="govt">{lang === 'hi' ? 'सरकारी शिकायती पत्र (Govt Request)' : 'Govt Complaint/Request'}</SelectItem>
                  <SelectItem value="job">{lang === 'hi' ? 'नौकरी हेतु आवेदन (Job Cover Letter)' : 'Job Application'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {lang === 'hi' ? 'किसको भेजना है (Recipient Title)' : 'Recipient Title'}
              </label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="उदा. प्रधनाचार्य, बैंक मैनेजर, बिजली अधिकारी"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {lang === 'hi' ? 'मुख्य कारण या विषय (Main Reason)' : 'Subject / Key Reason'}
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="उदा. बीमारी के कारण 2 दिन का अवकाश, नया पासबुक बनवाने हेतु"
            />
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {lang === 'hi' ? 'AI से पत्र बनवाएं' : 'Generate Application with AI'}
          </Button>

          {generatedLetter && (
            <div className="mt-6 border border-orange-200 rounded-xl p-4 bg-orange-50/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-orange-800">
                  {lang === 'hi' ? 'तैयार आवेदन पत्र:' : 'Generated Letter Preview:'}
                </span>
                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs bg-white">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (lang === 'hi' ? 'कॉपी हुआ' : 'Copied') : (lang === 'hi' ? 'कॉपी करें' : 'Copy')}
                </Button>
              </div>
              <Textarea
                rows={10}
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="bg-white font-serif text-sm p-3 border-gray-300"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};