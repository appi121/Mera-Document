import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { showSuccess } from '@/utils/toast';
import { downloadFile, generateSamplePdfBlob } from '@/utils/download';
import { ArrowLeft, Sparkles, Download } from 'lucide-react';

interface ResumeBuilderProps {
  lang: Language;
  onBack: () => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ lang, onBack }) => {
  const [formData, setFormData] = useState({
    name: 'राहुल शर्मा',
    role: 'कंप्यूटर ऑपरेटर / डाटा एंट्री',
    phone: '+91 9876543210',
    email: 'rahul.sharma@email.com',
    city: 'जयपुर, राजस्थान',
    experience: '2 वर्ष का अनुभव एमएस ऑफिस, एक्सेल, डेटा एंट्री और हिंदी-इंग्लिश टाइपिंग में।',
    education: '12वीं पास (RBSE) एवं RSCIT कंप्यूटर डिप्लोमा',
    skills: 'MS Excel, Tally Prime, Hindi Typing 35 WPM, Email Handling',
  });

  const handleDownload = () => {
    const resumeText = `====================================================
RESUME / बायोडाटा
====================================================
नाम: ${formData.name}
पद: ${formData.role}
फोन: ${formData.phone}
ईमेल: ${formData.email}
शहर: ${formData.city}

शिक्षा / EDUCATION:
${formData.education}

अनुभव / WORK EXPERIENCE:
${formData.experience}

कौशल / SKILLS:
${formData.skills}
====================================================`;

    const pdfBlob = generateSamplePdfBlob(`Resume - ${formData.name}`, resumeText);
    downloadFile(pdfBlob, `${formData.name || 'Resume'}_Biodata.pdf`, 'application/pdf');
    showSuccess(lang === 'hi' ? 'रिज्यूमे PDF डाउनलोड हुआ!' : 'Resume PDF downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border-orange-200 shadow-sm">
            <CardHeader className="bg-orange-50 border-b border-orange-100 py-4">
              <CardTitle className="text-lg font-bold text-orange-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                {lang === 'hi' ? '🤖 AI रिज्यूमे बिल्डर (Resume Creator)' : 'AI Resume Builder'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-700">{lang === 'hi' ? 'पूरा नाम (Full Name)' : 'Full Name'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा. राहुल शर्मा"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">{lang === 'hi' ? 'पद / जॉब टाइटल (Job Title)' : 'Job Title'}</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="उदा. Sales Manager / Accountant"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">{lang === 'hi' ? 'मोबाइल नंबर' : 'Phone'}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">{lang === 'hi' ? 'शहर / राज्य' : 'City'}</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">{lang === 'hi' ? 'योग्यता / पढ़ाई (Education)' : 'Education'}</Label>
                <Input
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">{lang === 'hi' ? 'कार्य अनुभव (Work Experience)' : 'Experience'}</Label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows={3}
                  className="mt-1 text-xs sm:text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">{lang === 'hi' ? 'कौशल (Skills / हुनर)' : 'Skills'}</Label>
                <Input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="mt-1 text-xs sm:text-sm"
                />
              </div>

              <Button onClick={handleDownload} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 gap-2 rounded-xl">
                <Download className="w-4 h-4" />
                {lang === 'hi' ? 'रिज्यूमे (PDF) डाउनलोड करें' : 'Download Resume PDF'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Resume Preview */}
        <div className="lg:col-span-6">
          <div className="sticky top-20 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg min-h-[500px]">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{formData.name || 'आपका नाम'}</h2>
              <p className="text-orange-600 font-semibold text-sm">{formData.role || 'जॉब टाइटल'}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span>📞 {formData.phone}</span>
                <span>✉️ {formData.email}</span>
                <span>📍 {formData.city}</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 border-b pb-1 mb-1 text-xs uppercase tracking-wider text-orange-700">
                  {lang === 'hi' ? 'अनुभव (Work Experience)' : 'Work Experience'}
                </h3>
                <p className="leading-relaxed bg-gray-50 p-2.5 rounded-lg text-xs">{formData.experience}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 border-b pb-1 mb-1 text-xs uppercase tracking-wider text-orange-700">
                  {lang === 'hi' ? 'शिक्षा (Education)' : 'Education'}
                </h3>
                <p className="bg-gray-50 p-2.5 rounded-lg text-xs">{formData.education}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 border-b pb-1 mb-1 text-xs uppercase tracking-wider text-orange-700">
                  {lang === 'hi' ? 'मुख्य हुनर (Skills)' : 'Key Skills'}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.skills.split(',').map((skill, i) => (
                    <span key={i} className="bg-orange-100 text-orange-800 text-[11px] px-2.5 py-0.5 rounded-md font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};