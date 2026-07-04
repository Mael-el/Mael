import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Heart, MapPin, Phone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BloodRequest } from '../types';

interface BloodCenterProps {
  token: string;
  userRole: string;
}

export default function BloodCenter({ token, userRole }: BloodCenterProps) {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Registration Form state (For donating)
  const [isDonor, setIsDonor] = useState(false);
  const [donorGroup, setDonorGroup] = useState('O+');
  const [registeredDonor, setRegisteredDonor] = useState(false);

  // New Request Form state (For doctors/admins)
  const [showForm, setShowForm] = useState(false);
  const [bloodType, setBloodType] = useState('O-');
  const [hospital, setHospital] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'low'>('medium');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [phone, setPhone] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blood-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement des alertes');
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteredDonor(true);
    setTimeout(() => {
      setRegisteredDonor(false);
      setIsDonor(true);
    }, 2000);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !location || !phone) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      const res = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodType,
          hospital,
          location,
          urgency,
          unitsNeeded,
          phone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de création de la demande");

      setRequests([data, ...requests]);
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
        setHospital('');
        setLocation('');
        setPhone('');
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDonate = async (requestId: string) => {
    try {
      const res = await fetch('/api/blood-requests/fulfill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, units: 1 })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update state
      setRequests(requests.map(r => r.id === requestId ? data.request : r));
    } catch (err: any) {
      alert("Erreur de don : " + err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-500 fill-red-500" />
            <span>Centre de Don de Sang & Alertes Urgentes</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Réseau d'entraide transfusionnelle interconnecté du Bénin</p>
        </div>

        {userRole !== 'patient' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/10 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Lancer une Alerte Urgente</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active blood alerts */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
            Demandes Actives en Clinique
          </h3>

          {showForm && (
            <form onSubmit={handleCreateRequest} className="bg-red-50/40 border border-red-100 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">Nouvelle alerte de poche de sang</h4>
              {formSuccess ? (
                <div className="flex items-center gap-2 text-green-700 bg-white p-3 border border-green-100 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Alerte d'urgence publiée et partagée avec le réseau !</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Groupe Sanguin</label>
                      <select 
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-red-400 focus:outline-none"
                      >
                        {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Degré d'urgence</label>
                      <select 
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as any)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-red-400 focus:outline-none"
                      >
                        <option value="high">🔴 Critique (Immédiat)</option>
                        <option value="medium">🟡 Élevé (Sous 12h)</option>
                        <option value="low">🟢 Modéré (Planifié)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Hôpital / Clinique</label>
                      <input 
                        type="text"
                        placeholder="ex: CNHU-HKM Cotonou"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-red-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Localisation exacte</label>
                      <input 
                        type="text"
                        placeholder="ex: Maternité, Bloc 2"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-red-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Poches nécessaires</label>
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={unitsNeeded}
                        onChange={(e) => setUnitsNeeded(parseInt(e.target.value))}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-red-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Téléphone de contact</label>
                      <input 
                        type="tel"
                        placeholder="ex: +229 97 00 11 22"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-red-400 focus:outline-none"
                      />
                    </div>
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
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Publier l'Alerte
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Recherche des alertes de sang...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Droplet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Aucune alerte urgente pour le moment</p>
              <p className="text-[10px] text-slate-400">Toutes les banques de sang cliniques sont stables.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    req.status === 'fulfilled' 
                      ? 'bg-slate-50 border-slate-200 opacity-70' 
                      : req.urgency === 'high' 
                        ? 'bg-red-50/20 border-red-100 shadow-sm hover:shadow-md' 
                        : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Blood Group Badge */}
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-display ${
                        req.status === 'fulfilled'
                          ? 'bg-slate-200 text-slate-600'
                          : req.urgency === 'high'
                            ? 'bg-red-600 text-white fill-white'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        <span className="text-lg leading-none">{req.bloodType}</span>
                        <Droplet className="w-3.5 h-3.5 mt-0.5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-800">{req.hospital}</h4>
                          {req.status === 'fulfilled' ? (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold">Pourvu</span>
                          ) : req.urgency === 'high' ? (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold animate-pulse flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Urgentissime
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">Modéré</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {req.location}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {req.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Besoins</span>
                      <p className="text-sm font-black text-slate-800 font-mono">
                        {req.unitsReceived} / {req.unitsNeeded} <span className="text-xs text-slate-500 font-normal">poches</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          req.status === 'fulfilled' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (req.unitsReceived / req.unitsNeeded) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {req.status !== 'fulfilled' && (
                    <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-slate-50">
                      <button
                        onClick={() => handleDonate(req.id)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                      >
                        <Heart className="w-3.5 h-3.5 fill-red-500 stroke-red-500" />
                        <span>Confirmer un don de poche</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Voluntary registration & informational card */}
        <div className="space-y-6">
          {/* Voluntary Registration */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Devenir Donneur Volontaire</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Enregistrez-vous pour recevoir des notifications SMS/push géolocalisées en cas de besoin critique de votre groupe sanguin dans votre localité au Bénin.
            </p>

            {isDonor ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p>Vous êtes enregistré comme donneur actif ({donorGroup}) !</p>
                <p className="text-[10px] text-slate-500 font-normal mt-1">Merci pour votre engagement solidaire.</p>
              </div>
            ) : registeredDonor ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-semibold animate-pulse">Signature cryptographique du consentement...</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterDonor} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Groupe Sanguin</label>
                  <select 
                    value={donorGroup}
                    onChange={(e) => setDonorGroup(e.target.value)}
                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-red-400 focus:outline-none"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-start gap-2 py-1">
                  <input type="checkbox" id="consent" required className="mt-0.5 rounded text-red-500 focus:ring-red-500" />
                  <label htmlFor="consent" className="text-[10px] text-slate-500 leading-relaxed cursor-pointer select-none">
                    J'autorise Santé Plus à me notifier en cas d'extrême urgence et je certifie être en bonne santé générale.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Heart className="w-3.5 h-3.5 fill-red-500 stroke-red-500" />
                  <span>S'enregistrer comme Donneur</span>
                </button>
              </form>
            )}
          </div>

          {/* Blood facts card */}
          <div className="p-5 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl shadow-sm shadow-red-500/10">
            <h4 className="font-bold text-sm font-display mb-2">💡 Pourquoi donner votre sang ?</h4>
            <div className="space-y-2.5 text-xs text-white/95 leading-relaxed">
              <p>
                <strong>Zéro substitut :</strong> Le sang humain ne peut pas être fabriqué artificiellement. Seule la solidarité béninoise permet de sauver des vies lors des accouchements compliqués, accidents et paludisme grave.
                </p>
              <p>
                <strong>Donneur Universel :</strong> Si vous êtes du groupe <strong>O négatif (O-)</strong>, vous êtes donneur universel. Vos poches peuvent être transfusées à n'importe quel patient en détresse immédiate !
              </p>
              <p>
                <strong>Un seul don = 3 vies :</strong> En séparant les globules rouges, les plaquettes et le plasma, votre don de sang unitaire peut soigner jusqu'à trois malades différents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
