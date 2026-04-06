
import React, { useState, useMemo } from 'react';
import { X, Globe, CreditCard, ShieldCheck, Zap, Star, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: (tier: string) => void;
}

const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", 
  "Central African Republic", "Chad", "Comoros", "Congo", "Côte d'Ivoire", "Djibouti", "Egypt", 
  "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", 
  "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", 
  "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", 
  "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", 
  "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
];

const ALL_COUNTRIES = [
  ...AFRICAN_COUNTRIES,
  "United States", "United Kingdom", "Canada", "Germany", "France", "Japan", "Australia", 
  "Brazil", "India", "China", "Singapore", "United Arab Emirates", "Saudi Arabia", "Mexico"
].sort();

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSuccess }) => {
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [selectedTier, setSelectedTier] = useState<'Standard' | 'Pro' | 'Enterprise'>('Pro');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAfrican = useMemo(() => AFRICAN_COUNTRIES.includes(selectedCountry), [selectedCountry]);

  const tiers = [
    { id: 'Standard', name: 'Standard Pack', price: 19, slots: '+50 Slots', icon: Zap },
    { id: 'Pro', name: 'Creator Pro', price: 49, slots: '+200 Slots', icon: Star, popular: true },
    { id: 'Enterprise', name: 'Studio Unlimited', price: 199, slots: 'Unlimited', icon: ShieldCheck }
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(selectedTier);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 border border-white/20 flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
        
        {/* Left Section: Pricing Info */}
        <div className="md:w-1/2 p-10 bg-indigo-50/30 border-r border-indigo-50">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-indigo-950 tracking-tight mb-2">Buy Production Options</h2>
            <p className="text-gray-500 font-medium">Scale your studio with high-performance production slots.</p>
          </div>

          <div className="space-y-4">
            {tiers.map(tier => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id as any)}
                className={`w-full p-6 rounded-3xl border-2 text-left transition-all relative ${
                  selectedTier === tier.id 
                    ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' 
                    : 'border-transparent bg-white/50 hover:bg-white hover:border-indigo-200'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Best Value
                  </span>
                )}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${selectedTier === tier.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-400'}`}>
                      <tier.icon className="w-5 h-5" />
                    </div>
                    <span className="font-black text-indigo-950">{tier.name}</span>
                  </div>
                  <span className="text-xl font-black text-indigo-950">${tier.price}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400 ml-11">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {tier.slots}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Section: Payment Details */}
        <div className="md:w-1/2 p-10 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Secure Checkout</span>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Select Country</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-indigo-950 focus:outline-none focus:border-indigo-600 appearance-none transition-all"
                >
                  {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex flex-col items-center text-center space-y-4">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Supported via</div>
              {isAfrican ? (
                <div className="flex flex-col items-center animate-in zoom-in-95">
                  <div className="text-2xl font-black text-indigo-950 tracking-tighter mb-1">Paystack</div>
                  <div className="text-[10px] font-bold text-gray-400">Localized African Payments</div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Paystack_Logo.png" alt="Paystack" className="h-6 mt-4 grayscale opacity-50" />
                </div>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in-95">
                  <div className="text-2xl font-black text-indigo-950 tracking-tighter mb-1">Stripe</div>
                  <div className="text-[10px] font-bold text-gray-400">Global Infrastructure for Commerce</div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6 mt-4 grayscale opacity-50" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
            >
              {isProcessing ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Verifying...</>
              ) : (
                <>Pay Now <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest px-8 leading-relaxed">
              By completing this purchase, you agree to our Terms of Production and Data Sovereignty policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export default PaymentModal;
