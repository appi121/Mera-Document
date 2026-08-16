import React from 'react';
import { Language } from '@/types/document';
import { PdfToolMode } from './PdfToolTabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PdfOptionsBarProps {
  lang: Language;
  activeSubTab: PdfToolMode;
  pageRange: string;
  setPageRange: (v: string) => void;
  rotationAngle: number;
  setRotationAngle: (v: number) => void;
  watermarkText: string;
  setWatermarkText: (v: string) => void;
}

export const PdfOptionsBar: React.FC<PdfOptionsBarProps> = ({
  lang,
  activeSubTab,
  pageRange,
  setPageRange,
  rotationAngle,
  setRotationAngle,
  watermarkText,
  setWatermarkText,
}) => {
  if (activeSubTab === 'split') {
    return (
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-800">
          {lang === 'hi' ? 'पेज रेंज दर्ज करें (उदा. 1-3 या 2,4):' : 'Enter Page Range (e.g. 1-3 or 2,4):'}
        </span>
        <Input
          value={pageRange}
          onChange={(e) => setPageRange(e.target.value)}
          placeholder="1-2"
          className="w-40 bg-white border-slate-300 text-xs font-bold"
        />
      </div>
    );
  }

  if (activeSubTab === 'rotate') {
    return (
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-800">
          {lang === 'hi' ? 'रोटेशन एंगल चुनें:' : 'Select Rotation Angle:'}
        </span>
        <div className="flex gap-2">
          {[90, 180, 270].map((deg) => (
            <Button
              key={deg}
              size="sm"
              variant={rotationAngle === deg ? 'default' : 'outline'}
              onClick={() => setRotationAngle(deg)}
              className={rotationAngle === deg ? 'bg-orange-600 text-white font-bold text-xs' : 'text-xs'}
            >
              {deg}° Right
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubTab === 'watermark') {
    return (
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-800">
          {lang === 'hi' ? 'वाटरमार्क टेक्स्ट लिखें:' : 'Watermark Text:'}
        </span>
        <Input
          value={watermarkText}
          onChange={(e) => setWatermarkText(e.target.value)}
          placeholder="CONFIDENTIAL"
          className="max-w-xs bg-white border-slate-300 text-xs font-bold"
        />
      </div>
    );
  }

  return null;
};