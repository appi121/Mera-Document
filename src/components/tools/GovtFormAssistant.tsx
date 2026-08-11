import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccess } from '@/utils/toast';
import { ArrowLeft, CheckCircle2, FileText, ExternalLink, Sparkles } from 'lucide-react';

interface GovtFormAssistantProps {
  lang: Language;
  onBack: () => void;
}

export const GovtFormAssistant: React.FC<GovtFormAssistantProps> = ({ lang, onBack }) => {
  const [selectedForm, setSelectedForm] = useState<string>('income');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const forms = [
    {
      id: 'income',
      titleHi: 'आय प्रमाण पत्र (Income Certificate)',
      titleEn: 'Income Certificate Form Guide',
      docs: [
        { id: 'inc-1', hi: 'आधार कार्ड (Aadhaar Card)', en: 'Aadhaar Card' },
        { id: 'inc-2', hi: 'राशन कार्ड / बिजली बिल (Ration Card / Electricity Bill)', en: 'Ration Card / Electricity Bill' },
        { id: 'inc-3', hi: 'आय घोषणा पत्र (Self Declaration Form)', en: 'Self Declaration Form' },
        { id: 'inc-4', hi: 'वेतन पर्ची या पटवारी रिपोर्ट (Salary Slip or Patwari Report)', en: 'Salary Slip or Patwari Report' },
      ],
    },
    {
      id: 'caste',
      titleHi: 'जाति प्रमाण पत्र (Caste Certificate)',
      titleEn: 'Caste Certificate Form Guide',
      docs: [
        { id: 'cst-1', hi: 'आधार कार्ड (Aadhaar Card)', en: 'Aadhaar Card' },
        { id: 'cst-2', hi: 'पिता का जाति प्रमाण पत्र (Father Caste Certificate)', en: 'Father Caste Certificate' },
        { id: 'cst-3', hi: 'स्कूली टीसी / मार्कशीट (School TC / Marksheet)', en: 'School TC / Marksheet' },
        { id: 'cst-4', hi: 'जमीन की जमाबंदी या पुराना रिकॉर्ड (Land Record or Old Document)', en: 'Land Record or Old Document' },
      ],
    },
    {
      id: 'pan',
      titleHi: 'नया PAN कार्ड आवेदन (New PAN Form 49A)',
      titleEn: 'New PAN Card Form Helper',
      docs: [
        { id: 'pan-1', hi: 'आधार कार्ड (Aadhaar Card)', en: 'Aadhaar Card' },
        { id: 'pan-2', hi: '2 पासपोर्ट साइज फोटो (2 Passport Size Photos)', en: '2 Passport Size Photos' },
        { id: 'pan-3', hi: 'सत्यापित मोबाइल नंबर (Linked Mobile Number)', en: 'Linked Mobile Number' },
        { id: 'pan-4', hi: 'जन्म तिथि का प्रमाण (Proof of Date of Birth)', en: 'Proof of Date of Birth' },
      ],
    },
  ];

  const current = forms.find(f => f.id === selectedForm) || forms[0];

  const handleCheckChange = (docId: string, checked: boolean) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docId]: checked
    }));
  };

  // Calculate progress
  const currentDocs = current.docs;
  const checkedCount = currentDocs.filter(d => checkedDocs[d.id]).length;
  const progressPercentage = Math.round((checkedCount / currentDocs.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            📑 {lang === 'hi' ? 'सरकारी फॉर्म गाइड एवं असिस्टेंट' : 'Government Form Assistant'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' ? 'आय, जाति, निवास, पैन कार्ड आदि फॉर्म के जरूरी डॉक्यूमेंट्स और भरने की सही जानकारी' : 'Required documents & step-by-step guidance for Indian Govt Forms'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Form Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {forms.map(f => (
              <Button
                key={f.id}
                variant={selectedForm === f.id ? 'default' : 'outline'}
                onClick={() => { setSelectedForm(f.id); setCheckedDocs({}); }}
                className={selectedForm === f.id ? 'bg-orange-600 text-white hover:bg-orange-700' : 'border-gray-300 hover:bg-orange-50'}
              >
                {lang === 'hi' ? f.titleHi : f.titleEn}
              </Button>
            ))}
          </div>

          {/* Interactive Checklist Card */}
          <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                {lang === 'hi' ? current.titleHi : current.titleEn}
              </h3>
              <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full">
                {lang === 'hi' ? `${checkedCount} / ${currentDocs.length} तैयार` : `${checkedCount} of ${currentDocs.length} Ready`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>{lang === 'hi' ? 'आपकी तैयारी:' : 'Your Readiness:'}</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2.5 bg-orange-100 [&>div]:bg-orange-600" />
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                {lang === 'hi' ? 'दस्तावेजों की सूची (चेक करें जो आपके पास हैं):' : 'Document Checklist (Check what you have):'}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {currentDocs.map((doc) => (
                  <div 
                    key={doc.id} 
                    className={`flex items-center space-x-3 bg-white p-3.5 rounded-xl border transition-all ${
                      checkedDocs[doc.id] ? 'border-emerald-300 bg-emerald-50/30' : 'border-orange-100 hover:border-orange-200'
                    }`}
                  >
                    <Checkbox 
                      id={doc.id} 
                      checked={!!checkedDocs[doc.id]} 
                      onCheckedChange={(checked) => handleCheckChange(doc.id, !!checked)}
                      className="border-orange-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <label 
                      htmlFor={doc.id} 
                      className={`text-sm font-medium cursor-pointer select-none flex-1 ${
                        checkedDocs[doc.id] ? 'text-emerald-900 line-through opacity-80' : 'text-gray-700'
                      }`}
                    >
                      {lang === 'hi' ? doc.hi : doc.en}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                onClick={() => showSuccess(lang === 'hi' ? 'चेकलिस्ट PDF डाउनलोड हुई!' : 'Form checklist downloaded!')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 gap-2 rounded-xl"
              >
                <FileText className="w-4 h-4" />
                {lang === 'hi' ? 'चेकलिस्ट PDF डाउनलोड करें' : 'Download Checklist PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};