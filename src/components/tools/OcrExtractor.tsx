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
import { preprocessImageForOcr } from '@/utils/imagePreprocess';
import { 
  ArrowLeft, 
  Camera, 
  Copy, 
  Check, 
  Loader2, 
  Table, 
  FileText, 
  Download, 
  FileSpreadsheet,
  Plus,
  Trash2,
  Brain,
  ShieldCheck,
  Bot,
  AlertTriangle
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
  const [cellConfidences, setCellConfidences] = useState<number[][]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
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
      setCellConfidences([]);
      setWarnings([]);
    } else {
      setPreviewUrl(null);
      setExtractedText('');
      setStructuredTableData([]);
      setCellConfidences([]);
      setWarnings([]);
    }
  };

  const handleExtract = async () => {
    if (!file && !previewUrl) {
      showError(lang === 'hi' ? 'कृपया पहले फोटो अपलोड करें!' : 'Please upload an image first!');
      return;
    }

    setLoading(true);
    setStatusText(lang === 'hi' ? 'फोटो का कंट्रास्ट व रिज़ॉल्यूशन बढ़ाया जा रहा है...' : 'Enhancing image quality...');

    try {
      const targetSource = file ? URL.createObjectURL(file) : previewUrl || '';
      const enhancedImageDataUrl = await preprocessImageForOcr(targetSource);
      const finalImage = (enhancedImageDataUrl && enhancedImageDataUrl.startsWith('data:image/')) 
        ? enhancedImageDataUrl 
        : targetSource;

      setStatusText(lang === 'hi' ? 'AI भाषा मॉडल (हिंदी + इंग्लिश) चालू हो रहा है...' : 'Initializing OCR Engine...');

      const worker = await createWorker(['hin', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            setStatusText(lang === 'hi' ? `स्कैनिंग प्रगति... ${pct}%` : `Scanning text... ${pct}%`);
          }
        },
      });

      await worker.setParameters({
        tessedit_pageseg_mode: '3' as any,
      });

      setStatusText(lang === 'hi' ? 'दस्तावेज़ की पंक्तियों व लेआउट का संरेखण हो रहा है...' : 'Aligning document layout...');
      
      const { data } = await worker.recognize(finalImage);
      await worker.terminate();

      const result = formatOcrDataWithLayout(data);

      if (result.formattedText.trim()) {
        setExtractedText(result.formattedText);
        setStructuredTableData(result.gridMatrix);
        setCellConfidences(result.cellConfidences);
        setWarnings(result.warnings);
        showSuccess(lang === 'hi' ? 'फोटो से टेक्स्ट सफलतापूर्वक निकल गया!' : 'Text extracted successfully!');
      } else {
        setExtractedText(
          lang === 'hi' 
            ? 'फोटो में साफ़ टेक्स्ट नहीं मिल सका। कृपया स्पष्ट फोटो अपलोड करें।' 
            : 'No clear text detected in the photo.'
        );
        showError(lang === 'hi' ? 'साफ़ टेक्स्ट नहीं मिला!' : 'No clear text found!');
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      showError(err.message || (lang === 'hi' ? 'OCR स्कैनिंग में त्रुटि हुई।' : 'Failed to scan image.'));
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleCellChange = (rIdx: number, cIdx: number, value: string) => {
    const updated = structuredTableData.map((row, r) => {
      if (r === rIdx) {
        const newRow = [...row];
        newRow[cIdx] = value;
        return newRow;
      }
      return row;
    });
    setStructuredTableData(updated);

    const updatedConf = cellConfidences.map((row, r) => {
      if (r === rIdx) {
        const newRow = [...row];
        newRow[cIdx] = 100;
        return newRow;
      }
      return row;
    });
    setCellConfidences(updatedConf);

    const textLines = updated.map(row => row.filter(Boolean).join(' | '));
    setExtractedText(textLines.join('\n\n'));
  };

  const handleAddRow = () => {
    const colsCount = structuredTableData[0]?.length || 6;
    setStructuredTableData([...structuredTableData, Array(colsCount).fill('')]);
    setCellConfidences([...cellConfidences, Array(colsCount).fill(100)]);
  };

  const handleRemoveRow = (rIdx: number) => {
    setStructuredTableData(structuredTableData.filter((_, idx) => idx !== rIdx));
    setCellConfidences(cellConfidences.filter((_, idx) => idx !== rIdx));
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'टेक्स्ट कॉपी हो गया!' : 'Text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = async () => {
    if (!extractedText) return;
    await downloadWordDoc(`OCR_Document_${Date.now()}.docx`, extractedText, 'OCR Extracted Document', structuredTableData);
    showSuccess(lang === 'hi' ? 'MS Word (.docx) फ़ाइल डाउनलोड हुई!' : 'Word (.docx) downloaded!');
  };

  const handleDownloadExcel = () => {
    if (structuredTableData.length === 0) {
      handleDownloadWord();
      return;
    }

    const cleanRows = structuredTableData.filter(row => row.some(cell => (cell || '').trim() !== ''));

    const rowsHtml = cleanRows.map((row, idx) => {
      const isHeader = idx === 0;
      const cells = row.map(cell => {
        const val = (cell || '').trim().replace(/\n/g, '<br/>');
        const bg = isHeader ? 'background-color: #ea580c; color: #ffffff; font-weight: bold;' : '';
        return `<td style="border: 1px solid #94a3b8; padding: 10px 14px; font-family: 'Segoe UI', Calibri, sans-serif; font-size: 11pt; mso-number-format:'\\@'; text-align: left; vertical-align: top; ${bg}">${val}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const excelDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <style>
    table { border-collapse: collapse; width: 100%; }
    td { mso-number-format:"\\@"; }
  </style>
</head>
<body>
  <table>
    ${rowsHtml}
  </table>
</body>
</html>`;

    const blob = new Blob(['\ufeff' + excelDoc], { type: 'application/vnd.ms-excel;charset=utf-8' });
    downloadFile(blob, `OCR_Table_${Date.now()}.xls`, 'application/vnd.ms-excel');
    showSuccess(lang === 'hi' ? 'एक्सेल (.xls) डाउनलोड हुई!' : 'Excel downloaded!');
  };

  const getCellBgColor = (confidence: number, text: string) => {
    if (!text) return 'bg-white';
    if (text.includes('[Needs verification]')) return 'bg-red-50 border-red-300';
    if (confidence < 60) return 'bg-amber-50 border-amber-300';
    return 'bg-white';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-amber-200" />
              {lang === 'hi' ? 'AI डीप विज़न OCR स्कैनर (हिंदी + इंग्लिश)' : 'AI Deep Vision OCR Scanner (Hindi + English)'}
            </CardTitle>

            <Badge variant="secondary" className="bg-white/20 text-white border-white/40 text-xs px-2.5 py-1 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-300" />
              Tesseract Neural Engine
            </Badge>
          </div>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'किसी भी दस्तावेज़, पत्र, मार्कशीट या सारणी की फोटो से सीधे एडिटेबल वर्ड (.docx) व एक्सेल बनाएं' 
              : 'Extract clean Hindi & English text from photos, papers and scanned documents into Word (.docx) & Excel'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs sm:text-sm">
                  {lang === 'hi' ? 'सत्यापन आवश्यक (Verification Required):' : 'Verification Required:'}
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  {lang === 'hi' 
                    ? 'कुछ सेल्स में कम स्पष्टता के कारण [Needs verification] मार्क किया गया है। कृपया नीचे ग्रिड में जांचें।' 
                    : 'Some cells have low confidence and are marked with [Needs verification]. Please verify below.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-2xl p-6 text-center cursor-pointer relative hover:bg-orange-50 transition-colors min-h-[280px] flex flex-col justify-center items-center overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {previewUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="max-h-[250px] rounded-lg object-contain shadow-md" />
                    {loading && (
                      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center p-4 text-white">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-400 mb-2" />
                        <span className="font-bold text-xs text-center leading-relaxed text-orange-200">{statusText}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-gray-800 text-sm mb-1">
                      {lang === 'hi' ? 'फोटो या स्कैन दस्तावेज़ चुनें' : 'Upload Document Photo'}
                    </p>
                    <p className="text-xs text-gray-500 max-w-xs">
                      {lang === 'hi' ? 'JPG, PNG, WEBP - हिंदी व इंग्लिश दोनों भाषाओं के लिए' : 'JPG, PNG, WEBP files supported'}
                    </p>
                  </>
                )}
              </div>

              <Button
                onClick={handleExtract}
                disabled={!file && !previewUrl}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl gap-2 shadow-md text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                {loading 
                  ? (lang === 'hi' ? 'AI OCR स्कैनिंग जारी है...' : 'Scanning Image...') 
                  : (lang === 'hi' ? 'फोटो से टेक्स्ट निकालें' : 'Extract Text with AI OCR')}
              </Button>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <Tabs defaultValue="table-view" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                  <TabsList className="bg-orange-50 border border-orange-200">
                    {structuredTableData.length > 0 && (
                      <TabsTrigger value="table-view" className="text-xs gap-1.5 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                        <Table className="w-3.5 h-3.5" />
                        {lang === 'hi' ? 'एक्सेल टेबल ग्रिड' : 'Excel Grid View'}
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="text-view" className="text-xs gap-1.5 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                      <FileText className="w-3.5 h-3.5" />
                      {lang === 'hi' ? 'डॉक्यूमेंट लेआउट' : 'Document View'}
                    </TabsTrigger>
                  </TabsList>

                  {extractedText && (
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs border-orange-200 text-orange-700 bg-white">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <Button size="sm" onClick={handleDownloadWord} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1 text-xs shadow-md">
                        <Download className="w-3.5 h-3.5" />
                        Word (.docx)
                      </Button>
                      {structuredTableData.length > 0 && (
                        <Button size="sm" onClick={handleDownloadExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs shadow-md">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          Excel (.xls)
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <TabsContent value="text-view">
                  <Textarea 
                    rows={13} 
                    value={extractedText} 
                    onChange={(e) => setExtractedText(e.target.value)} 
                    placeholder={lang === 'hi' ? 'फोटो अपलोड करके "फोटो से टेक्स्ट निकालें" दबाएं...' : 'Upload photo and click extract...'}
                    className="font-sans text-xs sm:text-sm bg-white border-orange-200 focus-visible:ring-orange-500 h-[360px] p-4 leading-relaxed whitespace-pre font-medium shadow-inner" 
                  />
                </TabsContent>

                <TabsContent value="table-view">
                  {structuredTableData.length > 0 ? (
                    <div className="border border-orange-200 rounded-xl overflow-x-auto h-[360px] bg-white p-2 relative flex flex-col justify-between shadow-inner">
                      <div className="overflow-auto h-full">
                        <table className="w-full text-xs text-left border-collapse font-sans min-w-[750px]">
                          <tbody>
                            {structuredTableData.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx === 0 ? 'bg-orange-600 text-white font-bold' : rIdx % 2 === 0 ? 'bg-orange-50/30' : 'bg-white'}>
                                {row.map((cell, cIdx) => {
                                  const confidence = cellConfidences[rIdx]?.[cIdx] ?? 100;
                                  return (
                                    <td key={cIdx} className={`border border-slate-300 p-1.5 vertical-top ${getCellBgColor(confidence, cell)}`}>
                                      <textarea
                                        rows={2}
                                        value={cell}
                                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                        className={`w-full bg-transparent px-1.5 py-1 text-xs font-medium focus:outline-none focus:bg-orange-100 rounded resize-y ${rIdx === 0 ? 'text-white placeholder-white/80 font-bold' : 'text-slate-800'}`}
                                      />
                                    </td>
                                  );
                                })}
                                <td className="p-1 text-center w-8">
                                  <button
                                    onClick={() => handleRemoveRow(rIdx)}
                                    title="Delete Row"
                                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-2 flex justify-start border-t border-slate-200">
                        <Button size="sm" variant="ghost" onClick={handleAddRow} className="text-xs text-orange-600 hover:bg-orange-50 gap-1 h-7">
                          <Plus className="w-3.5 h-3.5" />
                          {lang === 'hi' ? 'नई रो (Row) जोड़ें' : 'Add New Row'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[360px] border border-dashed border-orange-200 rounded-xl bg-orange-50/20 text-gray-400">
                      <Table className="w-12 h-12 text-orange-200 mb-2" />
                      <p className="text-xs">
                        {lang === 'hi' ? 'फोटो अपलोड करके "फोटो से टेक्स्ट निकालें" दबाएं...' : 'Upload photo and click extract...'}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};