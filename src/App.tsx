import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  User, 
  ShieldCheck, 
  Zap, 
  QrCode, 
  Activity, 
  LogOut, 
  Plus, 
  ClipboardList, 
  Syringe, 
  Coins, 
  Droplet, 
  Sparkles, 
  Fingerprint,
  Users,
  Search,
  MapPin,
  Lock,
  ChevronRight,
  Shield,
  HelpCircle,
  FileCheck2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Check,
  Calendar,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import StyleGuide from './components/StyleGuide';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { 
  User as UserType, 
  PatientDossier, 
  Consultation, 
  AdminStats 
} from './types';
import QRModal from './components/QRModal';
import LightningModal from './components/LightningModal';
import VaccineTimeline from './components/VaccineTimeline';
import TontineWidget from './components/TontineWidget';
import BloodCenter from './components/BloodCenter';
import AppointmentBooking, { HOSPITALS_DATA, HospitalInfo } from './components/AppointmentBooking';

export default function App() {
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('sp_token'));
  const [user, setUser] = useState<UserType | null>(
    localStorage.getItem('sp_user') ? JSON.parse(localStorage.getItem('sp_user')!) : null
  );

  // Accessibility text-scaling state (50%, 70%, 100%, 125%, 150%, 170%)
  const [textZoom, setTextZoom] = useState<number>(() => {
    const saved = localStorage.getItem('sp_text_zoom');
    return saved ? parseInt(saved, 10) : 100;
  });

  useEffect(() => {
    localStorage.setItem('sp_text_zoom', textZoom.toString());
    document.documentElement.style.fontSize = `${textZoom}%`;
  }, [textZoom]);

  const isLargeText = textZoom > 100;
  
  // Login/Register Form toggle
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'patient' | 'doctor'>('patient');
  const [hospitalName, setHospitalName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Patient Dashboard tab selection
  const [activeTab, setActiveTab] = useState<'dossier' | 'vaccines' | 'tontines' | 'blood' | 'appointments'>('dossier');
  const [activeChartMetric, setActiveChartMetric] = useState<'tension' | 'temp' | 'pouls'>('tension');
  const [showStyleGuide, setShowStyleGuide] = useState<boolean>(false);

  // Interactive Clinical Metrics dataset
  const healthMetricsData = [
    { date: '10 Jan', tension_systolique: 120, tension_diastolique: 80, temperature: 36.8, pouls: 72 },
    { date: '12 Fév', tension_systolique: 124, tension_diastolique: 82, temperature: 37.0, pouls: 74 },
    { date: '15 Mar', tension_systolique: 138, tension_diastolique: 89, temperature: 38.6, pouls: 88 },
    { date: '10 Mai', tension_systolique: 122, tension_diastolique: 79, temperature: 36.5, pouls: 71 },
    { date: '04 Juil', tension_systolique: 118, tension_diastolique: 76, temperature: 36.7, pouls: 68 }
  ];

  // Patient Dossier & Consultations state
  const [patientDossier, setPatientDossier] = useState<PatientDossier | null>(null);
  const [patientConsultations, setPatientConsultations] = useState<Consultation[]>([]);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorSuccess, setAnchorSuccess] = useState(false);

  // Patient PIN updates
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Modals state
  const [showQR, setShowQR] = useState(false);
  const [showBillingInvoice, setShowBillingInvoice] = useState(false);
  const [activeBillingInvoice, setActiveBillingInvoice] = useState<any>(null);

  // Doctor Dashboard state
  const [searchPatientId, setSearchPatientId] = useState('u_patient1'); // Default seeded patient for simple demo
  const [consentPin, setConsentPin] = useState('1234'); // Default PIN for patient1
  const [unlockedPatient, setUnlockedPatient] = useState<any>(null);
  const [lockSecondsLeft, setLockSecondsLeft] = useState<number | null>(null);
  const [doctorConsultations, setDoctorConsultations] = useState<Consultation[]>([]);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);

  // Welcome page locations search & interactive maps
  const [welcomeSearch, setWelcomeSearch] = useState('');
  const [welcomeFocusedHospital, setWelcomeFocusedHospital] = useState<HospitalInfo | null>(HOSPITALS_DATA[0]);
  const [welcomeMapMessage, setWelcomeMapMessage] = useState('📍 Cliquez sur une clinique ci-dessous ou sur la carte pour afficher sa localisation GPS et ses spécialités.');

  // Doctor consultation billing form
  const [consultDiagnosis, setConsultDiagnosis] = useState('');
  const [consultTreatment, setConsultTreatment] = useState('');
  const [consultPrice, setConsultPrice] = useState(5000);
  const [consultAdding, setConsultAdding] = useState(false);
  
  // Doctor medical updates form (blood group/allergies/active meds)
  const [editBlood, setEditBlood] = useState('O+');
  const [editAllergies, setEditAllergies] = useState('');
  const [editTreatments, setEditTreatments] = useState('');

  // Gemini AI Consultation Assistance
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<'api' | 'local' | null>(null);

  // Admin Dashboard stats
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [blockchainDossiers, setBlockchainDossiers] = useState<any[]>([]);

  const [authNpi, setAuthNpi] = useState('');
  
  // Doctor Patient Search & Auth Requests
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPatients, setSearchedPatients] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatientForAuth, setSelectedPatientForAuth] = useState<any>(null);
  const [activeAuthRequest, setActiveAuthRequest] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Patient notification
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // Fetch pending requests for patient
  const fetchPendingRequests = async () => {
    if (!token || user?.role !== 'patient') return;
    try {
      const res = await fetch('/api/authorization-requests/patient', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.filter((r: any) => r.status === 'pending'));
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // Respond to request
  const handleRespondRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const res = await fetch(`/api/authorization-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchPendingRequests();
    } catch (err: any) {
      alert("Erreur lors de la réponse : " + err.message);
    }
  };

  // Search patients (For Doctor)
  const handleSearchPatients = async (queryVal: string) => {
    setSearchQuery(queryVal);
    if (!queryVal.trim()) {
      setSearchedPatients([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(queryVal)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedPatients(data);
      }
    } catch (err) {
      console.error("Error searching patients:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Check auth status (For Doctor)
  const fetchAuthStatus = async (patientId: string) => {
    if (!token || !patientId) return;
    try {
      const res = await fetch(`/api/authorization-requests/status?patientId=${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAuthRequest(data.request);
      }
    } catch (err) {
      console.error("Error fetching auth status:", err);
    }
  };

  // Request access authorization (Doctor -> Patient)
  const handleRequestAuth = async (patientId: string) => {
    try {
      const res = await fetch('/api/authorization-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientId })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAuthRequest(data.request);
      }
    } catch (err) {
      console.error("Error requesting auth:", err);
    }
  };

  // Synchronize patient data upon login & setup polling
  useEffect(() => {
    if (token && user) {
      if (user.role === 'patient') {
        fetchPatientData();
        fetchPendingRequests();
        const interval = setInterval(fetchPendingRequests, 4000);
        return () => clearInterval(interval);
      } else if (user.role === 'doctor') {
        fetchDoctorConsultations();
      } else if (user.role === 'admin') {
        fetchAdminStats();
      }
    }
  }, [token, user]);

  // If a doctor has a patient selected for authorization, poll its status!
  useEffect(() => {
    if (token && user?.role === 'doctor' && selectedPatientForAuth) {
      fetchAuthStatus(selectedPatientForAuth.id);
      const interval = setInterval(() => {
        fetchAuthStatus(selectedPatientForAuth.id);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [token, user, selectedPatientForAuth]);

  // 30-second Automatic Lock Timer for Doctors reviewing patient records
  useEffect(() => {
    let timer: any;
    if (unlockedPatient && lockSecondsLeft !== null) {
      if (lockSecondsLeft <= 0) {
        setUnlockedPatient(null);
        setAiAnalysis(null);
        setConsentPin(''); // Clear PIN to force re-entry/re-verification
        setLockSecondsLeft(null);
        alert("🔒 Verrouillage de sécurité : Par conformité légale (loi N° 2017-20 Bénin), le dossier médical de " + (unlockedPatient.patientName || "l'assuré") + " a été automatiquement reverrouillé après 30 secondes d'inactivité.");
      } else {
        timer = setInterval(() => {
          setLockSecondsLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);
      }
    }
    return () => clearInterval(timer);
  }, [unlockedPatient, lockSecondsLeft]);

  const fetchPatientData = async () => {
    try {
      setLoadingPatientData(true);
      // Fetch dossier
      const dossierRes = await fetch('/api/dossier/patient', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dossierData = await dossierRes.json();
      if (dossierRes.ok) {
        setPatientDossier(dossierData);
      }

      // Fetch consultations
      const consRes = await fetch('/api/consultations/patient', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const consData = await consRes.json();
      if (consRes.ok) {
        setPatientConsultations(consData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPatientData(false);
    }
  };

  const fetchDoctorConsultations = async () => {
    try {
      const res = await fetch('/api/consultations/doctor', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDoctorConsultations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAdminStats(data);
      }

      // Fetch sample audit list (just using our seed user and some random addresses)
      setBlockchainDossiers([
        { patientName: "Koffi Mensah", id: "u_patient1", hash: "83c27e8a9f230ba78129031cde40a7bfe42831c9f2b8493cf024d830bca2d83a", height: 841203, tx: "b09d6f851722d3e4cf6b0488f7bfa97914f68e0d9b5463ad1e7a5c88ea7b7bfd", date: "10/05/2026" },
        { patientName: "Sena Agbovi", id: "u_patient2", hash: "fc4b2d398e8210bcda98a3e0f2cd020c0274bc32da349f298c40b72cda29bc21", height: 841920, tx: "1230a84d2843cb127a5d939e0d49f6a73928e0d7c491b29302e7a49e29a9fcde", date: "15/06/2026" }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Auth Handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: authEmail, password: authPassword }
      : { 
          email: authEmail, 
          password: authPassword, 
          role: authRole, 
          name: authName,
          phone: authPhone,
          npi: authRole === 'patient' ? authNpi : undefined,
          hospitalName: authRole === 'doctor' ? hospitalName : undefined,
          licenseNumber: authRole === 'doctor' ? licenseNumber : undefined
        };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur s'est produite");
      }

      if (isLogin) {
        // Logged in
        localStorage.setItem('sp_token', data.token);
        localStorage.setItem('sp_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        // Registered
        setAuthSuccess("Inscription réussie ! Vous pouvez vous connecter.");
        setIsLogin(true);
        setAuthPassword('');
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_user');
    setToken(null);
    setUser(null);
    setPatientDossier(null);
    setUnlockedPatient(null);
    setAiAnalysis(null);
  };

  // Patient Actions: Anchoring (OP_RETURN block timestamp)
  const handleAnchorDossier = async () => {
    setIsAnchoring(true);
    setAnchorSuccess(false);

    try {
      const res = await fetch('/api/dossier/anchor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh dossier representation with new anchor
      setPatientDossier(prev => prev ? { ...prev, blockchainAnchor: data.anchor } : null);
      setAnchorSuccess(true);
      setTimeout(() => setAnchorSuccess(false), 3000);
    } catch (err: any) {
      alert("Échec de l'horodatage : " + err.message);
    } finally {
      setIsAnchoring(false);
    }
  };

  // Patient PIN updates
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);
    try {
      const res = await fetch('/api/dossier/patient/update-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPin, newPin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPinMessage({ text: "Code PIN de consentement mis à jour avec succès !", isError: false });
      setOldPin('');
      setNewPin('');
    } catch (err: any) {
      setPinMessage({ text: err.message, isError: true });
    }
  };

  // Patient Action: Download full decrypted clinical medical dossier as PDF
  const downloadMedicalDossier = () => {
    if (!patientDossier) {
      alert("Le dossier médical n'est pas encore chargé.");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // National Banner Colors
      doc.setFillColor(0, 135, 81); // Benin Green #008751
      doc.rect(0, 0, 210, 10, 'F');
      
      doc.setFillColor(252, 209, 22); // Yellow band
      doc.rect(0, 10, 210, 3, 'F');
      
      doc.setFillColor(232, 17, 45); // Red band
      doc.rect(0, 13, 210, 3, 'F');

      // Title Section
      doc.setTextColor(30, 41, 59);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.text("SANTÉ PLUS BÉNIN", 14, 26);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("MINISTÈRE DE LA SANTÉ - RÉPUBLIQUE DU BÉNIN", 14, 30);
      doc.text("PORTAIL DE SANTÉ NUMÉRIQUE INTERCONNECTÉ", 14, 33);
      
      // Horizontal divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 37, 196, 37);

      // Document Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 135, 81);
      doc.text("DOSSIER MÉDICAL PORTABLE DÉCRYPTÉ", 14, 45);

      // Section: Patient Identity Box
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 50, 182, 33, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 50, 182, 33, 'S');

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("IDENTITÉ DU PATIENT / ASSURÉ", 18, 55);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Nom Complet: ${user?.name || "Koffi Mensah"}`, 18, 61);
      doc.text(`Identifiant Unique Santé Plus: ${user?.patientNumber || "SP-2026-1004"}`, 18, 66);
      doc.text(`NPI National: ${user?.npi || "100120264021"}`, 18, 71);
      doc.text(`Téléphone: ${user?.phone || "+229 97 00 11 22"}`, 18, 76);
      doc.text(`Adresse Électronique: ${user?.email || "patient@sante.bj"}`, 18, 81);

      // Section: Physiological Metrics
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text("METRIQUES PHYSIOLOGIQUES & DIAGNOSTICS", 14, 91);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Groupe Sanguin: ${patientDossier.bloodType || "O+"}`, 14, 96);
      doc.text(`Allergies critiques signalées: ${patientDossier.allergies && patientDossier.allergies.length > 0 ? patientDossier.allergies.join(', ') : 'Aucune allergie critique déclarée'}`, 14, 101);
      doc.text(`Traitements lourds actifs: ${patientDossier.activeTreatments && patientDossier.activeTreatments.length > 0 ? patientDossier.activeTreatments.join(', ') : 'Aucun traitement actif'}`, 14, 106);

      // Section: Emergency Contact
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text("CONTACT D'URGENCE DE CONFIANCE", 14, 115);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Nom: ${patientDossier.emergencyContact?.name || 'Non renseigné'}`, 14, 120);
      doc.text(`Téléphone: ${patientDossier.emergencyContact?.phone || 'Non renseigné'}`, 14, 124);
      doc.text(`Relation: ${patientDossier.emergencyContact?.relation || 'Non renseigné'}`, 14, 128);

      // Divider
      doc.line(14, 132, 196, 132);

      // Section: Clinical consultations history list
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(0, 135, 81);
      doc.text("HISTORIQUE DES ACTES CLINIQUES CERTIFIÉS", 14, 139);

      let yOffset = 145;
      if (patientConsultations && patientConsultations.length > 0) {
        patientConsultations.forEach((c, idx) => {
          if (yOffset > 240) {
            doc.addPage();
            yOffset = 25;
          }
          doc.setFillColor(248, 250, 252);
          doc.rect(14, yOffset, 182, 22, 'F');
          doc.setDrawColor(241, 245, 249);
          doc.rect(14, yOffset, 182, 22, 'S');

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(`${idx + 1}. Diagnostic: ${c.diagnosis}`, 18, yOffset + 5);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          doc.text(`Date: ${new Date(c.date).toLocaleDateString('fr-FR')} | Établissement: ${c.hospital}`, 18, yOffset + 10);
          doc.text(`Médecin traitant: ${c.doctorName} | Traitement prescrit: ${c.treatment}`, 18, yOffset + 15);
          doc.text(`Frais cliniques réglés: ${c.billingAmount.toLocaleString()} FCFA (Statut: PAYÉ via Lightning Network)`, 18, yOffset + 19);
          
          yOffset += 26;
        });
      } else {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Aucune consultation enregistrée dans l'historique.", 14, yOffset);
        yOffset += 10;
      }

      // Blockchain anchoring proof footer
      if (yOffset > 230) {
        doc.addPage();
        yOffset = 25;
      }
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, yOffset, 196, yOffset);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("PREUVE DE SÉCURITÉ & INTEGRITÉ (BLOCKCHAIN ANCHOR)", 14, yOffset + 6);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      
      const anchor = patientDossier.blockchainAnchor;
      if (anchor) {
        doc.text(`Dossier médical cryptographiquement lié à la blockchain Bitcoin (OP_RETURN).`, 14, yOffset + 10);
        doc.text(`Transaction ID (Hash): ${anchor.txId}`, 14, yOffset + 14);
        doc.text(`Hauteur de bloc d'ancrage: Block #${anchor.blockHeight} | Date d'horodatage: ${new Date(anchor.anchoredAt).toLocaleString('fr-FR')}`, 14, yOffset + 18);
        doc.text(`Statut d'intégrité: Conforme et cryptographiquement infalsifiable (Certifié conforme)`, 14, yOffset + 22);
      } else {
        doc.text("Statut d'intégrité: Certifié localement en attente du prochain cycle d'ancrage national.", 14, yOffset + 10);
      }

      doc.text("Ce document est émis conformément aux dispositions de la loi béninoise N° 2017-20 sur la protection des données personnelles.", 14, yOffset + 28);

      // Save PDF
      doc.save(`SantePlus_Dossier_Medical_${user?.name?.replace(/\s+/g, '_') || "Patient"}.pdf`);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la génération du PDF : " + err.message);
    }
  };

  // Doctor Actions: Unlock dossier with PIN
  const handleUnlockPatient = async (e?: React.FormEvent, directPatientId?: string, bypass?: boolean) => {
    if (e) e.preventDefault();
    setUnlockError(null);
    setUnlockedPatient(null);
    setAiAnalysis(null);
    setUnlockLoading(true);

    const targetPatientId = directPatientId || searchPatientId;
    const isBypass = bypass !== undefined ? bypass : (activeAuthRequest?.status === 'accepted' && targetPatientId === selectedPatientForAuth?.id);

    try {
      const res = await fetch('/api/dossier/doctor/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          patientId: targetPatientId, 
          consentPin: isBypass ? undefined : consentPin,
          bypassPinCheck: isBypass
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUnlockedPatient(data);
      setLockSecondsLeft(30); // Start 30 seconds safety lock countdown!
      if (targetPatientId) {
        setSearchPatientId(targetPatientId);
      }
      // Initialize edit fields
      setEditBlood(data.dossier.bloodType);
      setEditAllergies(data.dossier.allergies.join(', '));
      setEditTreatments(data.dossier.activeTreatments.join(', '));
    } catch (err: any) {
      setUnlockError(err.message);
    } finally {
      setUnlockLoading(false);
    }
  };

  // Doctor Action: Record consultation and act (produces Lightning invoice)
  const handleRecordConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultDiagnosis || !consultTreatment) {
      alert("Veuillez saisir un diagnostic et un traitement");
      return;
    }

    setConsultAdding(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: searchPatientId,
          patientName: unlockedPatient.patientName,
          diagnosis: consultDiagnosis,
          treatment: consultTreatment,
          billingAmount: consultPrice
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add act directly to the decrypted clinical dossier on backend
      const isBypass = (activeAuthRequest?.status === 'accepted' && searchPatientId === selectedPatientForAuth?.id);
      const actRes = await fetch('/api/dossier/doctor/add-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: searchPatientId,
          consentPin: isBypass ? undefined : consentPin,
          bypassPinCheck: isBypass,
          diagnosis: consultDiagnosis,
          treatment: consultTreatment,
          bloodType: editBlood,
          allergies: editAllergies.split(',').map(s => s.trim()).filter(Boolean),
          activeTreatments: editTreatments.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const actData = await actRes.json();
      if (!actRes.ok) throw new Error(actData.error);

      // Update doctor UI
      setUnlockedPatient(prev => prev ? { ...prev, dossier: actData.dossier } : null);
      setLockSecondsLeft(30); // Reset timer on action to give the doctor 30s more to review the newly updated file
      setDoctorConsultations([data, ...doctorConsultations]);
      
      // Open invoice modal for immediate Lightning demonstration!
      setActiveBillingInvoice({
        invoice: data.lightningInvoice,
        paymentHash: data.paymentHash,
        satoshis: data.billingAmount * 2,
        amountFcfa: data.billingAmount,
        description: `Consultation Acte Médical - ${unlockedPatient.patientName}`
      });
      setShowBillingInvoice(true);

      // Reset Form
      setConsultDiagnosis('');
      setConsultTreatment('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConsultAdding(false);
    }
  };

  // Doctor Action: Ask Gemini AI Clinical Advisor
  const handleGeminiAdvisor = async () => {
    if (!unlockedPatient) return;
    setAiLoading(true);
    setAiAnalysis(null);

    const isBypass = (activeAuthRequest?.status === 'accepted' && searchPatientId === selectedPatientForAuth?.id);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          patientId: searchPatientId, 
          consentPin: isBypass ? undefined : consentPin,
          bypassPinCheck: isBypass
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAiAnalysis(data.summary);
      setAiSource(data.isAI ? 'api' : 'local');
    } catch (err: any) {
      alert("Erreur de l'assistance IA : " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper payment success callback
  const handleConsultationPaidSuccess = () => {
    // If the patient paid, reload patient data
    if (user?.role === 'patient') {
      fetchPatientData();
    } else {
      // If doctor is watching, reload unlocked patient or consultations list
      fetchDoctorConsultations();
    }
  };

  // Prefill credentials helper for fast demo
  const prefillDemo = (role: 'patient' | 'doctor' | 'admin') => {
    if (role === 'patient') {
      setAuthEmail('patient@sante.bj');
      setAuthPassword('password123');
    } else if (role === 'doctor') {
      setAuthEmail('doctor@sante.bj');
      setAuthPassword('password123');
    } else {
      setAuthEmail('admin@sante.bj');
      setAuthPassword('admin123');
    }
    setIsLogin(true);
  };

  return (
    <div className={`min-h-screen bg-[#0d1a14]/60 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 ${isLargeText ? 'text-scaling-large' : ''}`}>
      
      {/* Dynamic Animated Background with Green/Dark Hue and Floating Boxes */}
      <div className="fixed inset-0 -z-50 bg-[#0d1a14] overflow-hidden pointer-events-none">
        {/* Subtle green ambient light glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D26A]/8 blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#067A45]/12 blur-[120px] animate-pulse duration-[12000ms]" />
        
        {/* Animated grid line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />

        {/* Floating/Drifting Animated Boxes */}
        <div className="absolute top-[15%] left-[10%] w-20 h-20 border border-[#00D26A]/10 rounded-2xl animate-float-box-1" />
        <div className="absolute top-[60%] left-[45%] w-32 h-32 border border-[#00D26A]/5 rounded-3xl animate-float-box-2" />
        <div className="absolute top-[40%] right-[15%] w-24 h-24 border border-emerald-500/10 rounded-xl animate-float-box-3" />
        <div className="absolute bottom-[10%] left-[20%] w-16 h-16 border border-[#067A45]/20 rounded-lg animate-float-box-1" />
        <div className="absolute top-[80%] right-[30%] w-28 h-28 border border-[#00D26A]/5 rounded-[2rem] rotate-45 animate-float-box-2" />
      </div>

      {/* 1. TOP HEADER BRANDING */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
            <Heart className="w-5.5 h-5.5 stroke-[2.5px] fill-emerald-100/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 font-display">BitRelf</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-100 uppercase font-mono">Bénin MVP</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Infrastructure de santé numérique nationale interconnectée BitRelf</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Guide de Style & UX System Action Toggle */}
          <button
            type="button"
            onClick={() => setShowStyleGuide(!showStyleGuide)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              showStyleGuide 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/15' 
                : 'bg-[#00D26A]/10 text-emerald-800 hover:bg-[#00D26A]/20 border-[#00D26A]/30'
            }`}
            title="Consulter le Guide de Style interactif et les Maquettes UX"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Guide de Style & UX</span>
          </button>

          {/* Visual Accessibility Zoom Selector */}
          <div className="bg-slate-100/80 border border-slate-200/60 rounded-2xl p-1.5 flex items-center gap-1 shadow-inner shrink-0">
            <span className="text-[9px] font-black text-slate-500 uppercase px-1.5 tracking-wider hidden lg:inline-block">Accessibilité</span>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[50, 70, 100, 125, 150, 170].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTextZoom(size)}
                  className={`px-1.5 sm:px-2 py-1 rounded-xl text-[9px] sm:text-xs font-black tracking-tight transition-all cursor-pointer ${
                    textZoom === size
                      ? 'bg-[#00D26A] text-slate-950 shadow-sm font-black'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title={`Ajuster le texte à ${size}%`}
                >
                  {size}%
                </button>
              ))}
            </div>
          </div>

          {token && user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {user.role === 'patient' ? 'Espace Patient' : user.role === 'doctor' ? 'Médecin Accrédité' : 'Administrateur'}
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-100/50"
                title="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
        {showStyleGuide ? (
          <StyleGuide onClose={() => setShowStyleGuide(false)} textZoom={textZoom} />
        ) : !token ? (
          /* ==========================================
             LOGIN & REGISTRATION PORTAL
             ========================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-6 max-w-6xl mx-auto w-full">
            {/* Left Column: Login Card (col-span-5) */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Benin flag ribbon on top of auth */}
                <div className="h-2.5 flex">
                  <div className="w-1/3 bg-[#008751]" />
                  <div className="w-1/3 bg-[#FCD116]" />
                  <div className="w-1/3 bg-[#E8112D]" />
                </div>

                <div className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 font-display">Portail BitRelf</h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Interconnexion clinique nationale et sauvegarde Bitcoin / Lightning</p>
                  </div>

                  {/* Demonstration Accounts Quick Access Buttons */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Accès démo rapide (Hackathon)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => prefillDemo('patient')}
                        className="py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl text-[10px] font-extrabold shadow-sm transition-all flex flex-col items-center gap-1"
                      >
                        <User className="w-4 h-4 text-emerald-500" />
                        <span>Patient</span>
                      </button>
                      <button 
                        onClick={() => prefillDemo('doctor')}
                        className="py-1.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-200 rounded-xl text-[10px] font-extrabold shadow-sm transition-all flex flex-col items-center gap-1"
                      >
                        <Activity className="w-4 h-4 text-teal-500" />
                        <span>Médecin</span>
                      </button>
                      <button 
                        onClick={() => prefillDemo('admin')}
                        className="py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-200 rounded-xl text-[10px] font-extrabold shadow-sm transition-all flex flex-col items-center gap-1"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex border-b border-slate-100 mb-6">
                    <button 
                      onClick={() => { setIsLogin(true); setAuthError(null); }}
                      className={`w-1/2 pb-3 text-sm font-bold text-center border-b-2 transition-all ${isLogin ? 'border-emerald-600 text-slate-950 font-black' : 'border-transparent text-slate-400'}`}
                    >
                      Se connecter
                    </button>
                    <button 
                      onClick={() => { setIsLogin(false); setAuthError(null); }}
                      className={`w-1/2 pb-3 text-sm font-bold text-center border-b-2 transition-all ${!isLogin ? 'border-emerald-600 text-slate-950 font-black' : 'border-transparent text-slate-400'}`}
                    >
                      S'inscrire
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2 border border-red-100">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-3 mb-4 bg-green-50 text-green-700 text-xs rounded-xl flex items-center gap-2 border border-green-100">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom complet</label>
                          <input 
                            type="text" 
                            placeholder="Koffi Mensah"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Numéro de téléphone</label>
                          <input 
                            type="tel" 
                            placeholder="ex: +229 97 00 11 22"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type de compte</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button 
                              type="button"
                              onClick={() => setAuthRole('patient')}
                              className={`py-2 rounded-xl text-xs font-bold transition-all border ${authRole === 'patient' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white border-slate-200'}`}
                            >
                              Patient (Dossier)
                            </button>
                            <button 
                              type="button"
                              onClick={() => setAuthRole('doctor')}
                              className={`py-2 rounded-xl text-xs font-bold transition-all border ${authRole === 'doctor' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white border-slate-200'}`}
                            >
                              Médecin
                            </button>
                          </div>
                        </div>

                        {authRole === 'patient' && (
                          <div className="animate-fadeIn">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              NPI (Numéro Personnel d'Identification - Bénin) <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              maxLength={12}
                              placeholder="Entrez votre NPI à 12 chiffres"
                              value={authNpi}
                              onChange={(e) => setAuthNpi(e.target.value.replace(/\D/g, ''))}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                            />
                          </div>
                        )}

                        {authRole === 'doctor' && (
                          <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hôpital d'exercice</label>
                              <input 
                                type="text" 
                                placeholder="CNHU-HKM"
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">N° d'Ordre National</label>
                              <input 
                                type="text" 
                                placeholder="CNMB-4921"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                      <input 
                        type="email" 
                        placeholder="votre@email.bj"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mot de passe</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full mt-4 py-3 bg-[#00D26A] hover:bg-[#067A45] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isLogin ? 'Accéder au Portail' : 'S\'inscrire sur BitRelf'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column: Hospital Locations Interactive Map & Search (Locations) */}
            <div className="lg:col-span-7 w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-xl space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D26A] animate-ping" />
                  <h3 className="text-base font-extrabold text-slate-800 font-display">Localisateur de Cliniques & Urgences BitRelf</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Consultez en direct les cliniques agréées de l'infrastructure nationale. Cliquez sur une clinique ci-dessous ou sur la carte interactive pour tracer votre itinéraire d'urgence.
                </p>
              </div>

              {/* Map search function */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Rechercher une clinique, une ville ou une spécialité (ex: Calavi, Cotonou...)"
                  value={welcomeSearch}
                  onChange={(e) => setWelcomeSearch(e.target.value)}
                  className="w-full p-3 pl-10 bg-slate-50 border border-slate-150 rounded-2xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-sans"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>

              {/* Benin interactive SVG micro-map */}
              <div className="relative border border-slate-200/60 rounded-2xl h-44 bg-[#0d1a14] overflow-hidden flex items-center justify-center shadow-inner">
                {/* Visual grid pattern */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-5 pointer-events-none">
                  {Array.from({ length: 72 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-emerald-400" />
                  ))}
                </div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <path d="M 10 130 Q 150 155 300 120 T 450 145" fill="none" stroke="#00D26A" strokeWidth="2" strokeDasharray="3,3" />
                  <path d="M 80 0 L 80 180 M 180 0 L 180 180" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="1,2" />
                </svg>

                {/* Draw map hospital nodes */}
                {HOSPITALS_DATA.map((h) => {
                  const isFocused = welcomeFocusedHospital?.id === h.id;
                  // Map X, Y projection
                  const mapLeft = h.id === 'hosp_cnhu' ? '25%' : h.id === 'hosp_stluc' ? '50%' : '75%';
                  const mapTop = h.id === 'hosp_cnhu' ? '40%' : h.id === 'hosp_stluc' ? '65%' : '50%';
                  return (
                    <button
                      key={h.id}
                      onClick={() => {
                        setWelcomeFocusedHospital(h);
                        setWelcomeMapMessage(`📍 Itinéraire réel GPS tracé : ${h.name}. Distance : ${h.distance} km de votre position actuelle. Standard urgences : ${h.phone}. Spécialités : ${h.specialties.join(', ')}.`);
                      }}
                      type="button"
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-120 focus:outline-none cursor-pointer"
                      style={{ left: mapLeft, top: mapTop }}
                    >
                      <div className="relative group">
                        {isFocused && (
                          <span className="absolute -inset-2.5 bg-[#00D26A]/30 rounded-full animate-ping pointer-events-none" />
                        )}
                        <MapPin 
                          className="w-5 h-5 transition-all"
                          style={{ 
                            color: isFocused ? '#00D26A' : '#f43f5e',
                            filter: isFocused ? 'drop-shadow(0 0 8px #00D26A)' : 'none'
                          }} 
                        />
                        <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-[7px] text-white px-1 py-0.2 rounded whitespace-nowrap font-mono scale-90 uppercase tracking-tight">
                          {h.name.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Map details ticker box */}
              <div className="bg-[#0d1a14] text-slate-300 p-3.5 rounded-2xl border border-slate-800 text-[10px] font-mono flex items-start gap-2.5 leading-relaxed shadow-sm">
                <span className="text-[#00D26A] font-extrabold animate-pulse">▶</span>
                <p>{welcomeMapMessage}</p>
              </div>

              {/* Hospital list selector */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {HOSPITALS_DATA.filter(h => 
                  h.name.toLowerCase().includes(welcomeSearch.toLowerCase()) || 
                  h.location.toLowerCase().includes(welcomeSearch.toLowerCase()) ||
                  h.specialties.some(s => s.toLowerCase().includes(welcomeSearch.toLowerCase()))
                ).map((h) => {
                  const isFocused = welcomeFocusedHospital?.id === h.id;
                  return (
                    <div 
                      key={h.id}
                      onClick={() => {
                        setWelcomeFocusedHospital(h);
                        setWelcomeMapMessage(`📍 Itinéraire réel GPS tracé : ${h.name}. Distance : ${h.distance} km de votre position actuelle. Standard urgences : ${h.phone}. Spécialités : ${h.specialties.join(', ')}.`);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center gap-4 ${
                        isFocused 
                          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                      }`}
                    >
                      <div className="space-y-0.5 text-left">
                        <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono tracking-wide">
                          {h.specialties[0]}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{h.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">{h.location}</p>
                      </div>
                      <div className="text-right text-[10px] font-mono shrink-0">
                        <span className="font-extrabold text-slate-700 block">{h.distance} km</span>
                        <span className="text-slate-400 text-[9px]">{h.phone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : user?.role === 'patient' ? (
          /* ==========================================
             PATIENT PORTAL DASHBOARD
             ========================================== */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar Left: Actions, QR Code Card & Anchor options */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Portable Medical QR Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl shadow-xl overflow-hidden relative border border-emerald-500/30">
                <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute left-[-10px] bottom-[-15px] w-20 h-20 bg-white/5 rounded-full" />

                <div className="p-6 relative">
                  <div className="flex justify-between items-start mb-4">
                    <Fingerprint className="w-10 h-10 stroke-1 text-emerald-100" />
                    <span className="text-[9px] font-mono font-extrabold uppercase bg-white/20 text-emerald-50 px-2 py-0.5 rounded backdrop-blur-sm">
                      Dossier Actif
                    </span>
                  </div>

                  <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider font-mono">Bénéficiaire Santé Plus</p>
                  <h3 className="text-lg font-black font-display tracking-tight mt-1">{user.name}</h3>
                  <p className="text-[11px] text-emerald-100/80 mt-0.5 font-mono">{user.phone || '+229 97 00 11 22'}</p>

                  <div className="mt-6 flex justify-between items-center bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-200" />
                      <div className="text-left">
                        <span className="block text-[8px] uppercase font-bold text-emerald-200">Consentement</span>
                        <span className="text-[11px] font-black font-mono">PIN : ****</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowQR(true)}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg transition-all"
                    >
                      Afficher QR
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 space-y-1">
                <button 
                  onClick={() => setActiveTab('dossier')}
                  className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'dossier' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <ClipboardList className="w-4.5 h-4.5" />
                  <span>Mon Dossier Médical</span>
                </button>
                <button 
                  onClick={() => setActiveTab('vaccines')}
                  className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'vaccines' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Syringe className="w-4.5 h-4.5" />
                  <span>Carnet de Vaccination</span>
                </button>
                <button 
                  onClick={() => setActiveTab('tontines')}
                  className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'tontines' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Coins className="w-4.5 h-4.5" />
                  <span>Tontines Santé</span>
                </button>
                <button 
                  onClick={() => setActiveTab('blood')}
                  className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'blood' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Droplet className="w-4.5 h-4.5" />
                  <span>Don de Sang & Alertes</span>
                </button>
                <button 
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full flex items-center gap-3 p-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'appointments' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Calendar className="w-4.5 h-4.5" />
                  <span>Prendre un Rendez-vous</span>
                </button>
              </div>

              {/* Bitcoin OP_RETURN Anchor Action Widget */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Horodatage Blockchain</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Signez et ancrez la preuve cryptographique (SHA-256) de l'intégrité de votre dossier sur la blockchain <strong>Bitcoin Testnet</strong>.
                </p>

                {patientDossier?.blockchainAnchor ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ancré avec succès !</span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 space-y-0.5 leading-tight">
                      <p className="truncate"><strong>TxID :</strong> {patientDossier.blockchainAnchor.txId}</p>
                      <p><strong>Bloc :</strong> #{patientDossier.blockchainAnchor.blockHeight}</p>
                      <p><strong>Date :</strong> {new Date(patientDossier.blockchainAnchor.anchoredAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl text-[10px] mb-3">
                    Modifications récentes non ancrées.
                  </div>
                )}

                <button
                  onClick={handleAnchorDossier}
                  disabled={isAnchoring}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isAnchoring ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Ancrage OP_RETURN...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ancrer sur la Blockchain</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right Column: Workspaces based on selection */}
            <div className="lg:col-span-3 space-y-6">
              
              {activeTab === 'dossier' && (
                <>
                  {/* Real-time Authorization Request Alerts */}
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl p-5 mb-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl mt-0.5">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Demande d'accès médical en attente</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Le médecin <strong className="text-emerald-700">{req.doctorName}</strong> ({req.hospitalName}) demande l'autorisation de consulter et modifier votre dossier de santé.
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono block mt-1">NPI demandé: {req.patientNpi || "Non renseigné"} • Soumis le {new Date(req.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end md:self-center">
                        <button 
                          onClick={() => handleRespondRequest(req.id, 'accepted')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Autoriser</span>
                        </button>
                        <button 
                          onClick={() => handleRespondRequest(req.id, 'declined')}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Refuser</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Medical Dossier Primary Portal */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    {/* Benin National Health Insurance Card Badge */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-900 text-white rounded-xl p-5 mb-6 shadow-md border border-emerald-700/50">
                      {/* Flag elements decoration */}
                      <div className="absolute top-0 right-0 w-3 h-full flex flex-col">
                        <div className="bg-emerald-500 h-1/3 w-full" />
                        <div className="bg-yellow-400 h-1/3 w-full" />
                        <div className="bg-red-500 h-1/3 w-full" />
                      </div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-[10px] text-emerald-950">SP</div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400 leading-none">République du Bénin</p>
                            <p className="text-[8px] text-white/60 leading-none mt-0.5">Ministère de la Santé</p>
                          </div>
                        </div>
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-widest font-mono">Assuré</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[8px] text-white/40 uppercase tracking-wider">Nom de l'assuré(e)</p>
                          <p className="text-xs font-extrabold tracking-wide uppercase truncate mt-0.5">{user?.name || "Koffi Mensah"}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-white/40 uppercase tracking-wider">Identifiant Unique Santé Plus</p>
                          <p className="text-xs font-bold text-emerald-300 font-mono mt-0.5">{user?.patientNumber || "SP-2026-1004"}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-white/40 uppercase tracking-wider">NPI (Identifiant National)</p>
                          <p className="text-xs font-bold font-mono text-slate-200 mt-0.5">{user?.npi || "100120264021"}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-white/40 uppercase tracking-wider">Statut Dossier</p>
                          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            <span>Sécurisé (AES-256)</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800 font-display">Mon Dossier Médical Portable</h2>
                        <p className="text-xs text-slate-500 font-medium">Données confidentielles déchiffrées en local</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={downloadMedicalDossier}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#067A45] border border-emerald-200 hover:border-emerald-300 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
                          title="Télécharger l'intégralité de mon dossier médical au format sécurisé"
                        >
                          <Download className="w-4 h-4 text-[#00D26A]" />
                          <span>Télécharger Dossier</span>
                        </button>
                        <span className="text-[10px] bg-slate-100 px-2.5 py-2.5 text-slate-500 rounded-xl font-mono font-bold">
                          Dernière m.à.j : {patientDossier ? new Date(patientDossier.updatedAt).toLocaleDateString() : 'En cours'}
                        </span>
                      </div>
                    </div>

                    {loadingPatientData ? (
                      <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xs text-slate-400">Déchiffrement AES-256 en mémoire locale...</p>
                      </div>
                    ) : patientDossier ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Bio-Data */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Métriques physiologiques</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Groupe Sanguin</span>
                              <div className="flex items-baseline gap-1 mt-1 text-xl font-black text-slate-800 font-display">
                                <span>{patientDossier.bloodType}</span>
                                <Droplet className="w-4 h-4 text-red-500 fill-red-500" />
                              </div>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Établissement Principal</span>
                              <p className="text-xs font-bold text-slate-800 mt-1 truncate">CNHU-HKM Cotonou</p>
                            </div>
                          </div>

                          <div className="bg-red-50/10 border border-red-100 rounded-xl p-4">
                            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1 mb-2">
                              <AlertCircle className="w-4 h-4" />
                              Allergies critiques signalées
                            </span>
                            {patientDossier.allergies.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {patientDossier.allergies.map((a, i) => (
                                  <span key={i} className="px-2.5 py-1 bg-red-100 text-red-800 font-bold rounded-lg text-xs">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 font-medium">Aucune allergie critique signalée dans la tontine.</p>
                            )}
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Traitements en cours</span>
                            {patientDossier.activeTreatments.length > 0 ? (
                              <ul className="mt-2 space-y-1.5">
                                {patientDossier.activeTreatments.map((t, i) => (
                                  <li key={i} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-slate-400 mt-1.5 font-medium">Aucun traitement lourd en cours.</p>
                            )}
                          </div>
                        </div>

                        {/* Secondary data: Emergency contact and PIN manager */}
                        <div className="space-y-6">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Contact d'urgence</span>
                            <div className="mt-2.5 space-y-1.5 text-xs">
                              <p className="font-bold text-slate-800">{patientDossier.emergencyContact.name || "Non renseigné"}</p>
                              <p className="text-slate-500 font-mono">{patientDossier.emergencyContact.phone}</p>
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-bold inline-block mt-0.5">
                                {patientDossier.emergencyContact.relation}
                              </span>
                            </div>
                          </div>

                          {/* Security PIN code Configuration */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              PIN d'autorisation de consultation
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Le médecin accrédité vous demandera ce PIN temporaire lors d'une auscultation pour déverrouiller l'accès.
                            </p>

                            <form onSubmit={handleUpdatePin} className="mt-3 grid grid-cols-2 gap-2">
                              <input 
                                type="password" 
                                maxLength={4}
                                placeholder="PIN Actuel"
                                required
                                value={oldPin}
                                onChange={(e) => setOldPin(e.target.value)}
                                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <input 
                                type="password" 
                                maxLength={4}
                                placeholder="Nouveau PIN"
                                required
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <button 
                                type="submit"
                                className="col-span-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                Changer mon PIN
                              </button>
                            </form>
                            
                            {pinMessage && (
                              <p className={`text-[10px] mt-2 font-bold ${pinMessage.isError ? 'text-red-600' : 'text-green-700'}`}>
                                {pinMessage.text}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-10">Données inaccessibles. Veuillez recharger.</p>
                    )}
                  </div>

                  {/* Visual Clinical Charts & Trends Card */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shadow-inner">
                          <Activity className="w-5.5 h-5.5 text-[#00D26A]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Suivi Physiologique & Courbes de Santé</h3>
                          <p className="text-xs text-slate-500 font-medium">Visualisation dynamique des constantes cliniques issues de votre historique</p>
                        </div>
                      </div>
                      
                      {/* Metric Views selectors */}
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-center border border-slate-200/50">
                        <button
                          type="button"
                          onClick={() => setActiveChartMetric('tension')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                            activeChartMetric === 'tension'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Tension Artérielle
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveChartMetric('temp')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                            activeChartMetric === 'temp'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Température
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveChartMetric('pouls')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                            activeChartMetric === 'pouls'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Pouls / Fréquence
                        </button>
                      </div>
                    </div>

                    {/* Current Stats Summary row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div 
                        onClick={() => setActiveChartMetric('tension')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeChartMetric === 'tension' ? 'bg-emerald-50/40 border-emerald-200/60 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}
                      >
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Dernière Tension</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black text-slate-800 font-display">118/76</span>
                          <span className="text-xs text-slate-400 font-bold">mmHg</span>
                        </div>
                        <span className="text-[9px] text-emerald-800 font-black mt-1.5 inline-block bg-emerald-100/80 px-2 py-0.5 rounded-lg">✓ Tension Normale</span>
                      </div>

                      <div 
                        onClick={() => setActiveChartMetric('temp')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeChartMetric === 'temp' ? 'bg-emerald-50/40 border-emerald-200/60 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}
                      >
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Dernière Température</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black text-slate-800 font-display">36.7</span>
                          <span className="text-xs text-slate-400 font-bold">°C</span>
                        </div>
                        <span className="text-[9px] text-emerald-800 font-black mt-1.5 inline-block bg-emerald-100/80 px-2 py-0.5 rounded-lg">✓ Température Stable</span>
                      </div>

                      <div 
                        onClick={() => setActiveChartMetric('pouls')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeChartMetric === 'pouls' ? 'bg-emerald-50/40 border-emerald-200/60 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}
                      >
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Dernier Pouls</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black text-slate-800 font-display">68</span>
                          <span className="text-xs text-slate-400 font-bold">bpm</span>
                        </div>
                        <span className="text-[9px] text-emerald-800 font-black mt-1.5 inline-block bg-emerald-100/80 px-2 py-0.5 rounded-lg">✓ Fréquence Excellente</span>
                      </div>
                    </div>

                    {/* Recharts chart container */}
                    <div className="h-[250px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        {activeChartMetric === 'tension' ? (
                          <LineChart data={healthMetricsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <YAxis domain={[60, 160]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 'bold' }} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                            <Line type="monotone" dataKey="tension_systolique" name="Systolique (Max)" stroke="#E11D48" strokeWidth={3} activeDot={{ r: 8 }} dot={{ strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="tension_diastolique" name="Diastolique (Min)" stroke="#2563EB" strokeWidth={3} dot={{ strokeWidth: 2 }} />
                          </LineChart>
                        ) : activeChartMetric === 'temp' ? (
                          <AreaChart data={healthMetricsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <YAxis domain={[35, 41]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="temperature" name="Température (°C)" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#tempGrad)" dot={{ strokeWidth: 2 }} />
                          </AreaChart>
                        ) : (
                          <LineChart data={healthMetricsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <YAxis domain={[50, 110]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 'bold' }} />
                            <Line type="monotone" dataKey="pouls" name="Fréquence Cardiaque (bpm)" stroke="#059669" strokeWidth={3} activeDot={{ r: 8 }} dot={{ strokeWidth: 2 }} />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Consultation History timeline */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <ClipboardList className="w-5 h-5 text-slate-400" />
                      <span>Historique Clinique & Actes Facturés</span>
                    </h3>

                    {patientConsultations.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">Aucune consultation répertoriée.</p>
                    ) : (
                      <div className="space-y-3">
                        {patientConsultations.map((c) => (
                          <div key={c.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] text-slate-400 font-mono">{new Date(c.date).toLocaleDateString()}</span>
                                <h4 className="text-sm font-bold text-slate-800 mt-0.5">{c.diagnosis}</h4>
                                <p className="text-xs text-slate-500 mt-1">Traitement prescrit : <span className="font-semibold text-slate-700">{c.treatment}</span></p>
                                <p className="text-xs text-slate-400 mt-1.5">Médecin : <span className="font-semibold">{c.doctorName}</span> ({c.hospital})</p>
                              </div>

                              <div className="flex sm:flex-col items-end gap-2 text-right">
                                <span className="font-mono text-xs font-bold text-slate-700">{c.billingAmount.toLocaleString()} FCFA</span>
                                {c.paymentStatus === 'paid' ? (
                                  <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[9px] font-bold">
                                    Réglé
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setActiveBillingInvoice({
                                        invoice: c.lightningInvoice,
                                        paymentHash: c.paymentHash,
                                        satoshis: c.billingAmount * 2,
                                        amountFcfa: c.billingAmount,
                                        description: `Acte Clinique - ${c.doctorName}`
                                      });
                                      setShowBillingInvoice(true);
                                    }}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-sm shadow-amber-500/10 flex items-center gap-1"
                                  >
                                    <Zap className="w-3 h-3 fill-white" />
                                    Payer
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'vaccines' && <VaccineTimeline token={token!} />}
              {activeTab === 'tontines' && <TontineWidget token={token!} patientId={user.id} patientName={user.name} />}
              {activeTab === 'blood' && <BloodCenter token={token!} userRole={user.role} />}
              {activeTab === 'appointments' && (
                <AppointmentBooking 
                  token={token!} 
                  onSuccess={() => setActiveTab('dossier')} 
                />
              )}

            </div>

          </div>
        ) : user?.role === 'doctor' ? (
          /* ==========================================
             DOCTOR PORTAL / ACCREDITED WORKSPACE
             ========================================== */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Panel: Search & Patient QR Capture */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Doctor Bio Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-16 h-16 bg-slate-50 rounded-tl-full flex items-end justify-end p-2 text-slate-300">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider font-mono">Praticien Connecté</h3>
                <h4 className="text-base font-black text-slate-800 mt-1">{user.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{user.hospitalName || "CNHU-HKM Cotonou"}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>N° Licence</span>
                  <span className="font-bold text-slate-700">{user.licenseNumber}</span>
                </div>
              </div>

              {/* Patient Scan / PIN Verification & Decentralized Search */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-4.5 h-4.5 text-teal-600" />
                  <span>Recherche & Autorisation NPI</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Recherchez un patient par son nom, son email, son NPI ou son numéro d'assuré Santé Plus.
                </p>

                {/* Search Input */}
                <div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nom, Email ou NPI (ex: 100120264021)"
                      value={searchQuery}
                      onChange={(e) => handleSearchPatients(e.target.value)}
                      className="w-full p-2.5 pl-8 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                  </div>
                </div>

                {/* Search Results */}
                {searchQuery.trim() !== '' && (
                  <div className="border border-slate-100 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-50 bg-slate-50/50 p-1">
                    {searchLoading ? (
                      <div className="text-center py-4 text-xs text-slate-400">Recherche en cours...</div>
                    ) : searchedPatients.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400">Aucun patient trouvé</div>
                    ) : (
                      searchedPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPatientForAuth(p);
                            setSearchPatientId(p.id);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg transition-all flex flex-col gap-1 text-xs cursor-pointer ${selectedPatientForAuth?.id === p.id ? 'bg-teal-500/10 border border-teal-200/50 text-slate-900 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                        >
                          <span className="font-extrabold text-slate-900">{p.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono truncate">{p.email}</span>
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                            <span>NPI: {p.npi || "N/A"}</span>
                            <span>N°: {p.patientNumber || "N/A"}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {unlockError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium leading-normal border border-red-100">
                    {unlockError}
                  </div>
                )}

                {/* Selected Patient Authorization Panel */}
                {selectedPatientForAuth && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase">Patient Sélectionné</span>
                        <span className="text-xs font-black text-slate-800">{selectedPatientForAuth.name}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedPatientForAuth(null);
                          setActiveAuthRequest(null);
                        }}
                        className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>

                    {/* Authorization Status State Engine */}
                    {!activeAuthRequest ? (
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Aucune demande d'autorisation d'accès n'est active pour ce patient. Vous pouvez envoyer une demande d'accès sécurisé ou saisir directement son code PIN.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRequestAuth(selectedPatientForAuth.id)}
                          className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5 animate-pulse" />
                          <span>Envoyer une demande d'accès (NPI)</span>
                        </button>
                      </div>
                    ) : activeAuthRequest.status === 'pending' ? (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[10px] space-y-1.5 animate-pulse">
                        <span className="font-bold uppercase tracking-wider block">⏳ Demande d'accès envoyée</span>
                        <p className="leading-normal">
                          En attente d'approbation sur le smartphone de {selectedPatientForAuth.name}... (Actualisation en temps réel)
                        </p>
                      </div>
                    ) : activeAuthRequest.status === 'declined' ? (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-[10px] space-y-1.5">
                        <span className="font-bold uppercase tracking-wider block">❌ Accès refusé par le patient</span>
                        <button
                          type="button"
                          onClick={() => handleRequestAuth(selectedPatientForAuth.id)}
                          className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Renvoyer la demande
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] space-y-1.5">
                        <span className="font-bold uppercase tracking-wider block">✅ Accès autorisé (Consentement NPI)</span>
                        <p className="leading-normal">Le patient a validé l'autorisation d'accès. Vous pouvez ouvrir son dossier sans PIN.</p>
                        <button
                          type="button"
                          onClick={() => handleUnlockPatient(undefined, selectedPatientForAuth.id, true)}
                          disabled={unlockLoading}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span>{unlockLoading ? "Déchiffrement..." : "Ouvrir le dossier médical"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PIN Backdoor Input Form */}
                {!selectedPatientForAuth && (
                  <form onSubmit={handleUnlockPatient} className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Accès d'urgence direct par PIN</span>
                    <div className="p-2 bg-slate-50 text-[10px] text-slate-500 border border-slate-100 rounded-lg font-mono">
                      <p><strong>Test Patient:</strong> u_patient1</p>
                      <p><strong>Test PIN:</strong> 1234</p>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Identifiant Patient</label>
                      <input 
                        type="text" 
                        required
                        placeholder="u_patient1"
                        value={searchPatientId}
                        onChange={(e) => setSearchPatientId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Code PIN du Patient</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        required
                        placeholder="••••"
                        value={consentPin}
                        onChange={(e) => setConsentPin(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono text-center tracking-widest"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={unlockLoading}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {unlockLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Déchiffrement AES-256...</span>
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-4 h-4" />
                          <span>Déchiffrer le Dossier (PIN)</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* Right Panel: Decrypted workspace & consult triggers */}
            <div className="lg:col-span-3 space-y-6">
              
              {unlockedPatient ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Decrypted Clinical Card */}
                  <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden relative">
                    
                    {/* Glowing Accent */}
                    <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />

                    <div className="p-6">
                      <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                              Accès déchiffré sécurisé
                            </span>
                            {lockSecondsLeft !== null && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase font-mono tracking-wider flex items-center gap-1 animate-pulse border border-rose-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Verrouillage : {lockSecondsLeft}s
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl font-bold text-slate-800 mt-1 font-display">
                            {unlockedPatient.patientName}
                          </h2>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {searchPatientId} | Tél: {unlockedPatient.patientPhone}</p>
                        </div>

                        {/* Interactive Gemini Diagnosis helper trigger */}
                        <button
                          onClick={handleGeminiAdvisor}
                          disabled={aiLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 transition-all"
                        >
                          {aiLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Consultation de l'IA...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 fill-purple-100/20" />
                              <span>Assistant Clinique Gemini AI</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Clinical Gemini Summary rendering */}
                      {aiAnalysis && (
                        <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-100/50 rounded-2xl mb-6 relative">
                          <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono">
                            {aiSource === 'api' ? 'Gemini 3.5 Flash' : 'Analyseur local'}
                          </span>
                          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1 font-display">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span>Aide à la Décision Médicale</span>
                          </h4>
                          <div className="text-xs text-indigo-950 space-y-2 leading-relaxed whitespace-pre-wrap font-sans">
                            {aiAnalysis}
                          </div>
                        </div>
                      )}

                      {/* Main dossier grid split (Dossier detail + adding consultation) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Column 1: Read-Only patient info and History */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Antécédents du bénéficiaire</h3>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="block text-[8px] font-bold text-slate-400 uppercase">Groupe Sanguin</span>
                              <span className="text-lg font-black text-slate-800">{unlockedPatient.dossier.bloodType}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="block text-[8px] font-bold text-slate-400 uppercase">Urgences</span>
                              <span className="text-xs font-bold block text-slate-700 truncate mt-1">
                                {unlockedPatient.dossier.emergencyContact.name} ({unlockedPatient.dossier.emergencyContact.relation})
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Allergies médicamenteuses</span>
                            {unlockedPatient.dossier.allergies.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {unlockedPatient.dossier.allergies.map((a: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold">{a}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Aucune déclarée</span>
                            )}
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Traitements en cours</span>
                            {unlockedPatient.dossier.activeTreatments.length > 0 ? (
                              <ul className="text-xs space-y-1 text-slate-700 font-medium">
                                {unlockedPatient.dossier.activeTreatments.map((t: string, i: number) => (
                                  <li key={i} className="flex items-center gap-1">• {t}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Aucun traitement lourd signalé</span>
                            )}
                          </div>

                          {/* Vaccine list sub-check */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Statut Blockchain</span>
                            {unlockedPatient.dossier.blockchainAnchor ? (
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold mt-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Certifié Bitcoin Height #{unlockedPatient.dossier.blockchainAnchor.blockHeight}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Non ancré globalement</span>
                            )}
                          </div>

                          {/* Historical records */}
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Historique des auscultations</span>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {unlockedPatient.dossier.medicalHistory.map((h: any) => (
                                <div key={h.id} className="p-3 bg-white border border-slate-100 rounded-xl text-xs">
                                  <div className="flex justify-between font-medium text-slate-400 text-[10px]">
                                    <span>{new Date(h.date).toLocaleDateString()}</span>
                                    <span>{h.hospital}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 mt-0.5">{h.diagnosis}</h4>
                                  <p className="text-[11px] text-slate-500 mt-1">Soin : {h.treatment}</p>
                                  <span className="block text-[10px] text-slate-400 mt-1">Par : {h.doctorName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Recording new Consultation and Medical Act */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Enregistrer un nouvel acte médical</h3>
                          
                          <form onSubmit={handleRecordConsultation} className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Diagnostic / Motif clinique</label>
                              <input 
                                type="text"
                                placeholder="ex: Paludisme suspecté, Toux"
                                required
                                value={consultDiagnosis}
                                onChange={(e) => setConsultDiagnosis(e.target.value)}
                                className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Traitement et Prescriptions</label>
                              <textarea 
                                placeholder="ex: Paracétamol 1g, Test de Goutte Épaisse"
                                required
                                rows={3}
                                value={consultTreatment}
                                onChange={(e) => setConsultTreatment(e.target.value)}
                                className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Honoraires facturés (FCFA)</label>
                              <input 
                                type="number"
                                min="500"
                                max="100000"
                                step="500"
                                value={consultPrice}
                                onChange={(e) => setConsultPrice(parseInt(e.target.value))}
                                className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                              />
                            </div>

                            {/* Section to edit bio parameters (Sync on save) */}
                            <div className="pt-3 border-t border-slate-200 space-y-3">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mettre à jour les constantes de base</h4>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] text-slate-400 font-bold uppercase">Groupe Sanguin</label>
                                  <select 
                                    value={editBlood}
                                    onChange={(e) => setEditBlood(e.target.value)}
                                    className="w-full mt-1 p-1 bg-white border border-slate-200 rounded-md text-xs"
                                  >
                                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+', 'Non spécifié'].map(g => (
                                      <option key={g} value={g}>{g}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[9px] text-slate-400 font-bold uppercase">Allergies (Séparées par virgule)</label>
                                  <input 
                                    type="text"
                                    value={editAllergies}
                                    onChange={(e) => setEditAllergies(e.target.value)}
                                    className="w-full mt-1 p-1 bg-white border border-slate-200 rounded-md text-xs"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-400 font-bold uppercase">Traitements actifs (Séparés par virgule)</label>
                                <input 
                                  type="text"
                                  value={editTreatments}
                                  onChange={(e) => setEditTreatments(e.target.value)}
                                  className="w-full mt-1 p-1 bg-white border border-slate-200 rounded-md text-xs"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={consultAdding}
                              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/10 transition-all flex items-center justify-center gap-1.5"
                            >
                              {consultAdding ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Enregistrement sécurisé...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 fill-white" />
                                  <span>Enregistrer et émettre la facture Lightning</span>
                                </>
                              )}
                            </button>
                          </form>

                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                  <Fingerprint className="w-16 h-16 text-slate-300 mx-auto mb-4 stroke-1 animate-pulse" />
                  <h3 className="text-base font-bold text-slate-700 font-display">Aucun dossier patient déchiffré</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                    Veuillez renseigner les informations d'identification à gauche (Patient ID + PIN de consentement) pour décrypter son dossier médical au repos.
                  </p>
                </div>
              )}

              {/* Doctors private consultations registry */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-display">
                  <ClipboardList className="w-5 h-5 text-slate-400" />
                  <span>Registre des consultations de mon cabinet</span>
                </h3>

                {doctorConsultations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Aucun acte médical enregistré pour le moment.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {doctorConsultations.map((c) => (
                      <div key={c.id} className="p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(c.date).toLocaleDateString()}</span>
                          <h4 className="font-bold text-slate-800 mt-0.5">{c.patientName} — {c.diagnosis}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">Soin : {c.treatment}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <span className="font-mono font-bold text-slate-700">{c.billingAmount.toLocaleString()} FCFA</span>
                          {c.paymentStatus === 'paid' ? (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-bold">Payé via Lightning</span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold animate-pulse">En attente (sats)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* ==========================================
             ADMIN / PUBLIC INSPECTION WORKSPACE
             ========================================== */
          <div className="space-y-6 animate-fadeIn">
            
            {/* Statistics Row */}
            {statsLoading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">Synchronisation des bases et du registre Bitcoin...</p>
              </div>
            ) : adminStats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Patients Inscrits</span>
                  <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{adminStats.totalPatients}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Hôpitaux/Médecins</span>
                  <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{adminStats.totalDoctors}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Dossiers Encryptés</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{adminStats.totalDossiers}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Actes Facturés</span>
                  <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">
                    {adminStats.totalConsultations} <span className="text-xs text-slate-400 font-normal">({adminStats.paidConsultations} réglés)</span>
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center col-span-2 md:col-span-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Coopératives Tontines</span>
                  <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{adminStats.totalTontines}</span>
                </div>
              </div>
            ) : null}

            {/* Blockchain Audit Ledgers & Blood Bank Control */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Audit Ledger List (2/3 cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-display">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Registre d'Audit et d'Horodatage Blockchain (OP_RETURN)</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  L'intégrité de chaque dossier Santé Plus est garantie par une empreinte SHA-256 ancrée périodiquement dans la blockchain Bitcoin testnet. Les données médicales réelles restent stockées de façon sécurisée et cryptée côté backend (Render PostgreSQL).
                </p>

                <div className="space-y-3">
                  {blockchainDossiers.map((doc, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{doc.patientName} — ID : <span className="font-mono">{doc.id}</span></h4>
                          <div className="mt-1 font-mono text-[9px] text-slate-400 leading-normal space-y-0.5">
                            <p className="truncate"><strong>Empreinte SHA-256 :</strong> {doc.hash}</p>
                            <p className="truncate"><strong>Transaction Bitcoin (OP_RETURN) :</strong> {doc.tx}</p>
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col items-end gap-1.5">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[9px] font-extrabold">
                            Bloc #{doc.height}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Date : {doc.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Information side panel (1/3 col) */}
              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
                  <h4 className="font-bold text-sm font-display text-emerald-400 mb-2">🔒 Législation & Conformité Bénin</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Santé Plus respecte scrupuleusement la **loi béninoise N° 2017-20** sur la protection des données à caractère personnel.
                  </p>
                  <ul className="mt-3.5 space-y-2 text-xs text-slate-400 list-disc pl-4 leading-relaxed">
                    <li>Aucune donnée médicale ne quitte le sol béninois sans cryptage AES-256.</li>
                    <li>Le consentement (PIN personnel) du patient est légalement requis avant tout acte de consultation par un tiers.</li>
                    <li>Aucune donnée médicale en clair n'est stockée on-chain — uniquement des hashs d'audit non-inversibles.</li>
                  </ul>
                </div>
                
                {/* Simulated Emergency Blood Alerts Center for Admin */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Droplet className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Banque de Sang Nationale</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    L'administrateur système a la visibilité sur les banques de sang de zone pour ajuster la logistique et les campagnes de tontines.
                  </p>
                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-[10px] text-red-800 font-semibold leading-relaxed">
                    🩸 <strong>Alerte critique O- :</strong> 1 patient(s) en détresse au CNHU-HKM. Solliciter les tontines solidaires de Cotonou.
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* 3. FOOTER ACCREDITATION */}
      <footer className="bg-white border-t border-slate-100 px-4 py-6 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>© 2026 Santé Plus Bénin • Projet de Santé Publique Solidaire</span>
          </div>
          <div className="flex gap-4 text-[10px] font-mono">
            <span>Render PostgreSQL DB : Connecté</span>
            <span>Réseau Lightning : Testnet Actif</span>
          </div>
        </div>
      </footer>

      {/* 4. MODALS REGISTER */}
      {showQR && user && (
        <QRModal 
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          patientId={user.id}
          patientName={user.name}
        />
      )}

      {showBillingInvoice && activeBillingInvoice && (
        <LightningModal 
          isOpen={showBillingInvoice}
          onClose={() => {
            setShowBillingInvoice(false);
            setActiveBillingInvoice(null);
          }}
          invoice={activeBillingInvoice}
          onPaymentSuccess={handleConsultationPaidSuccess}
        />
      )}

    </div>
  );
}
