import React, { useState } from 'react';
import { Language } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Calculator, Copy, Check, Receipt, Download, Sparkles } from 'lucide-react';

interface GstBillCalculatorProps {
  lang: Language;
  onBack: () => void;
}

export const GstBillCalculator: React.FC<GstBillCalculatorProps> = ({ lang, onBack }) => {
  const [amount, setAmount] = useState<number>(1000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [calcType, setCalcType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [shopName, setShopName] = useState<string>('डिजिटल सेवा केंद्र / Cyber Cafe');
  const [customerName, setCustomerName] = useState<string>('रमेश कुमार');
  const [copied, setCopied] = useState(false);

  // Calculations
  let gstAmount = 0;
  let baseAmount = 0;
  let totalAmount = 0;

  if (calcType === 'exclusive') {
    baseAmount = amount;
    gstAmount = (amount * gstRate) / 100;
    totalAmount = baseAmount + gstAmount;
  } else {
    totalAmount = amount;
    baseAmount = (amount * 100) / (100 + gstRate);
    gstAmount = totalAmount - baseAmount;
  }

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const handleCopyReceipt = () => {
    const receiptText = `======================================
${shopName} - बिल रसीद
======================================
ग्राहक का नाम: ${customerName}
दिनांक: ${new Date().toLocaleDateString('hi-IN')}

मूल राशि (Base Amount): ₹${baseAmount.toFixed(2)}
GST दर (${gstRate}%): ₹${gstAmount.toFixed(2)}
  • CGST (${gstRate / 2}%): ₹${cgst.toFixed(2)}
  • SGST (${gstRate / 2}%): ₹${sgst.toFixed(2)}
--------------------------------------
कुल देय राशि (Total Bill): ₹${totalAmount.toFixed(2)}
======================================
धन्यवाद! फिर पधारें।`;

    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    showSuccess(lang === 'hi' ? 'बिल रसीद कॉपी हो गई!' : 'Receipt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        {lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
      </Button>

      <Card className="border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            🧾 {lang === 'hi' ? 'GST बिल कैलकुलेटर व रसीद मेकर' : 'GST Bill Calculator & Receipt Generator'}
          </CardTitle>
          <CardDescription className="text-orange-100 text-sm">
            {lang === 'hi'
              ? 'साइबर कैफे, दुकान व सर्विस हेतु 5%, 12%, 18%, 28% GST बिल जोड़ें तथा कस्टमर रसीद बनाएं'
              : 'Calculate 5%, 12%, 18%, 28% GST with CGST/SGST split and generate instant text receipt'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '1. राशि दर्ज करें (Amount in ₹):' : '1. Enter Amount (₹):'}
                </Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="border-orange-200 text-lg font-bold text-orange-900"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-1">
                  {lang === 'hi' ? '2. GST गणना प्रकार:' : '2. GST Calculation Type:'}
                </Label>
                <Select value={calcType} onValueChange={(val: 'exclusive' | 'inclusive') => setCalcType(val)}>
                  <SelectTrigger className="w-full border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclusive">➕ GST अलग से जोड़ें (Exclusive GST)</SelectItem>
                    <SelectItem value="inclusive">➖ राशि में GST शामिल है (Inclusive GST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700 block mb-2">
                  {lang === 'hi' ? '3. GST दर का प्रतिशत चुनें:' : '3. Select GST Percentage:'}
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 12, 18, 28].map((rate) => (
                    <Button
                      key={rate}
                      type="button"
                      variant={gstRate === rate ? 'default' : 'outline'}
                      onClick={() => setGstRate(rate)}
                      className={gstRate === rate ? 'bg-orange-600 text-white font-bold' : 'border-gray-300 text-gray-700'}
                    >
                      {rate}%
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'दुकान/सेंटर का नाम:' : 'Shop/Center Name:'}
                  </Label>
                  <Input value={shopName} onChange={(e) => setShopName(e.target.value)} className="text-xs" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'ग्राहक का नाम:' : 'Customer Name:'}
                  </Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="text-xs" />
                </div>
              </div>
            </div>

            {/* Live Calculation Receipt */}
            <div className="border border-orange-200 rounded-2xl p-5 bg-orange-50/40 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-orange-200 pb-3 mb-3">
                  <span className="font-bold text-orange-900 text-sm flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-orange-600" />
                    {lang === 'hi' ? 'GST बिल ब्रेकअप:' : 'GST Bill Breakdown:'}
                  </span>
                  <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
                    {gstRate}% GST
                  </span>
                </div>

                <div className="space-y-2 text-xs font-medium text-gray-700">
                  <div className="flex justify-between">
                    <span>{lang === 'hi' ? 'मूल राशि (Net Amount):' : 'Net Amount:'}</span>
                    <span className="font-bold text-gray-900">₹{baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-800">
                    <span>CGST ({gstRate / 2}%):</span>
                    <span className="font-bold">₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-800">
                    <span>SGST ({gstRate / 2}%):</span>
                    <span className="font-bold">₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-semibold pt-1 border-t border-orange-200/60">
                    <span>{lang === 'hi' ? 'कुल टैक्स राशि (Total GST):' : 'Total GST Tax:'}</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-emerald-700 pt-2 border-t border-orange-300">
                    <span>{lang === 'hi' ? 'कुल देय राशि (Total Bill):' : 'Total Payable:'}</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCopyReceipt}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl gap-2 mt-4"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? (lang === 'hi' ? 'रसीद कॉपी हो गई' : 'Receipt Copied') : (lang === 'hi' ? 'व्हाट्सएप रसीद कॉपी करें' : 'Copy WhatsApp Bill Receipt')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};