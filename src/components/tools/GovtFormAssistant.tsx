import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { showSuccess } from '@/utils/toast';
import { ArrowLeft, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

interface GovtFormAssistantProps {
  lang: Language;
  onBack: () => void;
}

export const GovtFormAssistant: React.FC<GovtFormAssistantProps> = ({ lang, onBack }) => {
  const [selectedForm, setSelectedForm] = useState<string>('income');

  const forms = [
    {
      id: 'income',
      titleHi: 'आय प्रमाण पत्र (Income Certificate)',
      titleEn: 'Income Certificate Form Guide',
      docsHi: ['आधार कार्ड', 'राशन कार्ड / बिजली बिल', 'आय घोषणा पत्र (Self Declaration)'],
      docsEn: ['Aadhaar Card', 'Ration Card / Electricity Bill', 'Self Declaration Form'],
    },
    {
      id: 'caste',
      titleHi: 'जाति प्रमाण पत्र (Caste Certificate)',
      titleEn: 'Caste Certificate Form Guide',
      docsHi: ['आधार कार्ड', 'पिता का जाति प्रमाण पत्र', 'स्कूली टीसी / मार्कशीट'],
      docsEn: ['Aadhaar Card', 'Father Caste Cert', 'School TC / Marksheet'],
    },
    {
      id: 'pan',
      titleHi: 'नया PAN कार्ड आवेदन (New PAN Form 49A)',
      titleEn: 'New PAN Card Form Helper',
      docsHi: ['आधार कार्ड', '2 पासपोर्ट साइज फोटो', 'सत्यापित मोबाइल नंबर'],
      docsEn: ['Aadhaar Card', '2 Passport Size Photos', 'Linked Mobile Number'],
    },
  ];

  const current = forms.find(f => f.id === selectedForm) || forms[0];

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
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {forms.map(f => (
              <Button
                key={f.id}
                variant={selectedForm === f.id ? 'default' : 'outline'}
                onClick={() => setSelectedForm(f.id)}
                className={selectedForm === f.id ? 'bg-orange-600 text-white' : 'border-gray-300'}
              >
                {lang === 'hi' ? f.titleHi : f.titleEn}
              </Button>
            ))}
          </div>

          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-200 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              {lang === 'hi' ? current.titleHi : current.titleEn}
            </h3>

            <div>
              <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">
                {lang === 'hi' ? 'आवश्यक दस्तावेज (Required Documents):' : 'Required Documents:'}
              </p>
              <ul className="space-y-2">
                {(lang === 'hi' ? current.docsHi : current.docsEn).map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2.5 rounded-lg border border-orange-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => showSuccess(lang === 'hi' ? 'फॉर्म की सूची डाउनलोड हुई!' : 'Form checklist downloaded!')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm px-5 py-2 gap-2 rounded-xl"
              >
                <FileText className="w-4 h-4" />
                {lang === 'hi' ? 'चेकलिस्ट PDF डाउनलोड करें' : 'Download Form Checklist PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};