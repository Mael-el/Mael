import React, { useState } from 'react';
import { 
  Sparkles, 
  Palette, 
  Type, 
  Layers, 
  Box, 
  Code, 
  Copy, 
  Check, 
  Download, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  Laptop, 
  Smartphone, 
  FileText, 
  CheckCircle2,
  Heart,
  Calendar,
  Lock,
  Activity,
  User,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StyleGuideProps {
  onClose: () => void;
  textZoom: number;
}

export default function StyleGuide({ onClose, textZoom }: StyleGuideProps) {
  const [activeSubTab, setActiveSubTab] = useState<'system' | 'maquettes' | 'demo' | 'deliverables'>('system');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const colors = [
    { name: 'Vert Santé Plus', hex: '#00D26A', desc: 'Couleur principale, représente la vitalité et la santé moderne.' },
    { name: 'Ardoise Profonde', hex: '#0F172A', desc: 'Couleur de texte primaire et de contrastes profonds.' },
    { name: 'Blanc Pur', hex: '#FFFFFF', desc: 'Base de toutes les cartes, sections et espaces vides.' },
    { name: 'Gris Fond Système', hex: '#F2F2F7', desc: 'Arrière-plan neutre doux reposant pour les yeux.' },
    { name: 'Gris Secondaire', hex: '#8E8E93', desc: 'Texte d\'accompagnement et bordures légères.' },
    { name: 'Gris Ligne', hex: '#E2E8F0', desc: 'Bordures et délimitations fines.' },
    { name: 'Émeraude Doux', hex: '#10B981', desc: 'Alertes positives et validations cryptographiques.' }
  ];

  const typography = [
    { usage: 'Titres Principaux (Sora)', font: 'font-display font-black text-3xl tracking-tight text-[#0F172A]', sample: 'La santé à l\'ère du numérique.' },
    { usage: 'Sous-titres de Sections (Sora)', font: 'font-display font-bold text-xl tracking-tight text-[#0F172A]', sample: 'Votre carnet de santé portable certifié' },
    { usage: 'Boutons & Actions (Inter)', font: 'font-sans font-bold text-xs uppercase tracking-wider', sample: 'CONFIRMER LE RÈGLEMENT' },
    { usage: 'Corps de texte (Inter)', font: 'font-sans font-medium text-slate-600 text-sm leading-relaxed', sample: 'Les données médicales sont déchiffrées localement à l\'aide de votre clé privée.' },
    { usage: 'Données & Sécurité (JetBrains Mono)', font: 'font-mono text-xs text-slate-500', sample: '03a11b84920... OP_RETURN timestamp' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden my-4"
    >
      {/* Upper header */}
      <div className="bg-slate-900 text-white px-6 py-8 relative">
        <div className="absolute top-0 right-0 h-full w-2 flex">
          <div className="bg-[#008751] w-full" />
          <div className="bg-[#FCD116] w-full" />
          <div className="bg-[#E8112D] w-full" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#00D26A] text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">UX DESIGN KIT</span>
              <span className="text-xs text-slate-400 font-medium">Spécifications Santé Plus Bénin</span>
            </div>
            <h1 className="text-3xl font-black font-display tracking-tight text-white">Guide de Style & Directives de Design</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
              Écosystème d'interface haut de gamme épuré de tout élément d'aspect artificiel. Uniquement de la précision typographique, des contrastes forts, et des micro-interactions soignées.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#00D26A] hover:bg-emerald-600 text-slate-950 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md shadow-emerald-500/10"
          >
            Retour à l'application
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-2 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab('system')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'system'
              ? 'bg-white text-[#0F172A] shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4 inline-block mr-1.5 text-[#00D26A]" />
          Charte & Composants
        </button>
        <button
          onClick={() => setActiveSubTab('maquettes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'maquettes'
              ? 'bg-white text-[#0F172A] shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Laptop className="w-4 h-4 inline-block mr-1.5 text-[#00D26A]" />
          Maquettes Interactives
        </button>
        <button
          onClick={() => setActiveSubTab('demo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'demo'
              ? 'bg-white text-[#0F172A] shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 inline-block mr-1.5 text-[#00D26A]" />
          Page de Démonstration
        </button>
        <button
          onClick={() => setActiveSubTab('deliverables')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'deliverables'
              ? 'bg-white text-[#0F172A] shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-1.5 text-[#00D26A]" />
          Guide pour Développeurs
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 lg:p-8">
        <AnPresenceWrapper>
          
          {/* TAB 1: SYSTEM & COMPONENTS */}
          {activeSubTab === 'system' && (
            <motion.div 
              key="system"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Introduction */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Palette de Couleurs Officielles & Authentiques</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cliquez sur n'importe quel échantillon pour copier instantanément sa valeur hexadécimale dans votre presse-papiers.
                </p>
              </div>

              {/* Grid Colors */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {colors.map((color) => (
                  <div 
                    key={color.hex}
                    onClick={() => copyToClipboard(color.hex)}
                    className="group bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-md transition-all cursor-pointer relative"
                  >
                    <div 
                      className="h-16 rounded-xl mb-3 shadow-inner border border-black/5" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="text-[11px] font-black text-slate-800 truncate">{color.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">{color.hex}</span>
                      <span className="text-[8px] bg-slate-200 text-slate-600 px-1 rounded uppercase font-black group-hover:bg-[#00D26A] group-hover:text-slate-950 transition-all">
                        {copiedValue === color.hex ? 'Copié !' : 'Copier'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Typography Scale */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Typographie & Paire de Polices</h3>
                <p className="text-xs text-slate-500">
                  Nous utilisons <strong>Sora</strong> pour injecter une autorité institutionnelle d'Afrique de l'Ouest, <strong>Inter</strong> pour garantir une lisibilité fluide en toute taille de texte, et <strong>JetBrains Mono</strong> pour les hachages de sécurité et données chiffrées de consultations.
                </p>

                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-6">
                  {typography.map((t, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-200/40 last:pb-0 last:border-b-0">
                      <div>
                        <span className="text-[10px] font-black text-[#00D26A] uppercase tracking-widest">{t.usage}</span>
                        <p className="font-mono text-[9px] text-slate-400 mt-1 truncate">{t.font}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className={t.font}>{t.sample}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Components Guidelines */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Composants UX Premium & Micro-interactions</h3>
                <p className="text-xs text-slate-500">
                  Exemples de composants interactifs respectant notre directive : aucune icône d'aspect générique ou "sticker" IA. Design épuré, angles adoucis et animations de survol fluides.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Bouton Principal & Secondaire</span>
                    
                    <div className="flex flex-wrap gap-3">
                      <button className="px-5 py-2.5 bg-[#00D26A] hover:bg-emerald-600 text-slate-950 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm hover:translate-y-[-1px]">
                        Bouton Action
                      </button>
                      <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">
                        Bouton Retour
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-2">
                      Micro-interaction : Transition CSS douce de 200ms sur la couleur d'arrière-plan et translate-y léger au survol.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Champ de Formulaire Interactif</span>
                    
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Code National d'Identité (NPI)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 100120264021" 
                        defaultValue="100120264021"
                        className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#00D26A] outline-none rounded-xl transition-all font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-2">
                      Micro-interaction : Bordure passant au vert vibrant et arrière-plan s'éclaircissant lors du focus.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE FIGMA-STYLE MOCKUPS */}
          {activeSubTab === 'maquettes' && (
            <motion.div 
              key="maquettes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="prose max-w-none">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Prototype Interactif Haute-Fidélité</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Voici les maquettes fonctionnelles et interactives conçues pour simuler un espace de travail médical épuré et ultra-fluide.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Card Mockup 1 */}
                <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-md">
                  <div className="bg-slate-950 p-4 text-white flex items-center justify-between border-b border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00D26A]">MAQUETTE 1: MON CARNET NUMÉRIQUE</span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">FIGMA ID: S1-01</span>
                  </div>
                  
                  <div className="p-6 space-y-6 bg-slate-50/50">
                    {/* Simulated card design */}
                    <div className="bg-gradient-to-br from-emerald-900 to-slate-950 rounded-2xl p-6 text-white relative shadow-sm border border-emerald-800/40">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#00D26A]" />
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">RÉPUBLIQUE DU BÉNIN</span>
                        </div>
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-black font-mono">ASSURÉ PRO</span>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-lg font-black tracking-tight font-display">Aurelle Gnonlonfoun</p>
                        <div className="grid grid-cols-2 gap-2 text-left">
                          <div>
                            <span className="block text-[8px] text-white/50 uppercase tracking-widest">Identifiant Unique</span>
                            <span className="font-mono text-xs font-bold text-[#00D26A]">SP-2026-9051</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-white/50 uppercase tracking-widest">NPI National</span>
                            <span className="font-mono text-xs font-bold text-slate-300">102839201930</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 text-left">
                      <div className="flex items-center gap-2 text-[#00D26A]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-black uppercase text-slate-800">Dossier Certifié Intègre</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ancré cryptographiquement sur la blockchain Bitcoin. Aucun "sticker" ou logo non authentique n'altère la pureté visuelle du certificat officiel.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Card Mockup 2 */}
                <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-md">
                  <div className="bg-slate-950 p-4 text-white flex items-center justify-between border-b border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00D26A]">MAQUETTE 2: ACTE DE PAIEMENT</span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">FIGMA ID: S1-02</span>
                  </div>
                  
                  <div className="p-6 space-y-6 bg-slate-50/50">
                    {/* Simulated payment box */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 shadow-sm text-left">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">FACTURE</span>
                          <span className="text-xs font-mono font-bold text-slate-700">FAC-2026-0704</span>
                        </div>
                        <span className="text-[9px] bg-[#00D26A]/20 text-emerald-800 font-black px-2 py-1 rounded-full uppercase">Payé par Lightning</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <p><strong>Bénéficiaire :</strong> Dr. Chantal Houngbo</p>
                        <p><strong>Acte Médical :</strong> Consultation de Gynécologie</p>
                        <p><strong>Montant Réglé :</strong> 15 000 FCFA (30 000 satoshis)</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 text-center bg-slate-50 p-3 rounded-xl">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">HASH DE PREUVE</span>
                        <span className="font-mono text-[9px] text-slate-500 break-all">f1a5b82e90de123fa38...</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2 text-left">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Sauvegarde Multi-Réseau</p>
                      <p className="text-[11px] text-slate-500">
                        Interconnexion avec le réseau d'électricité de soins, la tontine financière, et les preuves de bloc de transaction Bitcoin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: DEMONSTRATION PAGE (ACCUEIL) */}
          {activeSubTab === 'demo' && (
            <motion.div 
              key="demo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Premium Hero Section */}
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden p-8 lg:p-12 relative shadow-md">
                <div className="absolute top-0 right-0 w-4 h-full flex flex-col">
                  <div className="bg-[#008751] h-1/3 w-full" />
                  <div className="bg-[#FCD116] h-1/3 w-full" />
                  <div className="bg-[#E8112D] h-1/3 w-full" />
                </div>

                <div className="max-w-2xl text-left space-y-6">
                  <span className="inline-block bg-[#00D26A]/10 text-emerald-800 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
                    RÉSERVE NATIONALE DU BÉNIN • SANTÉ PRO
                  </span>
                  
                  <h2 className="text-3xl lg:text-4xl font-black font-display text-slate-900 tracking-tight leading-tight">
                    L'infrastructure de santé la plus sécurisée de l'Afrique de l'Ouest.
                  </h2>
                  
                  <p className="text-xs lg:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
                    Santé Plus interconnecte les dossiers cliniques de manière entièrement cryptée et décentralisée. Vos actes de consultation sont ancrés sur la blockchain et remboursés instantanément par les tontines intelligentes.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button className="px-6 py-3 bg-[#00D26A] hover:bg-emerald-600 text-slate-950 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10">
                      Démarrer mon Dossier
                    </button>
                    <button className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 transition-all cursor-pointer">
                      En savoir plus
                    </button>
                  </div>
                </div>
              </div>

              {/* Three Column Value Prop - Zero Emojis or Stickers, Pure Clean Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="w-10 h-10 bg-[#00D26A]/10 text-emerald-800 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#00D26A]" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Cryptographie de Bout en Bout</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Les dossiers médicaux sont protégés localement avec un code d'authentification PIN. Aucun intermédiaire ne peut accéder à vos données physiologiques sans votre consentement exprès.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="w-10 h-10 bg-[#00D26A]/10 text-emerald-800 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#00D26A]" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Zéro Délai de Règlement</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Grâce au protocole Lightning Network, les cliniques reçoivent le remboursement de leurs actes médicaux instantanément. Fini les longues attentes de validation manuelle d'assurances.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="w-10 h-10 bg-[#00D26A]/10 text-emerald-800 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#00D26A]" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Preuve d'Intégrité Blockchain</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Chaque dossier clinique est doté d'une empreinte SHA-256 scellée sur Bitcoin. Cette signature garantit l'impossibilité de modifier ou falsifier rétroactivement l'historique de vos constantes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DELIVERABLES & DESIGN RULES */}
          {activeSubTab === 'deliverables' && (
            <motion.div 
              key="deliverables"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              <div className="prose max-w-none">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Règles de Design pour l'Équipe de Développement</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ce document tient lieu de guide officiel d'intégration pour assurer la cohérence visuelle et l'intégrité de la marque lors des prochains développements de Santé Plus.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-6 text-xs text-slate-700">
                <div className="space-y-2">
                  <p className="font-black uppercase tracking-wide text-slate-800">1. Règles Relatives aux Icônes & "Stickers"</p>
                  <p className="text-slate-600 leading-relaxed">
                    Il est strictement interdit d'utiliser des émojis de couleur dans le corps des interfaces cliniques ou des icônes génériques multicolores à aspect "cartoon". Toutes les icônes doivent être importées de la librairie <strong>lucide-react</strong> en format contour (stroke-width: 2 ou 2.5), de couleur neutre (ardoise) ou accentuée (vert émeraude).
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-black uppercase tracking-wide text-slate-800">2. Palette de Couleurs & Contraste</p>
                  <p className="text-slate-600 leading-relaxed">
                    Utiliser le blanc pur (#FFFFFF) pour les éléments d'interface surélevés (cartes, boutons principaux), et le vert émeraude (#00D26A) uniquement pour les accents significatifs, le statut actif, et la validation de sécurité. Le texte principal doit être en ardoise foncée (#0F172A) pour garantir un ratio de contraste d'au moins 4.5:1, conforme aux directives d'accessibilité WCAG AA.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-black uppercase tracking-wide text-slate-800">3. Grille Visuelle & Espacement "Respirant"</p>
                  <p className="text-slate-600 leading-relaxed">
                    Toutes les marges et rembourrages (paddings) internes des conteneurs doivent respecter des multiples de 4px (p-4, p-6, p-8, p-12). Les cartes d'informations physiologiques doivent utiliser un rayon de bordure généreux de 24px (rounded-3xl) pour adoucir le parcours utilisateur.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-black uppercase tracking-wide text-slate-800">4. Accessibilité Numérique</p>
                  <p className="text-slate-600 leading-relaxed">
                    Maintenir le sélecteur d'accessibilité en tête de page permettant de modifier instantanément l'échelle typographique de l'application à 50%, 70%, 100%, 125%, 150%, ou 170% pour garantir l'inclusion des personnes malvoyantes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnPresenceWrapper>
      </div>
    </motion.div>
  );
}

// Simple internal wrapper to ensure AnimatePresence animations function reliably
function AnPresenceWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="transition-all duration-300">
      {children}
    </div>
  );
}
