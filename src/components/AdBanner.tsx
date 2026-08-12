import React from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  label?: string;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  label = 'Advertisement / विज्ञापन',
  className = ''
}) => {
  return (
    <div className={`my-6 max-w-5xl mx-auto px-4 ${className}`}>
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 rounded-2xl p-4 text-center shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-center mb-1 text-[10px] uppercase font-bold tracking-wider text-gray-400">
          <span>{label}</span>
          <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[9px]">Sponsor</span>
        </div>

        {/* Ad Content Placeholder (Will load Google Adsense automatically when pub-id is attached) */}
        <div className="py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center text-lg shrink-0 shadow-sm">
              🇮🇳
            </div>
            <div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">
                सरकारी फॉर्म ऑनलाइन भरवाएं व प्रिंट निकालें
              </p>
              <p className="text-[11px] text-gray-600">
                100% सुरक्षित • सुपर फ़ास्ट स्पीड • ऑल-इन-वन डॉक्यूमेंट टूलकिट
              </p>
            </div>
          </div>

          <a 
            href="#tools" 
            className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow transition-transform group-hover:scale-105"
          >
            फ्री टूल्स इस्तेमाल करें ➔
          </a>
        </div>
      </div>
    </div>
  );
};