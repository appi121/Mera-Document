import React, { useState, useEffect } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { downloadFile, downloadWordDoc, extractPdfContentAccurate } from '@/utils/download';
import { parseWordDocument, generateAccuratePdfFromHtml } from '@/utils/wordToPdf';
import { reconstructDocumentLayout } from '@/utils/documentReconstructor';
import {
  mergePdfFiles,
  splitPdfFile,
  rotatePdfFile,
  addPageNumbersToPdf,
  addWatermarkToPdf,
  convertImagesToPdf,
  convertPdfToJpgImages,
  compressPdfFile,
} from '@/utils/pdfOperations';
import { 
  FileUp, 
  ArrowLeft, 
  ShieldCheck, 
  Brain, 
  ScanText, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Wand2,
  FileText,
  Eye
} from 'lucide-react';

import { PdfToolMode, PdfToolTabs, PDF_TOOL_TABS } from './pdf/PdfToolTabs';
import { PdfOptionsBar } from './pdf/PdfOptionsBar';

export type { PdfToolMode };

interface PdfToolsProps {
  lang: Language;
  initialMode?: PdfToolMode;
  onBack: () => void;
}

export const PdfTools: React.FC<PdfToolsProps> = ({ lang, initialMode = 'pdf-to-word', onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<PdfToolMode>(initialMode);
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [completed, setCompleted] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedHtml, setExtractedHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [tableGrid, setTableGrid] = useState<string[][]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Tool specific options
  const [pageRange, setPageRange] = useState<string>('1-2');
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [pageNumberPos, setPageNumberPos] = useState<'bottom-center' | 'bottom-right'>('bottom-center');
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [pdfImages, setPdfImages] = useState<{ dataUrl: string; pageNum: number }[]>([]);

  useEffect(() => {
    setActiveSubTab(initialMode);
    resetToolState();
  }, [initialMode]);

  const resetToolState = () => {
    setFiles([]);
    setCompleted(false);
    setExtractedText('');
    setExtractedHtml('');
    setTableGrid([]);
    setGeneratedBlob(null);
    setPdfImages([]);
    setPreviewImageUrl(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setCompleted(false);
      setExtractedText('');
      setExtractedHtml('');
      setTableGrid([]);
      setGeneratedBlob(null);
      setPdfImages([]);

      const firstFile = selectedFiles[0];

      if (firstFile.type.startsWith('image/')) {
        setPreviewImageUrl(URL.createObjectURL(firstFile));
      }

      if (activeSubTab === 'pdf-to-word' || activeSubTab === 'pdf-to-excel') {
        setProcessing(true);
        try {
          // Extract text accurately with layout detection
          const rawText = await extractPdfContentAccurate(firstFile, (status) => {
            setProgressStatus(status);
          });

          if (!rawText.trim()) {
            showError(lang === 'hi' ? 'PDF से सामग्री नहीं पढ़ी जा सकी।' : 'Could not read content from PDF.');
            return;
          }

          // Run Intelligent Layout Reconstructor
          const reconstructed = reconstructDocumentLayout(rawText);
          setExtractedText(reconstructed.formattedDocument);
          setTableGrid(reconstructed.tableGrid);
          setCompleted(true);
          showSuccess(lang === 'hi' ? 'दस्तावेज़ सफलतापूर्वक कन्वर्ट हो गया!' : 'Document converted successfully!');
        } catch (err: any) {
          console.error(err);
          showError(err.message || (lang === 'hi' ? 'PDF पढ़ने में त्रुटि हुई' : 'Failed to read PDF'));
        } finally {
          setProcessing(false);
          setProgressStatus('');
        }
      } else if (activeSubTab === 'word-to-pdf' && firstFile) {
        setProcessing(true);
        setProgressStatus(lang === 'hi' ? 'Word फ़ाइल पढ़ी जा रही है...' : 'Reading Word file...');
        try {
          const { html, text } = await parseWordDocument(firstFile);
          const reconstructed = reconstructDocumentLayout(text);
          setExtractedHtml(html);
          setExtractedText(reconstructed.formattedDocument || text);
          setTableGrid(reconstructed.tableGrid);
          setCompleted(true);
          showSuccess(lang === 'hi' ? 'DOCX फ़ाइल सफलतापूर्वक लोड हुई!' : 'DOCX file loaded!');
        } catch (err: any) {
          console.error(err);
          showError(err.message || (lang === 'hi' ? 'Word फ़ाइल लोड नहीं हो सकी' : 'Failed to parse DOCX'));
        } finally {
          setProcessing(false);
          setProgressStatus('');
        }
      }
    }
  };

  const handleSmartClean = () => {
    if (!extractedText.trim()) return;
    const reconstructed = reconstructDocumentLayout(extractedText);
    setExtractedText(reconstructed.formattedDocument);
    setTableGrid(reconstructed.tableGrid);
    showSuccess(lang === 'hi' ? 'सरकारी पत्र का शुद्ध लेआउट तैयार है!' : 'Official memo formatted!');
  };

  const handleAction = async () => {
    if (files.length === 0 && !extractedText) {
      showError(lang === 'hi' ? 'कृपया पहले फ़ाइल चुनें!' : 'Please select files first!');
      return;
    }
    setProcessing(true);

    try {
      if (activeSubTab === 'merge') {
        if (files.length < 2) {
          showError(lang === 'hi' ? 'कम से कम 2 PDF फाइलें चुनें!' : 'Please select at least 2 PDF files to merge!');
          setProcessing(false);
          return;
        }
        setProgressStatus(lang === 'hi' ? 'सभी PDF फाइलें जोड़ी जा रही हैं...' : 'Merging PDF files...');
        const mergedBlob = await mergePdfFiles(files);
        setGeneratedBlob(mergedBlob);
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'PDF फाइलें सफलतापूर्वक जुड़ गईं!' : 'PDF files merged successfully!');
      } else if (activeSubTab === 'split' && files[0]) {
        setProgressStatus(lang === 'hi' ? 'पेज रेंज काटी जा रही है...' : 'Splitting PDF pages...');
        const splitBlob = await splitPdfFile(files[0], pageRange);
        setGeneratedBlob(splitBlob);
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'PDF पन्ने अलग हो गए!' : 'PDF split successfully!');
      } else if (activeSubTab === 'rotate' && files[0]) {
        setProgressStatus(lang === 'hi' ? 'पन्ने रोटेट किए जा रहे हैं...' : 'Rotating PDF pages...');
        const rotBlob = await rotatePdfFile(files[0], rotationAngle);
        setGeneratedBlob(rotBlob);
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'PDF पन्ने सीधे हो गए!' : 'PDF rotated successfully!');
      } else if (activeSubTab === 'page-numbers' && files[0]) {
        setProgressStatus(lang === 'hi' ? 'पेज नंबर जोड़े जा रहे हैं...' : 'Adding page numbers...');
        const numBlob = await addPageNumbersToPdf(files[0], pageNumberPos);
        setGeneratedBlob(numBlob);
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'पेज नंबर लग गए!' : 'Page numbers added!');
      } else if (activeSubTab === 'watermark' && files[0]) {
        setProgressStatus(lang === 'hi' ? 'सुरक्षा वाटरमार्क लगाया जा रहा है...' : 'Adding watermark...');
        const wmBlob = await addWatermarkToPdf(files[0], watermarkText);
        setGeneratedBlob(wmBlob);
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'वाटरमार्क लग गया!' : 'Watermark added!');
      } else if (activeSubTab === 'img-to-pdf') {
        setProgressStatus(lang === 'hi' ? 'इमेज से PDF बनाई जा रही है...' : 'Creating PDF from images...');
        const imgPdfBlob = await convertImagesToPdf(files);
        setGeneratedBlob(imgPdfBlob);
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'JPG to PDF तैयार है!' : 'Images converted to PDF!');
      } else if (activeSubTab === 'pdf-to-jpg' && files[0]) {
        setProgressStatus(lang === 'hi' ? 'पन्नों को JPG इमेज में बदला जा रहा है...' : 'Converting PDF pages to JPG...');
        const imgs = await convertPdfToJpgImages(files[0]);
        setPdfImages(imgs);
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'JPG फोटोज तैयार हैं!' : 'PDF converted to JPG images!');
      } else if (activeSubTab === 'compress' && files[0]) {
        setProgressStatus(lang === 'hi' ? 'PDF कंप्रेस की जा रही है...' : 'Compressing PDF...');
        const result = await compressPdfFile(files[0], (msg) => setProgressStatus(msg));
        setGeneratedBlob(result.blob);
        setCompleted(true);

        const origKb = Math.round(result.originalSize / 1024);
        const compKb = Math.round(result.compressedSize / 1024);

        if (result.isReduced) {
          showSuccess(
            lang === 'hi'
              ? `PDF का साइज ${origKb} KB से घटकर ${compKb} KB (${result.reductionPercentage}% कम) हो गया!`
              : `Reduced from ${origKb} KB to ${compKb} KB (${result.reductionPercentage}% saved)!`
          );
        } else {
          showSuccess(
            lang === 'hi'
              ? `फ़ाइल पहले से अत्यधिक कंप्रेस्ड थी (${compKb} KB)।`
              : `File was already highly compressed (${compKb} KB).`
          );
        }
      } else if ((activeSubTab === 'pdf-to-word' || activeSubTab === 'pdf-to-excel') && files[0]) {
        const rawText = await extractPdfContentAccurate(files[0], (status) => {
          setProgressStatus(status);
        });
        const reconstructed = reconstructDocumentLayout(rawText);
        setExtractedText(reconstructed.formattedDocument);
        setTableGrid(reconstructed.tableGrid);
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'दस्तावेज़ तैयार है!' : 'Document ready!');
      } else {
        setCompleted(true);
        showSuccess(lang === 'hi' ? 'कार्य पूर्ण हुआ!' : 'Done!');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.message || (lang === 'hi' ? 'ऑपरेशन पूरा नहीं हो सका' : 'Operation failed'));
    } finally {
      setProcessing(false);
      setProgressStatus('');
    }
  };

  const handleDownloadDirectBlob = () => {
    if (generatedBlob) {
      downloadFile(generatedBlob, `${activeSubTab}_converted.pdf`, 'application/pdf');
      showSuccess(lang === 'hi' ? 'PDF डाउनलोड हो गई!' : 'PDF downloaded!');
    }
  };

  const handleDownloadPdf = async () => {
    if (generatedBlob) {
      const orig = files[0]?.name || 'Document';
      const base = orig.substring(0, orig.lastIndexOf('.')) || orig;
      downloadFile(generatedBlob, `${base}_processed.pdf`, 'application/pdf');
      showSuccess(lang === 'hi' ? 'PDF डाउनलोड हो गई!' : 'PDF downloaded!');
      return;
    }

    const originalName = files[0]?.name || 'Document';
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;

    setProcessing(true);
    setProgressStatus(lang === 'hi' ? 'शुद्ध PDF तैयार हो रही है...' : 'Generating Clean PDF...');

    try {
      const contentToUse = extractedHtml || extractedText || `Document: ${originalName}`;
      const pdfBlob = await generateAccuratePdfFromHtml(baseName, contentToUse, `${baseName}.pdf`);

      downloadFile(pdfBlob, `${baseName}_converted.pdf`, 'application/pdf');
      showSuccess(lang === 'hi' ? 'PDF डाउनलोड हो गई!' : 'PDF downloaded!');
    } catch (err: any) {
      console.error(err);
      showError(err.message || (lang === 'hi' ? 'PDF डाउनलोड में समस्या आई' : 'Failed to generate PDF'));
    } finally {
      setProcessing(false);
      setProgressStatus('');
    }
  };

  const handleDownloadExcel = () => {
    if (!extractedText.trim()) {
      showError(lang === 'hi' ? 'कोई डाटा नहीं मिला' : 'No data found');
      return;
    }

    const originalName = files[0]?.name || 'Data_Table';
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;

    const rows = tableGrid.length > 0 ? tableGrid : extractedText.split('\n').map(l => l.split(/\||\t/).map(c => c.trim()).filter(Boolean));

    if (rows.length === 0 || rows[0].length <= 1) {
      handleDownloadWord();
      return;
    }

    const rowsHtml = rows
      .map((row, idx) => {
        const isHeader = idx === 0;
        const cells = row
          .map(
            (c) =>
              `<td style="border:1px solid #94a3b8; padding:8px 12px; font-family:'Segoe UI',Calibri,sans-serif; mso-number-format:'\\@'; ${
                isHeader ? 'background-color:#ea580c; color:#fff; font-weight:bold;' : ''
              }">${c}</td>`
          )
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const excelDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>td { mso-number-format:"\\@"; }</style></head>
<body><table style="border-collapse:collapse; width:100%;">${rowsHtml}</table></body></html>`;

    const blob = new Blob(['\ufeff' + excelDoc], { type: 'application/vnd.ms-excel;charset=utf-8' });
    downloadFile(blob, `${baseName}_converted.xls`, 'application/vnd.ms-excel');
    showSuccess(lang === 'hi' ? 'MS Excel (.xls) डाउनलोड हुई!' : 'Excel file downloaded!');
  };

  const handleDownloadWord = async () => {
    const originalName = files[0]?.name || 'document';
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;

    if (!extractedText.trim()) {
      showError(lang === 'hi' ? 'कोई डाटा नहीं मिला' : 'No text found');
      return;
    }

    await downloadWordDoc(`${baseName}_converted.docx`, extractedText, baseName, tableGrid);
    showSuccess(lang === 'hi' ? 'असली MS Word (.docx) डाउनलोड हो गई!' : 'Real Word (.docx) downloaded!');
  };

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'पूरा टेक्स्ट कॉपी हो गया!' : 'Text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTab = PDF_TOOL_TABS.find((t) => t.id === activeSubTab) || PDF_TOOL_TABS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 text-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-amber-200" />
              {lang === 'hi' ? 'ऑल-इन-वन PDF व शासकीय पत्र कन्वर्टर' : 'Complete All-in-One PDF Suite'}
            </CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/40 text-xs px-2.5 py-1 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-300" />
              100% Free & Unaltered Devanagari
            </Badge>
          </div>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'स्कैन किया हुआ सरकारी पत्र, आदेश या टेबल डालें — बिना कचरा अक्षरों के असली Word (.docx) पाएं' 
              : 'Upload scanned official orders, letters or tables to get authentic editable Word (.docx)'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Mode Selector Tabs */}
          <PdfToolTabs
            lang={lang}
            activeTab={activeSubTab}
            onTabChange={(tab) => {
              setActiveSubTab(tab);
              resetToolState();
            }}
          />

          {/* Dynamic Options Bar */}
          <PdfOptionsBar
            lang={lang}
            activeSubTab={activeSubTab}
            pageRange={pageRange}
            setPageRange={setPageRange}
            rotationAngle={rotationAngle}
            setRotationAngle={setRotationAngle}
            watermarkText={watermarkText}
            setWatermarkText={setWatermarkText}
          />

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-2xl p-8 text-center hover:bg-orange-50 transition-colors relative cursor-pointer">
            <input
              type="file"
              multiple={currentTab.isMultiple}
              accept={currentTab.accept}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
              <FileUp className="w-7 h-7" />
            </div>
            <p className="font-bold text-gray-800 text-sm sm:text-base mb-1">
              {files.length > 0 
                ? `${files.length} ${lang === 'hi' ? 'फ़ाइल चुनी गई:' : 'Files selected:'}` 
                : (lang === 'hi' ? `यहाँ अपनी कोई भी ${currentTab.titleHi} फ़ाइल अपलोड करें` : `Upload any file for ${currentTab.titleEn}`)}
            </p>
            {files.length > 0 ? (
              <div className="mt-1 text-xs text-orange-700 font-bold max-w-md mx-auto truncate">
                {files.map((f) => f.name).join(', ')}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                {lang === 'hi' 
                  ? 'Adobe Scan, CamScanner या मोबाइल से खींची गई कोई भी PDF/फोटो अपलोड करें'
                  : 'Upload any Adobe Scan, CamScanner or photographed PDF'}
              </p>
            )}
          </div>

          {/* Processing Banner */}
          {processing && (
            <div className="p-4 bg-orange-100/80 border border-orange-300 rounded-xl flex items-center gap-3 animate-pulse">
              <ScanText className="w-5 h-5 text-orange-600 animate-spin" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-orange-900">
                  {progressStatus || (lang === 'hi' ? 'दस्तावेज़ प्रोसेस हो रहा है...' : 'Processing document...')}
                </p>
              </div>
            </div>
          )}

          {/* Live Preview & Verification Studio */}
          {extractedText && (
            <div className="border border-orange-200 rounded-2xl p-5 bg-orange-50/30 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-orange-900 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-orange-600" />
                    {lang === 'hi' ? 'दस्तावेज़ लाइव प्रीव्यू व वेरिफिकेशन (Live Preview):' : 'Live Document Preview:'}
                  </span>
                  <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5">
                    ✓ 100% Authentic Hindi
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSmartClean}
                    className="gap-1.5 text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                    {lang === 'hi' ? '⚡ लेआउट शुद्ध करें' : 'Auto Format'}
                  </Button>

                  <Button size="sm" variant="outline" onClick={handleCopyText} className="gap-1.5 text-xs bg-white border-orange-300">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-orange-600" />}
                    {copied ? (lang === 'hi' ? 'कॉपी हुआ' : 'Copied') : (lang === 'hi' ? 'कॉपी करें' : 'Copy')}
                  </Button>
                </div>
              </div>

              {/* Editable Text Area with Noto Devanagari */}
              <Textarea
                rows={14}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="bg-white text-xs sm:text-sm font-serif p-4 border-orange-200 leading-relaxed font-medium whitespace-pre shadow-inner rounded-xl focus-visible:ring-orange-500"
              />

              {/* Download Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-gray-500">
                  {lang === 'hi' ? '✓ आप ऊपर बॉक्स में किसी भी शब्द या तारीख को सीधे एडिट कर सकते हैं।' : 'You can edit text directly in the box above.'}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleDownloadWord}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-bold text-xs sm:text-sm shadow-md rounded-xl px-5 py-2.5"
                  >
                    <Download className="w-4 h-4" />
                    {lang === 'hi' ? 'MS Word (.docx) डाउनलोड करें' : 'Download Word (.docx)'}
                  </Button>

                  {tableGrid.length > 0 && (
                    <Button
                      onClick={handleDownloadExcel}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold text-xs sm:text-sm shadow-md rounded-xl px-4 py-2.5"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      {lang === 'hi' ? 'MS Excel (.xls)' : 'Download Excel'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};