import React, { useState, useEffect } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/utils/toast';
import { downloadFile, downloadWordDoc, extractPdfContentAccurate } from '@/utils/download';
import { parseWordDocument, generateAccuratePdfFromHtml } from '@/utils/wordToPdf';
import { processDocumentIntelligently } from '@/utils/aiDocumentEngine';
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
import { FileUp, ArrowLeft, ShieldCheck, Brain, ScanText, CheckCircle2 } from 'lucide-react';

import { PdfToolMode, PdfToolTabs, PDF_TOOL_TABS } from './pdf/PdfToolTabs';
import { PdfOptionsBar } from './pdf/PdfOptionsBar';
import { PdfPreviewSection } from './pdf/PdfPreviewSection';
import { PdfActionBar } from './pdf/PdfActionBar';

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
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [tableGrid, setTableGrid] = useState<string[][]>([]);

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
    setIsAiOptimized(false);
    setGeneratedBlob(null);
    setPdfImages([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setCompleted(false);
      setExtractedText('');
      setExtractedHtml('');
      setTableGrid([]);
      setIsAiOptimized(false);
      setGeneratedBlob(null);
      setPdfImages([]);

      const firstFile = selectedFiles[0];

      if (activeSubTab === 'pdf-to-word' || activeSubTab === 'pdf-to-excel') {
        setProcessing(true);
        try {
          // Dynamically parse ANY uploaded PDF without template restrictions
          const rawText = await extractPdfContentAccurate(firstFile, (status) => {
            setProgressStatus(status);
          });

          if (!rawText.trim()) {
            showError(lang === 'hi' ? 'PDF से सामग्री नहीं पढ़ी जा सकी।' : 'Could not read content from PDF.');
            return;
          }

          const smartResult = processDocumentIntelligently(rawText, firstFile.name);
          setExtractedText(smartResult.formattedText);
          setTableGrid(smartResult.gridMatrix || []);
          setIsAiOptimized(true);
          setCompleted(true);
          showSuccess(lang === 'hi' ? 'दस्तावेज़ सफलतापूर्वक लोड व कन्वर्ट हो गया!' : 'Document converted successfully!');
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
          const smartResult = processDocumentIntelligently(text, firstFile.name);
          setExtractedHtml(html);
          setExtractedText(smartResult.formattedText || text || firstFile.name);
          setTableGrid(smartResult.gridMatrix || []);
          setIsAiOptimized(true);
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
        const smartResult = processDocumentIntelligently(rawText, files[0].name);
        setExtractedText(smartResult.formattedText);
        setTableGrid(smartResult.gridMatrix || []);
        setIsAiOptimized(true);
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

    const smart = processDocumentIntelligently(extractedText, originalName);
    const rows = tableGrid.length > 0 ? tableGrid : smart.gridMatrix;

    if (rows.length === 0) {
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

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-amber-200" />
              {lang === 'hi' ? 'ऑल-इन-वन PDF सुइट (Universal File Converter)' : 'Complete All-in-One PDF Suite'}
            </CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/40 text-xs px-2.5 py-1 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-300" />
              100% Free & Unaltered Content
            </Badge>
          </div>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi' 
              ? 'किसी भी नए दस्तावेज़ को अपलोड करें — बिना भाषा या टेक्स्ट बदले असली Word (.docx) व Excel में बदलें' 
              : 'Upload any document — converts to real Word (.docx) & Excel without changing language or content'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Universal Notice */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2.5 text-emerald-900 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === 'hi'
                ? 'यूनिवर्सल इंजन सक्रिय: कोई भी नई PDF, Word या इमेज फाइल डालें, टेक्स्ट व फॉर्मेट 100% सुरक्षित रहेगा।'
                : 'Universal Engine Active: Upload any PDF, Word or Image file with 100% content preservation.'}
            </span>
          </div>

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
                  ? (currentTab.isMultiple ? 'एक या एक से अधिक PDF/इमेज फाइलें चुनें' : 'कोई भी PDF, Word, Excel या इमेज फ़ाइल चुनें')
                  : 'Select any PDF, Word, Excel or image files'}
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

          {/* Live Preview Section */}
          <PdfPreviewSection
            lang={lang}
            extractedText={extractedText}
            setExtractedText={setExtractedText}
            tableGrid={tableGrid}
            isAiOptimized={isAiOptimized}
            copied={copied}
            onCopyText={handleCopyText}
            pdfImages={pdfImages}
          />

          {/* Action & Download Bar */}
          <PdfActionBar
            lang={lang}
            activeSubTab={activeSubTab}
            toolTitle={lang === 'hi' ? currentTab.titleHi : currentTab.titleEn}
            filesLength={files.length}
            hasExtractedText={!!extractedText}
            processing={processing}
            completed={completed}
            hasGeneratedBlob={!!generatedBlob}
            onExecute={handleAction}
            onDownloadDirectBlob={handleDownloadDirectBlob}
            onDownloadPdf={handleDownloadPdf}
            onDownloadExcel={handleDownloadExcel}
            onDownloadWord={handleDownloadWord}
          />
        </CardContent>
      </Card>
    </div>
  );
};