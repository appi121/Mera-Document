import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, FileText, Globe } from 'lucide-react';

interface PrivacyPolicyModalProps {
  lang: Language;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ lang }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs text-orange-600 hover:underline font-semibold cursor-pointer">
          {lang === 'hi' ? 'प्राइवेसी पॉलिसी व डिस्क्लेमर (Privacy Policy)' : 'Privacy Policy & Terms'}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-orange-600">
            <ShieldCheck className="w-5 h-5" />
            {lang === 'hi' ? 'गोपनीयता नीति (Privacy Policy & Security)' : 'Privacy Policy & Terms of Service'}
          </DialogTitle>
        </DialogHeader>

        <div className="text-xs text-gray-700 space-y-4 leading-relaxed font-sans pt-2">
          <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
            <p className="font-bold text-orange-900">
              {lang === 'hi' ? '🔒 100% क्लाइंट-साइड सुरक्षा (Zero Server Upload):' : '🔒 100% Client-side Processing (Zero Data Saved):'}
            </p>
            <p className="mt-1">
              {lang === 'hi' 
                ? 'मेरा डॉक्यूमेंट (Mera Document) आपकी किसी भी फोटो, आधार कार्ड, पैन या रिज्यूमे को अपने सर्वर पर स्टोर या सेव नहीं करता है। सभी टूल सीधे आपके मोबाइल/कंप्यूटर के ब्राउज़र में चलते हैं।' 
                : 'Mera Document does NOT store or save any of your uploaded photos, documents, or resumes on any server. All processing happens 100% locally in your web browser.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">1. Google AdSense & Cookies</h4>
            <p>
              This website uses Google AdSense to serve advertisements. Google uses cookies to serve ads based on user visits to this and other websites.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">2. Disclaimer</h4>
            <p>
              All forms, calculators, and affidavits are provided for guidance and utility purposes. Users should verify final document details with official government portals before submission.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">3. Contact Us</h4>
            <p>
              For queries or suggestions regarding Mera Document tools, email us at: <span className="font-semibold text-orange-600">support@meradocument.in</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};