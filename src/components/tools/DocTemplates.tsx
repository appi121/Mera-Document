import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import { downloadWordDoc } from '@/utils/download';
import { ArrowLeft, Download, FileCheck, Copy, Check, Sparkles, FileText } from 'lucide-react';

interface DocTemplatesProps {
  lang: Language;
  onBack: () => void;
}

export const DocTemplates: React.FC<DocTemplatesProps> = ({ lang, onBack }) => {
  const [selectedTpl, setSelectedTpl] = useState<string>('rent');
  const [copied, setCopied] = useState(false);

  // Template Form States
  const [partyA, setPartyA] = useState('रामप्रसाद शर्मा (मकान मालिक)');
  const [partyB, setPartyB] = useState('सुनील वर्मा (किरायेदार)');
  const [amount, setAmount] = useState('7,500');
  const [address, setAddress] = useState('मकान नं. 42, मालवीय नगर, जयपुर');
  const [duration, setDuration] = useState('11 महीने');

  const getTemplateContent = () => {
    if (selectedTpl === 'rent') {
      return `किरायानामा / RENT AGREEMENT

यह किरायानामा आज दिनांक ${new Date().toLocaleDateString('hi-IN')} को निम्नलिखित पक्षकारों के मध्य निष्पादित किया गया:

प्रथम पक्ष (मकान मालिक):
श्री/श्रीमती: ${partyA}

द्वितीय पक्ष (किरायेदार):
श्री/श्रीमती: ${partyB}

परिसर का विवरण:
${address}

शर्तें एवं नियम:
1. द्वितीय पक्ष प्रथम पक्ष को प्रतिमाह रु. ${amount}/- (अक्षरी: सात हजार पांच सौ रुपये) किराया देगा।
2. यह किरायानामा ${duration} की अवधि के लिए मान्य रहेगा।
3. बिजली एवं पानी का बिल किरायेदार द्वारा अलग से देय होगा।
4. किरायेदार परिसर का उपयोग केवल आवासीय कार्य हेतु करेगा।

प्रथम पक्ष के हस्ताक्षर: ___________________
द्वितीय पक्ष के हस्ताक्षर: ___________________
गवाह 1: ___________________
गवाह 2: ___________________`;
    }

    if (selectedTpl === 'receipt') {
      return `भुगतान रसीद / PAYMENT RECEIPT

रसीद संख्या: REC-${Math.floor(1000 + Math.random() * 9000)}
दिनांक: ${new Date().toLocaleDateString('hi-IN')}

प्राप्तकर्ता (Received From): ${partyB}
भुगतान राशि (Amount Received): रु. ${amount}/-
भुगतान का विवरण (For the Purpose of): ${address}

प्राप्त करने वाले का नाम: ${partyA}
हस्ताक्षर (Signature): ___________________`;
    }

    if (selectedTpl === 'experience') {
      return `अनुभव प्रमाण पत्र / EXPERIENCE CERTIFICATE

दिनांक: ${new Date().toLocaleDateString('hi-IN')}

प्रमाणित किया जाता है कि श्री/श्रीमती ${partyB} हमारी संस्था/फर्म में विगत ${duration} से कंप्यूटर ऑपरेटर व डेटा एंट्री ऑपरेटर के पद पर कार्यरत रहे हैं।

इनकी सेवा अवधि के दौरान इनका आचरण एवं कार्य प्रदर्शन अत्यंत संतोषजनक एवं प्रशंसनीय रहा है। हम इनके उज्ज्वल भविष्य की कामना करते हैं।

संस्था का नाम: ${partyA}
स्थान: ${address}

अधिकृत हस्ताक्षर: ___________________
(मुहर एवं सील)`;
    }

    // Salary Slip
    return `वेतन पर्ची / SALARY SLIP

कर्मचारी का नाम: ${partyB}
पद (Designation): डाटा एंट्री ऑपरेटर
माह / वर्ष: ${new Date().toLocaleString('hi-IN', { month: 'long', year: 'numeric' })}

संस्था / कंपनी का नाम: ${partyA}

मूल वेतन (Basic Salary): रु. ${amount}/-
मकान भत्ता (HRA): रु. 1,500/-
विशेष भत्ता (Special Allowance): रु. 1,000/-
------------------------------------------------------
कुल देय वेतन (Net Salary): रु. ${Number(amount.replace(/,/g, '')) + 2500}/-

कर्मचारी हस्ताक्षर: ___________________
अधिकारी हस्ताक्षर: ___________________`;
  };

  const content = getTemplateContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'टेम्पलेट टेक्स्ट कॉपी हुआ!' : 'Template text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const titles: Record<string, string> = {
      rent: 'Rent_Agreement',
      receipt: 'Payment_Receipt',
      experience: 'Experience_Certificate',
      salary: 'Salary_Slip',
    };
    const filename = `${titles[selectedTpl] || 'Document'}_${Date.now()}.doc`;
    downloadWordDoc(filename, content, titles[selectedTpl] || 'Template');
    showSuccess(lang === 'hi' ? 'MS Word (.doc) फ़ाइल डाउनलोड हुई!' : 'Word file downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            📋 {lang === 'hi' ? 'रेडीमेड डॉक्यूमेंट टेम्पलेट्स (Document Templates Hub)' : 'Ready Ready-Made Legal & Office Templates'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'किरायानामा, रसीद, अनुभव प्रमाण पत्र व सैलरी स्लिप के रेडीमेड फॉर्मैट्स - लाइव एडिट करें व Word में डाउनलोड करें' 
              : 'Customize and download Rent Agreements, Payment Receipts, Experience Letters & Salary Slips in Word (.doc)'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Template Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '1. टेम्पलेट का प्रकार चुनें:' : '1. Select Template Type:'}
                </label>
                <Select value={selectedTpl} onValueChange={setSelectedTpl}>
                  <SelectTrigger className="w-full border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">🏠 किरायानामा (Rent Agreement)</SelectItem>
                    <SelectItem value="receipt">🧾 भुगतान रसीद (Payment Receipt)</SelectItem>
                    <SelectItem value="experience">📜 अनुभव प्रमाण पत्र (Experience Letter)</SelectItem>
                    <SelectItem value="salary">💰 वेतन पर्ची (Salary Slip)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {selectedTpl === 'rent' ? 'प्रथम पक्ष (मकान मालिक)' : selectedTpl === 'receipt' ? 'प्राप्तकर्ता (Issuer Name)' : 'संस्था / कंपनी का नाम'}
                </label>
                <Input value={partyA} onChange={(e) => setPartyA(e.target.value)} className="border-orange-200" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {selectedTpl === 'rent' ? 'द्वितीय पक्ष (किरायेदार)' : selectedTpl === 'receipt' ? 'देने वाला (Received From)' : 'कर्मचारी / आवेदक का नाम'}
                </label>
                <Input value={partyB} onChange={(e) => setPartyB(e.target.value)} className="border-orange-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'राशि / किराया (₹):' : 'Amount (₹):'}
                  </label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="border-orange-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'समय सीमा (Duration):' : 'Duration:'}
                  </label>
                  <Input value={duration} onChange={(e) => setDuration(e.target.value)} className="border-orange-200" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? 'पता / विवरण:' : 'Address / Description:'}
                </label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="border-orange-200" />
              </div>

              <Button
                onClick={handleDownloadDoc}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                {lang === 'hi' ? 'MS Word (.doc) डाउनलोड करें' : 'Download Editable Word (.doc)'}
              </Button>
            </div>

            {/* Live Template Preview */}
            <div className="lg:col-span-7 bg-orange-50/40 p-4 border border-orange-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-orange-600" />
                    {lang === 'hi' ? 'लाइव टेम्पलेट प्रीव्यू:' : 'Live Template Preview:'}
                  </span>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs bg-white border-orange-200">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                <Textarea
                  rows={12}
                  value={content}
                  readOnly
                  className="bg-white font-serif text-xs sm:text-sm p-4 border-gray-300 leading-relaxed h-[340px]"
                />
              </div>

              <div className="pt-3 text-[11px] text-gray-500 font-medium text-center border-t border-orange-200/60 mt-3">
                {lang === 'hi' ? '✓ MS Word, LibreOffice व Google Docs में आसानी से खुलने योग्य फ़ाइल' : '✓ Compatible with MS Word & Google Docs'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};