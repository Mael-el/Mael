import React, { useState, useEffect } from 'react';
import { CheckCircle2, Copy, AlertCircle, Zap, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LightningModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    invoice: string;
    paymentHash: string;
    satoshis: number;
    amountFcfa: number;
    description: string;
  };
  onPaymentSuccess: () => void;
}

export default function LightningModal({ isOpen, onClose, invoice, onPaymentSuccess }: LightningModalProps) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'paying' | 'success'>('waiting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('waiting');
      setError(null);
    }
  }, [isOpen]);

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice.invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulatePayment = async () => {
    setStatus('paying');
    setError(null);
    
    try {
      const response = await fetch('/api/lightning/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentHash: invoice.paymentHash })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Échec du paiement Lightning');
      }

      setStatus('success');
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setStatus('waiting');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100"
        >
          {/* Lightning Header Accent */}
          <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                  <Zap className="w-5 h-5 fill-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-display">Paiement Lightning Network</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-center my-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Montant à régler</span>
              <div className="flex justify-center items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {invoice.satoshis.toLocaleString()}
                </span>
                <span className="text-amber-500 font-bold text-sm">sats</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                ≈ {invoice.amountFcfa.toLocaleString()} FCFA
              </p>
              <div className="mt-3 px-3 py-1 bg-slate-50 inline-block rounded-full text-xs text-slate-600 border border-slate-100">
                {invoice.description}
              </div>
            </div>

            {/* Simulated Lightning QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              {status === 'paying' ? (
                <div className="flex flex-col items-center justify-center h-48 py-8">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-medium text-slate-700 animate-pulse">Règlement en cours via canal d'état...</p>
                  <p className="text-xs text-slate-400 mt-1">Négociation des HTLCs sans frais</p>
                </div>
              ) : status === 'success' ? (
                <div className="flex flex-col items-center justify-center h-48 py-8 text-green-500">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="w-16 h-16 mb-4 stroke-2" />
                  </motion.div>
                  <p className="text-base font-bold text-slate-800">Paiement Confirmé !</p>
                  <p className="text-xs text-slate-500 mt-1">Facture acquittée instantanément</p>
                </div>
              ) : (
                <>
                  {/* Custom SVG QR Code visualizer */}
                  <svg className="w-40 h-40 bg-white p-2 rounded-lg border border-slate-200" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corners */}
                    <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                    <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                    <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                    <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                    <rect x="13" y="78" width="9" height="9" fill="#0f172a" />
                    
                    {/* Random squares simulation */}
                    <rect x="35" y="15" width="10" height="5" fill="#0f172a" />
                    <rect x="50" y="8" width="5" height="15" fill="#0f172a" />
                    <rect x="60" y="20" width="8" height="8" fill="#0f172a" />
                    <rect x="15" y="40" width="5" height="20" fill="#0f172a" />
                    <rect x="38" y="38" width="24" height="24" fill="#0f172a" />
                    <rect x="44" y="44" width="12" height="12" fill="#ffffff" />
                    <rect x="48" y="48" width="4" height="4" fill="#0f172a" />
                    <rect x="75" y="45" width="15" height="8" fill="#0f172a" />
                    <rect x="40" y="75" width="18" height="18" fill="#0f172a" />
                    <rect x="80" y="80" width="15" height="15" fill="#0f172a" />
                    
                    {/* Lightning Bolt Symbol in the Middle */}
                    <polygon points="46,40 58,48 50,50 56,60 44,52 50,50" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  </svg>
                  <p className="text-xs text-slate-400 mt-2 font-mono text-center truncate max-w-xs">
                    Scannez avec Phoenix, Muun ou tout wallet LN
                  </p>
                </>
              )}
            </div>

            {status === 'waiting' && (
              <div className="space-y-4">
                {/* Bolt11 Invoice string */}
                <div className="flex gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-xs text-slate-500 font-mono select-all truncate flex-1 leading-relaxed">
                    {invoice.invoice}
                  </span>
                  <button 
                    onClick={copyInvoice}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-white border border-transparent hover:border-slate-100 transition-all flex-shrink-0"
                    title="Copier la facture"
                  >
                    {copied ? (
                      <span className="text-[10px] font-bold text-green-500 px-1">Copié !</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Simulated Payment Action */}
                <button
                  onClick={simulatePayment}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Simuler le Paiement (Testnet)</span>
                </button>
                
                <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-100 flex gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mode démo actif :</strong> aucun frais réel. Cliquez sur le bouton ci-dessus pour simuler la réception de l'événement de règlement par le réseau Lightning en quelques millisecondes.
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
