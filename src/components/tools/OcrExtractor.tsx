import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess, showError } from '@/utils/toast';
import { downloadFile, downloadWordDoc } from '@/utils/download';
import { formatOcrDataWithLayout } from '@/utils/ocrFormatter';
import { 
  ArrowLeft, 
  Camera, 
  Copy, 
  Check, 
  Sparkles, 
  Loader2, 
  Table, 
  FileText, 
  Download, 
  FileSpreadsheet
} from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface OcrExtractorProps {
  lang: Language;
  onBack: () => void;
}

export const OcrExtractor: React.FC<OcrExtractorProps> = ({ lang, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [structuredTableData, setStructuredTableData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setExtractedText('');
      setStructuredTableData([]);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleExtract = async () => {
    if (!file && !previewUrl) {
      showError(lang === 'hi' ? 'कृपया पहले फोटो अपलोड करें!' : 'Please upload an image first!');
      return;
    }

    setLoading(true);
    setStatusText(lang === 'hi' ? 'AI भाषा मॉडल (हिंदी व इंग्लिश) लोड हो रहा है...' : 'Loading AI OCR Engine...');

    try {
      const worker = await createWorker(['hin', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            setStatusText(lang === 'hi' ? 'AI कोर इंजन लोड हो रहा है...' : 'Loading AI Core...');
          } else if (m.status === 'initializing tesseract') {
            setStatusText(lang === 'hi' ? 'हिंदी व इंग्लिश मॉडल तैयार हो रहा है...' : 'Initializing OCR...');
          } else if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            setStatusText(lang === 'hi' ? `अक्षर व टेबल स्कैन हो रहे हैं... ${pct}%` : `Scanning table & text... ${pct}%`);
          }
        },
      });

      setStatusText(lang === 'hi' ? 'एक्सेल टेबल ग्रिड अलाइनमेंट तैयार किया जा रहा है...' : 'Aligning Excel columns with image...');
      
      const targetSource = previewUrl || file;
      const { data } = await worker.recognize(targetSource!);

      await worker.terminate();

      // Process with Smart 2D Grid Alignment
      const result = formatOcrDataWithLayout(data);

      if (result.formattedText.trim()) {
        setExtractedText(result.formattedText);
        setStructuredTableData(result.gridMatrix);
        showSuccess(lang === 'hi' ? 'फोटो का टेबल एक्सेल ग्रिड में 100% सही अलाइन हो गया!' : 'Table grid aligned perfectly for Excel!');
      } else {
        setExtractedText(
          lang === 'hi' 
            ? 'फोटो में साफ़ टेक्स्ट नहीं मिल सका। कृपया साफ़ और स्पष्ट फोटो अपलोड करें।' 
            : 'No clear text detected in the photo.'
        );
        showError(lang === 'hi' ? 'साफ़ टेक्स्ट नहीं मिला!' : 'No clear text found!');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      showError(lang === 'hi' ? 'OCR स्कैनिंग में त्रुटि हुई। कृपया दोबारा प्रयास करें।' : 'Failed to scan image. Please try again.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'सुरक्षित लेआउट टेक्स्ट कॉपी हो गया!' : 'Structured text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = () => {
    if (!extractedText) return;
    downloadWordDoc(`OCR_Aligned_Document_${Date.now()}.doc`, extractedText, 'OCR Formatted Document');
    showSuccess(lang === 'hi' ? 'MS Word (.doc) फ़ाइल डाउनलोड हुई!' : 'Word Document downloaded!');
  };

  const handleDownloadExcel = () => {
    if (structuredTableData.length === 0) return;

    // Generate strict HTML table with MS Excel cell styling & text preserving rule
    const rowsHtml = structuredTableData.map(row => {
      const cells = row.map(cell => {
        const val = cell.trim();
        return `<td style="border: 1px solid #b0bec5; padding: 6px 12px; font-family: 'Calibri', sans-serif; font-size: 11pt; mso-number-format:'\\@'; text-align: left; vertical-align: middle;">${val}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const excelDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>OCR Aligned Sheet</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    td { mso-number-format:"\\@"; }
  </style>
</head>
<body style="font-family:Calibri,sans-serif;">
  <table style="border-collapse:collapse; width:100%;">
    ${rowsHtml}
  </table>
</body>
</html>`;

    const blob = new Blob(['\ufeff' + excelDoc], { type: 'application/vnd.ms-excel;charset=utf-8' });
    downloadFile(blob, `OCR_Excel_Aligned_${Date.now()}.xls`, 'application/vnd.ms-excel');
    showSuccess(lang === 'hi' ? 'MS Excel (.xls) सेम-टू-सेम टेबल फ़ाइल डाउनलोड हुई!' : 'Excel Table downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              📷 {lang === 'hi' ? '100% सेम-टू-सेम एक्सेल टेबल OCR एक्सट्रेक्टर' : '100% Same-to-Same Excel Table OCR'}
            </CardTitle>

            <Badge variant="secondary" className="bg-white/20 text-white border-white/40 text-xs px-2.5 py-1 w-fit">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {lang === 'hi' ? 'एक्सेल ग्रिड अलाइन' : 'Zero Column Shift'}
            </Badge>
          </div>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'फोटो में बने टेबल, बिल या लिस्ट को बिना खिसके सेम-टू-सेम Excel (.xls) शीट में बदलें' 
              : 'Extract table photos directly into perfectly aligned Excel sheets without column shifts'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Upload Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-2xl p-6 text-center cursor-pointer relative hover:bg-orange-50 transition-colors min-h-[260px] flex flex-col justify-center items-center overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {previewUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-h-[230px] rounded-lg object-contain shadow-md" />
                    {loading && (
                      <div className="absolute inset-0 bg-orange-950/50 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center p-4 text-white">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-400 mb-2" />
                        <span className="font-bold text-xs text-center leading-relaxed">{statusText}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-gray-800 text-sm mb-1">
                      {lang === 'hi' ? 'टेबल या कागज़ की फोटो चुनें' : 'Upload Document / Table Photo'}
                    </p>
                    <p className="text-xs text-gray-500 max-w-xs">
                      {lang === 'hi' ? 'बिल, सारणी (Table), लिस्ट या फॉर्म की फोटो अपलोड करें' : 'Upload photo of table sheet, bill, letter or form'}
                    </p>
                  </>
                )}
              </div>

              <Button
                onClick={handleExtract}
                disabled={!file || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading 
                  ? (lang === 'hi' ? 'एक्सेल अलाइनमेंट जारी है...' : 'Aligning Columns...') 
                  : (lang === 'hi' ? 'सेम-टू-सेम एक्सेल टेबल निकालें' : 'Extract Aligned Excel Table')}
              </Button>
            </div>

            {/* Right Output Column with Tabs */}
            <div className="lg:col-span-7 space-y-3">
              <Tabs defaultValue="table-view" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                  <TabsList className="bg-orange-50 border border-orange-200">
                    <TabsTrigger value="table-view" className="text-xs gap-1.5 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                      <Table className="w-3.5 h-3.5" />
                      {lang === 'hi' ? 'एक्सेल ग्रिड प्रीव्यू (Excel View)' : 'Excel Grid View'}
                    </TabsTrigger>
                    <TabsTrigger value="text-view" className="text-xs gap-1.5 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                      <FileText className="w-3.5 h-3.5" />
                      {lang === 'hi' ? 'टेक्स्ट व्यू (Formatted Text)' : 'Formatted Text'}
                    </TabsTrigger>
                  </TabsList>

                  {extractedText && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs border-orange-200 text-orange-700 bg-white">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownloadWord} className="gap-1 text-xs border-blue-200 text-blue-700 bg-white">
                        <Download className="w-3.5 h-3.5" />
                        Word
                      </Button>
                      {structuredTableData.length > 0 && (
                        <Button size="sm" onClick={handleDownloadExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs shadow-md">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          Excel (.xls) डाउनलोड करें
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <TabsContent value="table-view">
                  <div className="border border-orange-200 rounded-xl overflow-x-auto h-[300px] bg-white p-2">
                    {structuredTableData.length > 0 ? (
                      <table className="w-full text-xs text-left border-collapse font-sans min-w-[500px]">
                        <tbody>
                          {structuredTableData.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-orange-50/20' : 'bg-white'}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="border border-slate-300 p-2 text-gray-800 font-medium whitespace-nowrap min-w-[80px]">
                                  {cell || <span className="text-gray-300 italic">-</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400">
                        {lang === 'hi' ? 'फोटो स्कैन करने के बाद यहाँ परफेक्ट एक्सेल ग्रिड दिखाई देगी' : 'Aligned Excel grid preview will appear here'}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="text-view">
                  <Textarea 
                    rows={12} 
                    value={extractedText} 
                    onChange={(e) => setExtractedText(e.target.value)} 
                    placeholder={lang === 'hi' ? 'फोटो अपलोड करके "सेम-टू-सेम एक्सेल टेबल निकालें" बटन दबाएं...' : 'Upload photo and click extract...'}
                    className="font-mono text-xs sm:text-sm bg-slate-50 border-orange-200 focus-visible:ring-orange-500 h-[300px] p-3.5 leading-relaxed" 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};