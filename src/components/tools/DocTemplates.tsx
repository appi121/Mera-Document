import React from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess } from '@/utils/toast';
import { ArrowLeft, Download, FileCheck } from 'lucide-react';

interface DocTemplatesProps {
  lang: Language;
  onBack: () => void;
}

export const DocTemplates: React.FC<DocTemplatesProps> = ({ lang, onBack }) => {
  const templates = [
    { titleHi: 'किरायानामा फॉर्मेट (Rent Agreement)', titleEn: 'Rent Agreement Template' },
    { titleHi: 'रसीद फॉर्मेट (Payment Receipt)', titleEn: 'Payment Receipt Template' },
    { titleHi: 'अनुभव प्रमाण पत्र (Experience Letter)', titleEn: 'Experience Certificate Template' },
    { titleHi: 'वेतन पर्ची (Salary Slip Template)', titleEn: 'Salary Slip Template' },
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
            📋 {lang === 'hi' ? 'डॉक्यूमेंट टेम्पलेट्स (Templates Hub)' : 'Ready Document Templates'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((tpl, idx) => (
              <div key={idx} className="p-4 border border-orange-100 rounded-xl bg-orange-50/30 flex justify-between items-center hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{lang === 'hi' ? tpl.titleHi : tpl.titleEn}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => showSuccess(lang === 'hi' ? 'टेम्पलेट डाउनलोड हुआ!' : 'Template Downloaded!')} className="gap-1 border-orange-200 text-orange-700 hover:bg-orange-100">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};