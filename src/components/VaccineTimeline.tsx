import React, { useState, useEffect } from 'react';
import { Syringe, CheckCircle2, Plus, Calendar, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { Vaccination } from '../types';

interface VaccineTimelineProps {
  token: string;
}

export default function VaccineTimeline({ token }: VaccineTimelineProps) {
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Vaccine Form State
  const [showForm, setShowForm] = useState(false);
  const [vaccineName, setVaccineName] = useState('Fièvre Jaune (Stamaril)');
  const [doseNumber, setDoseNumber] = useState(1);
  const [hospital, setHospital] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [nextDoseDate, setNextDoseDate] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Expanded Blockchain Details State
  const [selectedTx, setSelectedTx] = useState<{ vaccine: string; txId: string; date: string } | null>(null);

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vaccinations/patient', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement');
      setVaccines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !batchNumber) {
      alert("Veuillez remplir l'établissement et le numéro de lot");
      return;
    }

    try {
      const res = await fetch('/api/vaccinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vaccineName,
          doseNumber,
          hospital,
          batchNumber,
          nextDoseDate: nextDoseDate || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVaccines([...vaccines, data]);
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
        setHospital('');
        setBatchNumber('');
        setNextDoseDate('');
      }, 2000);
    } catch (err: any) {
      alert("Erreur d'ajout : " + err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Syringe className="w-5 h-5 text-emerald-500" />
            <span>Carnet de Vaccination Numérique</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Passeport immunologique horodaté et certifié on-chain</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un vaccin</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vaccine timeline */}
        <div className="lg:col-span-2 space-y-4">
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Déclarer un vaccin administré</h4>
              
              {formSuccess ? (
                <div className="p-3 bg-white border border-green-100 rounded-lg text-xs font-semibold text-green-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500 animate-bounce" />
                  <span>Vaccin enregistré et ancré sur la blockchain Sante Plus !</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Vaccin / Protection</label>
                      <select 
                        value={vaccineName}
                        onChange={(e) => setVaccineName(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option>Fièvre Jaune (Stamaril)</option>
                        <option>Hépatite B (Engerix-B)</option>
                        <option>Méningite (Menactra)</option>
                        <option>Tétanos (Vat)</option>
                        <option>Pneumocoque (Prevenar 13)</option>
                        <option>Fièvre Typhoïde (Typhim Vi)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Numéro de dose</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="5"
                        value={doseNumber}
                        onChange={(e) => setDoseNumber(parseInt(e.target.value))}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Centre hospitalier d'administration</label>
                      <input 
                        type="text" 
                        placeholder="ex: Clinique Mahouna Cotonou"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        required
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Numéro de Lot du vaccin</label>
                      <input 
                        type="text" 
                        placeholder="ex: LT-4029-YF"
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        required
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Rappel de Dose (Facultatif)</label>
                    <input 
                      type="date" 
                      value={nextDoseDate}
                      onChange={(e) => setNextDoseDate(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-2 justify-end mt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Certifier le vaccin
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Lecture de votre carnet de vaccination...</p>
            </div>
          ) : vaccines.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Syringe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Aucun vaccin répertorié</p>
              <button 
                onClick={() => setShowForm(true)}
                className="text-[10px] text-emerald-600 font-bold underline mt-1"
              >
                Ajouter mon premier certificat de vaccin
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-6 py-2">
              {vaccines.map((v) => (
                <div key={v.id} className="relative">
                  {/* Timeline Dot Indicator */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white stroke-[3px]" />
                  </div>

                  <div className="bg-white p-4 border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{v.vaccineName}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(v.dateAdministered).toLocaleDateString()}
                          </span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">
                            Dose : {v.doseNumber}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 font-medium">
                            Lot : {v.batchNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 font-medium">
                          Etabli par : <span className="text-slate-700">{v.hospital}</span>
                        </p>
                      </div>

                      {v.blockchainVerified && v.txId && (
                        <button
                          onClick={() => setSelectedTx({ vaccine: v.vaccineName, txId: v.txId!, date: v.dateAdministered })}
                          className="flex items-center gap-1 py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-bold rounded-lg text-[9px] border border-emerald-100 transition-all flex-shrink-0"
                          title="Vérifier l'authenticité sur la blockchain"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Vérifié On-chain</span>
                        </button>
                      )}
                    </div>

                    {v.nextDoseDate && (
                      <div className="mt-3 p-2 bg-amber-50/50 rounded-lg text-[10px] text-amber-800 border border-amber-100 inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Rappel obligatoire planifié le : <strong>{new Date(v.nextDoseDate).toLocaleDateString()}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Timeline vaccine cards & details */}
        <div className="space-y-6">
          {/* Expanded Blockchain Anchor Information panel */}
          {selectedTx ? (
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 font-mono text-[11px] leading-relaxed relative">
              <button 
                onClick={() => setSelectedTx(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1 font-display">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Preuve de Signature Blockchain</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Actant</span>
                  <span className="text-slate-200">{selectedTx.vaccine}</span>
                </div>

                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Date de Signature</span>
                  <span className="text-slate-200">{new Date(selectedTx.date).toLocaleString()}</span>
                </div>

                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Algorithme d'Horodatage</span>
                  <span className="text-emerald-400">SHA-256 + Bitcoin OP_RETURN</span>
                </div>

                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Identifiant Transaction (TXID)</span>
                  <span className="text-slate-300 break-all select-all">{selectedTx.txId}</span>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping mt-1 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400">
                    Certificat signé de façon permanente. Impossible à falsifier ou à altérer rétroactivement par un tiers.
                  </span>
                </div>

                <a 
                  href={`https://blockstream.info/testnet/tx/${selectedTx.txId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all border border-slate-700"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Consulter sur Blockstream Testnet</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                Protection & Rappels
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Le carnet Santé Plus vous aide à ne rater aucun rappel critique d'immunisation. Les vaccins comme la Fièvre Jaune ou la Méningite sont obligatoires pour certains voyages internationaux en Afrique de l'Ouest.
              </p>
              
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500 flex-shrink-0">
                    <Syringe className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Fièvre Jaune</h5>
                    <p className="text-[10px] text-slate-400">Dose unique valable à vie</p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 flex-shrink-0">
                    <Syringe className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Hépatite B</h5>
                    <p className="text-[10px] text-slate-400">3 doses requises pour immunité</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
