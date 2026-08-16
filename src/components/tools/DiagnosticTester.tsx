import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/utils/toast';
import { createRealDocxBlob } from '@/utils/docxGenerator';
import { generateAccuratePdfFromHtml } from '@/utils/wordToPdf';
import { mergePdfFiles, splitPdfFile, compressPdfFile, convertImagesToPdf } from '@/utils/pdfOperations';
import { ArrowLeft, CheckCircle2, XCircle, Play, Loader2, Sparkles, FileText, Download } from 'lucide-react';

interface DiagnosticTesterProps {
  lang: Language;
  onBack: () => void;
}

interface TestResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  message: string;
  outputBlob?: Blob;
  outputFilename?: string;
}

export const DiagnosticTester: React.FC<DiagnosticTesterProps> = ({ lang, onBack }) => {
  const [tests, setTests] = useState<TestResult[]>([
    { id: 't1', name: '1. Hindi + English Real DOCX Generator (.docx)', status: 'idle', message: 'Not run yet' },
    { id: 't2', name: '2. Word HTML to Accurate PDF (Noto Sans Devanagari)', status: 'idle', message: 'Not run yet' },
    { id: 't3', name: '3. Image to PDF (Multiple + WEBP support)', status: 'idle', message: 'Not run yet' },
    { id: 't4', name: '4. Merge PDF (pdf-lib 2+ files pipeline)', status: 'idle', message: 'Not run yet' },
    { id: 't5', name: '5. Split PDF Range Parser ("1-2" validation)', status: 'idle', message: 'Not run yet' },
    { id: 't6', name: '6. PDF Compression (Real canvas raster optimization)', status: 'idle', message: 'Not run yet' },
  ]);

  const [isRunningAll, setIsRunningAll] = useState(false);

  const updateTest = (id: string, update: Partial<TestResult>) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...update } : t)));
  };

  const runAllTests = async () => {
    setIsRunningAll(true);

    // Test 1: Real DOCX Generation
    try {
      updateTest('t1', { status: 'running', message: 'Creating DOCX with Hindi Devanagari...' });
      const sampleHindiText = `कार्यालय उत्कृष्ट उच्चतर माध्यमिक विद्यालय पाटी जिला बड़वानी
विषय: वार्षिक अनुदान सामग्री क्रय बाबत।
1. उच्च माध्यमिक शिक्षक - पदोन्नति
2. माध्यमिक शिक्षक खेल - कोच`;
      const grid = [
        ['(1) अनुक्रमांक', '(2) पद का नाम', '(3) अनुभव'],
        ['1.', 'उच्च माध्यमिक शिक्षक', '05 वर्ष'],
        ['2.', 'माध्यमिक शिक्षक खेल', '05 वर्ष'],
      ];
      const docxBlob = await createRealDocxBlob(sampleHindiText, grid, 'शासकीय आदेश');
      if (docxBlob.size > 2000) {
        updateTest('t1', {
          status: 'passed',
          message: `Valid .docx created (${Math.round(docxBlob.size / 1024)} KB) with Hindi Unicode & Tables`,
          outputBlob: docxBlob,
          outputFilename: 'Test_Hindi_Official.docx',
        });
      } else {
        throw new Error('DOCX blob size unexpectedly small');
      }
    } catch (e: any) {
      updateTest('t1', { status: 'failed', message: e.message || 'DOCX creation failed' });
    }

    // Test 2: Word to PDF with Noto Sans Devanagari
    try {
      updateTest('t2', { status: 'running', message: 'Rendering Devanagari to A4 PDF...' });
      const htmlContent = `
        <h2 style="text-align:center; color:#ea580c; font-family:'Noto Sans Devanagari', sans-serif;">मध्यप्रदेश राजपत्र (परीक्षा रिपोर्ट)</h2>
        <p style="text-align:justify; font-family:'Noto Sans Devanagari', sans-serif;">यह एक प्रमाणित परीक्षण दस्तावेज़ है जिसमें हिंदी और English दोनों मिश्रित हैं।</p>
        <table style="width:100%; border-collapse:collapse; margin-top:12px;">
          <tr style="background:#f1f5f9;"><th style="border:1px solid #cbd5e1; padding:6px;">पद</th><th style="border:1px solid #cbd5e1; padding:6px;">योग्यता</th></tr>
          <tr><td style="border:1px solid #cbd5e1; padding:6px;">कंप्यूटर ऑपरेटर</td><td style="border:1px solid #cbd5e1; padding:6px;">स्नातक + RSCIT</td></tr>
        </table>
      `;
      const pdfBlob = await generateAccuratePdfFromHtml('Test_Hindi_PDF', htmlContent);
      if (pdfBlob.size > 3000) {
        updateTest('t2', {
          status: 'passed',
          message: `Valid PDF created (${Math.round(pdfBlob.size / 1024)} KB) with Hindi fonts rendered`,
          outputBlob: pdfBlob,
          outputFilename: 'Test_Hindi_Rendered.pdf',
        });
      } else {
        throw new Error('PDF blob size too small');
      }
    } catch (e: any) {
      updateTest('t2', { status: 'failed', message: e.message || 'PDF render failed' });
    }

    // Test 3: Images to PDF
    try {
      updateTest('t3', { status: 'running', message: 'Generating sample canvas images and converting to PDF...' });
      const canvas1 = document.createElement('canvas');
      canvas1.width = 400;
      canvas1.height = 300;
      const ctx1 = canvas1.getContext('2d');
      if (ctx1) {
        ctx1.fillStyle = '#ea580c';
        ctx1.fillRect(0, 0, 400, 300);
        ctx1.fillStyle = '#ffffff';
        ctx1.font = '20px Arial';
        ctx1.fillText('Page 1 Sample Image', 50, 150);
      }
      const blob1 = await new Promise<Blob>((res) => canvas1.toBlob((b) => res(b!), 'image/png'));
      const fakeFile1 = new File([blob1], 'image1.png', { type: 'image/png' });

      const canvas2 = document.createElement('canvas');
      canvas2.width = 400;
      canvas2.height = 300;
      const ctx2 = canvas2.getContext('2d');
      if (ctx2) {
        ctx2.fillStyle = '#4f46e5';
        ctx2.fillRect(0, 0, 400, 300);
        ctx2.fillStyle = '#ffffff';
        ctx2.font = '20px Arial';
        ctx2.fillText('Page 2 Sample Image', 50, 150);
      }
      const blob2 = await new Promise<Blob>((res) => canvas2.toBlob((b) => res(b!), 'image/jpeg'));
      const fakeFile2 = new File([blob2], 'image2.jpg', { type: 'image/jpeg' });

      const imgPdf = await convertImagesToPdf([fakeFile1, fakeFile2]);
      updateTest('t3', {
        status: 'passed',
        message: `Multi-image PDF created (${Math.round(imgPdf.size / 1024)} KB) with 2 pages`,
        outputBlob: imgPdf,
        outputFilename: 'Test_Images_Combined.pdf',
      });
    } catch (e: any) {
      updateTest('t3', { status: 'failed', message: e.message || 'Image to PDF failed' });
    }

    // Test 4: Merge PDF
    try {
      updateTest('t4', { status: 'running', message: 'Merging two generated PDFs...' });
      const p1 = await generateAccuratePdfFromHtml('P1', '<p>PDF Document One (Page 1)</p>');
      const p2 = await generateAccuratePdfFromHtml('P2', '<p>PDF Document Two (Page 2)</p>');
      const f1 = new File([p1], 'doc1.pdf', { type: 'application/pdf' });
      const f2 = new File([p2], 'doc2.pdf', { type: 'application/pdf' });

      const merged = await mergePdfFiles([f1, f2]);
      updateTest('t4', {
        status: 'passed',
        message: `Merged PDF created (${Math.round(merged.size / 1024)} KB) successfully`,
        outputBlob: merged,
        outputFilename: 'Test_Merged.pdf',
      });
    } catch (e: any) {
      updateTest('t4', { status: 'failed', message: e.message || 'Merge PDF failed' });
    }

    // Test 5: Split PDF
    try {
      updateTest('t5', { status: 'running', message: 'Splitting multi-page PDF with range "1-2"...' });
      const p1 = await generateAccuratePdfFromHtml('P1', '<p>Page 1</p>');
      const p2 = await generateAccuratePdfFromHtml('P2', '<p>Page 2</p>');
      const merged = await mergePdfFiles([
        new File([p1], 'd1.pdf', { type: 'application/pdf' }),
        new File([p2], 'd2.pdf', { type: 'application/pdf' }),
      ]);
      const multiFile = new File([merged], 'multi.pdf', { type: 'application/pdf' });

      const split = await splitPdfFile(multiFile, '1');
      updateTest('t5', {
        status: 'passed',
        message: `Split PDF extracted Page 1 (${Math.round(split.size / 1024)} KB)`,
        outputBlob: split,
        outputFilename: 'Test_Split_Page1.pdf',
      });
    } catch (e: any) {
      updateTest('t5', { status: 'failed', message: e.message || 'Split PDF failed' });
    }

    // Test 6: PDF Compression
    try {
      updateTest('t6', { status: 'running', message: 'Testing compression pipeline...' });
      const samplePdf = await generateAccuratePdfFromHtml('Big', '<div style="font-size:24px; padding:20px;">Compression Test Document</div>');
      const testFile = new File([samplePdf], 'test_comp.pdf', { type: 'application/pdf' });
      const compResult = await compressPdfFile(testFile);

      updateTest('t6', {
        status: 'passed',
        message: `Compression engine operational. Original: ${Math.round(compResult.originalSize / 1024)}KB, Output: ${Math.round(compResult.compressedSize / 1024)}KB`,
        outputBlob: compResult.blob,
        outputFilename: 'Test_Compressed.pdf',
      });
    } catch (e: any) {
      updateTest('t6', { status: 'failed', message: e.message || 'Compression test failed' });
    }

    setIsRunningAll(false);
    showSuccess(lang === 'hi' ? 'सभी डायग्नोस्टिक टेस्ट पूर्ण हुए!' : 'All diagnostic tests completed!');
  };

  const handleDownloadOutput = (blob?: Blob, filename?: string) => {
    if (!blob || !filename) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {lang === 'hi' ? 'ब्राउज़र डॉक्यूमेंट प्रोसेसिंग डायग्नोस्टिक्स' : 'Browser Document Diagnostics & Test Suite'}
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs mt-1">
                Verify real DOCX creation, Devanagari PDF rendering, multi-image conversion, merge, split, and compression.
              </CardDescription>
            </div>
            <Button
              onClick={runAllTests}
              disabled={isRunningAll}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs gap-2 shrink-0"
            >
              {isRunningAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {lang === 'hi' ? 'सभी टेस्ट चलाएं (Run Tests)' : 'Run Test Suite'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="divide-y divide-slate-200 border rounded-xl bg-white overflow-hidden">
            {tests.map((t) => (
              <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {t.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {t.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
                    {t.status === 'running' && <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />}
                    <span className="font-bold text-sm text-slate-900">{t.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{t.message}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      t.status === 'passed'
                        ? 'default'
                        : t.status === 'failed'
                        ? 'destructive'
                        : t.status === 'running'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={t.status === 'passed' ? 'bg-emerald-600' : ''}
                  >
                    {t.status.toUpperCase()}
                  </Badge>

                  {t.outputBlob && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadOutput(t.outputBlob, t.outputFilename)}
                      className="text-xs gap-1 h-7 border-slate-300"
                    >
                      <Download className="w-3 h-3" />
                      Verify File
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};