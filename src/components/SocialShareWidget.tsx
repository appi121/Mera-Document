import React from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';
import { Share2, MessageCircle, Copy } from 'lucide-react';

interface SocialShareWidgetProps {
  lang: Language;
}

export const SocialShareWidget: React.FC<SocialShareWidgetProps> = ({ lang }) => {
  const shareMessage = encodeURIComponent(
    `🇮🇳 *मेरा डॉक्यूमेंट (Mera Document)* - भारत का अपना फ़्री AI डॉक्यूमेंट टूल!\n\n` +
    `✅ PDF to Word & Scanned OCR\n` +
    `✅ Photo & Signature Resizer (20KB / 50KB)\n` +
    `✅ Passport Photo Print Sheet (8 Photo in 4x6)\n` +
    `✅ Aadhaar Front-Back Joiner\n` +
    `✅ AI Resume & Govt Form Assistant\n\n` +
    `👉 अभी इस्तेमाल करें: ${window.location.origin}`
  );

  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${shareMessage}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess(lang === 'hi' ? 'वेबसाइट लिंक कॉपी हो गया!' : 'Website link copied!');
  };

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-6 px-4 my-8 rounded-2xl max-w-5xl mx-auto shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {lang === 'hi' ? 'दोस्तों व व्हाट्सएप ग्रुप्स में शेयर करें!' : 'Share with Friends & Cyber Cafe Groups!'}
            </h3>
            <p className="text-xs text-emerald-100">
              {lang === 'hi' ? 'जरूरतमंद छात्रों और साइबर कैफे वालों की मदद करें' : 'Help students and Cyber Cafe owners save time & money'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleWhatsAppShare}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-4 py-2 gap-2 rounded-xl shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp पर भेजें
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs sm:text-sm px-3.5 py-2 gap-1.5 rounded-xl"
          >
            <Copy className="w-4 h-4" />
            {lang === 'hi' ? 'कॉपी लिंक' : 'Copy Link'}
          </Button>
        </div>
      </div>
    </div>
  );
};