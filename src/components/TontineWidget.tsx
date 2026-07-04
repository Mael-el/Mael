import React, { useState, useEffect } from 'react';
import { Users, Coins, TrendingUp, UserPlus, CheckCircle, Plus, Sparkles, Zap, Receipt } from 'lucide-react';
import { Tontine } from '../types';
import LightningModal from './LightningModal';

interface TontineWidgetProps {
  token: string;
  patientId: string;
  patientName: string;
}

export default function TontineWidget({ token, patientId, patientName }: TontineWidgetProps) {
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Tontine Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState(500000);
  const [newContrib, setNewContrib] = useState(5000);
  const [formSuccess, setFormSuccess] = useState(false);

  // Checkout / Invoice states
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTontineId, setSelectedTontineId] = useState<string | null>(null);

  const fetchTontines = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tontines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de chargement');
      setTontines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTontines();
  }, [token]);

  const handleJoin = async (tontineId: string) => {
    try {
      const res = await fetch('/api/tontines/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tontineId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec de l\'adhésion');

      setTontines(tontines.map(t => t.id === tontineId ? data.tontine : t));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleContributeTrigger = async (tontineId: string, amount: number) => {
    try {
      setSelectedTontineId(tontineId);
      const res = await fetch('/api/tontines/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tontineId, amount })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // We got a Lightning invoice
      setActiveInvoice({
        invoice: data.invoice,
        paymentHash: data.paymentHash,
        satoshis: data.amount * 2, // 1 FCFA = 2 sats
        amountFcfa: data.amount,
        description: `Cotisation Tontine - ${patientName}`
      });
      setShowCheckout(true);
    } catch (err: any) {
      alert("Erreur de cotisation : " + err.message);
    }
  };

  const handlePaymentSuccess = () => {
    // Payment verified on server, reload tontines from DB
    fetchTontines();
  };

  const handleCreateTontine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDesc) return;

    try {
      const res = await fetch('/api/tontines/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          targetAmount: newTarget,
          contributionAmount: newContrib
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de création");

      setTontines([...tontines, data]);
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setShowCreateForm(false);
        setNewName('');
        setNewDesc('');
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-500" />
            <span>Tontines de Santé Solidaires</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Fonds de micro-assurance communautaires gérés par Lightning Network</p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une tontine</span>
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateTontine} className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 mb-6 space-y-3">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Initier un cercle de solidarité médicale</span>
          </h4>
          
          {formSuccess ? (
            <div className="p-3 bg-white border border-green-100 rounded-lg text-xs font-semibold text-green-700 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cercle créé avec succès ! Prêt pour accueillir des membres.</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Nom de la tontine</label>
                  <input 
                    type="text" 
                    placeholder="ex: Solidarité Mères de Ouidah"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Description / But clinique</label>
                  <input 
                    type="text" 
                    placeholder="ex: Provisionner les accouchements et pédiatrie d'urgence"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Montant cible (FCFA)</label>
                  <input 
                    type="number" 
                    step="50000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseInt(e.target.value))}
                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Cotisation mensuelle (FCFA)</label>
                  <input 
                    type="number" 
                    step="500"
                    value={newContrib}
                    onChange={(e) => setNewContrib(parseInt(e.target.value))}
                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none font-mono"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Périodicité</label>
                  <select disabled className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-xs cursor-not-allowed">
                    <option>Mensuelle (30 Jours)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Ouvrir la tontine
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Synchronisation des tontines de santé...</p>
        </div>
      ) : tontines.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Aucun groupe de solidarité créé</p>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="text-[10px] text-emerald-600 font-bold underline mt-1"
          >
            Lancer la première tontine de santé béninoise
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tontines.map((t) => {
            const isMember = t.members.some(m => m.patientId === patientId);
            const progress = (t.currentAmount / t.targetAmount) * 100;

            return (
              <div key={t.id} className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-800">{t.name}</h3>
                    {isMember ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                        Membre actif
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleJoin(t.id)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        Rejoindre
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{t.description}</p>

                  {/* Financial Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-white p-3 border border-slate-100 rounded-xl mb-4 font-mono text-center">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Trésor tontine</span>
                      <span className="text-xs font-bold text-emerald-600">{t.currentAmount.toLocaleString()} F</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Mensualité</span>
                      <span className="text-xs font-bold text-slate-700">{t.contributionAmount.toLocaleString()} F</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Membres</span>
                      <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-0.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        {t.members.length}
                      </span>
                    </div>
                  </div>

                  {/* Funding progress */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Cible : {t.targetAmount.toLocaleString()} FCFA</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex -space-x-1 overflow-hidden">
                    {t.members.slice(0, 3).map((m, idx) => (
                      <div 
                        key={idx}
                        className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[8px] flex items-center justify-center border border-white uppercase"
                        title={m.name}
                      >
                        {m.name.charAt(0)}
                      </div>
                    ))}
                    {t.members.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-bold text-[8px] flex items-center justify-center border border-white">
                        +{t.members.length - 3}
                      </div>
                    )}
                  </div>

                  {isMember && (
                    <button
                      onClick={() => handleContributeTrigger(t.id, t.contributionAmount)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-sm"
                    >
                      <Zap className="w-3 h-3 fill-white" />
                      Cotiser
                    </button>
                  )}
                </div>

                {/* Contribution History sub-panel */}
                {isMember && t.contributions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100/80">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                      <Receipt className="w-3 h-3" />
                      Journal des flux (Lightning)
                    </span>
                    <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                      {t.contributions.map((c) => (
                        <div key={c.id} className="flex justify-between items-center text-[10px] p-1 bg-white border border-slate-50 rounded">
                          <span className="text-slate-600 font-medium truncate max-w-[100px]">{c.patientName}</span>
                          <span className="font-mono text-emerald-600 font-semibold">+{c.amount.toLocaleString()} FCFA</span>
                          <span className="text-slate-400 text-[8px]">{new Date(c.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightning Checkout popup rendering inside */}
      {showCheckout && activeInvoice && (
        <LightningModal 
          isOpen={showCheckout}
          onClose={() => {
            setShowCheckout(false);
            setActiveInvoice(null);
          }}
          invoice={activeInvoice}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
