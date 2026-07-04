import React, { useState } from 'react';
import { Copy, QrCode, ShieldCheck, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export default function QRModal({ isOpen, onClose, patientId, patientName }: QRModalProps) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(patientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100"
        >
          {/* Sante Plus Logo Accent bar */}
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-display">Carte Santé Numérique</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="text-center my-4">
              <h4 className="text-base font-bold text-slate-900">{patientName}</h4>
              <p className="text-xs text-slate-500">Bénéficiaire Santé Plus Bénin</p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              {/* Custom simulated QR code */}
              <svg className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-200 shadow-sm" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                {/* Corners */}
                <rect x="5" y="5" width="22" height="22" fill="#047857" />
                <rect x="9" y="9" width="14" height="14" fill="#ffffff" />
                <rect x="11" y="11" width="10" height="10" fill="#047857" />

                <rect x="73" y="5" width="22" height="22" fill="#047857" />
                <rect x="77" y="9" width="14" height="14" fill="#ffffff" />
                <rect x="79" y="11" width="10" height="10" fill="#047857" />

                <rect x="5" y="73" width="22" height="22" fill="#047857" />
                <rect x="9" y="77" width="14" height="14" fill="#ffffff" />
                <rect x="11" y="79" width="10" height="10" fill="#047857" />
                
                {/* Random blocks simulation */}
                <rect x="32" y="10" width="10" height="4" fill="#0f172a" />
                <rect x="50" y="5" width="5" height="15" fill="#0f172a" />
                <rect x="60" y="18" width="8" height="8" fill="#0f172a" />
                <rect x="15" y="35" width="5" height="15" fill="#0f172a" />
                
                <rect x="35" y="35" width="30" height="30" fill="#047857" />
                <rect x="40" y="40" width="20" height="20" fill="#ffffff" />
                <rect x="45" y="45" width="10" height="10" fill="#047857" />

                <rect x="75" y="40" width="15" height="5" fill="#0f172a" />
                <rect x="40" y="75" width="15" height="15" fill="#0f172a" />
                <rect x="80" y="80" width="15" height="15" fill="#047857" />
                <rect x="68" y="68" width="8" height="8" fill="#0f172a" />
                <rect x="5" y="40" width="15" height="5" fill="#0f172a" />
              </svg>

              <div className="flex gap-2 items-center mt-4 p-1.5 px-3 bg-white border border-slate-200 rounded-lg max-w-full">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID unique :</span>
                <span className="text-xs text-slate-700 font-mono select-all font-semibold truncate max-w-[120px]">{patientId}</span>
                <button 
                  onClick={copyId}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Copier l'identifiant"
                >
                  {copied ? (
                    <span className="text-[9px] font-bold text-emerald-500">Copié</span>
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2.5 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Confidentialité garantie :</strong> Aucun dossier médical n'est lisible directement depuis ce QR Code. Les données restent cryptées (AES-256) au repos.
                </p>
              </div>

              <div className="flex gap-2.5 p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
                <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Consentement requis :</strong> Le médecin devra scanner votre code et vous demander votre <strong>code PIN à 4 chiffres</strong> pour déverrouiller et décrypter l'accès temporaire.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
