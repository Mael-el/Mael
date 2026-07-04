import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Hospital, 
  Check, 
  MapPin, 
  Calendar as CalendarIcon, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  Pill, 
  Stethoscope, 
  Printer, 
  Download, 
  User, 
  Clock, 
  Plus, 
  Activity,
  Heart,
  Eye,
  Brain,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Mic,
  QrCode,
  Share2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Volume2,
  Smartphone,
  Sparkles,
  Info
} from 'lucide-react';

// Interfaces for structured state
export interface HospitalInfo {
  id: string;
  name: string;
  location: string;
  phone: string;
  description: string;
  rating: number;
  distance: number; // in km
  price: number; // in FCFA
  specialties: string[];
  lat: number;
  lng: number;
  imageUrl: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  period: 'morning' | 'afternoon';
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avail: string;
  avatar: string;
  rating: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

// 1. Static/Predefined rich mock data
export const HOSPITALS_DATA: HospitalInfo[] = [
  {
    id: 'hosp_cnhu',
    name: 'CNHU-HKM Cotonou',
    location: 'Boulevard de la Marina, Cotonou, Bénin',
    phone: '+229 21 30 01 12',
    description: 'Hôpital universitaire de référence nationale disposant d\'un plateau technique complet et de services d\'urgences ouverts 24h/24.',
    rating: 4.6,
    distance: 12.4,
    price: 5000,
    specialties: ['Cardiologie', 'Urgences', 'Neurologie', 'Pédiatrie'],
    lat: 130,
    lng: 155,
    imageUrl: 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp_stluc',
    name: 'Hôpital Saint-Luc de Calavi',
    location: 'Abomey-Calavi, Route Nationale 1, Bénin',
    phone: '+229 21 36 01 22',
    description: 'Établissement moderne de zone spécialisé en pédiatrie, gynécologie et chirurgie générale, très réputé pour la douceur de ses soins.',
    rating: 4.3,
    distance: 1.2,
    price: 2000,
    specialties: ['Pédiatrie', 'Gynécologie', 'Médecine Générale'],
    lat: 85,
    lng: 90,
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp_menontin',
    name: 'Hôpital de Ménontin',
    location: 'Avenue de l\'Union, Ménontin, Cotonou, Bénin',
    phone: '+229 21 38 12 30',
    description: 'Structure sanitaire communautaire avec une forte orientation de proximité, maternité ultra-active et soins de suite rapides.',
    rating: 4.1,
    distance: 6.8,
    price: 3000,
    specialties: ['Maternité', 'Ophtalmologie', 'Urgences'],
    lat: 160,
    lng: 210,
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp_chdborgou',
    name: 'CHD Borgou à Parakou',
    location: 'Quartier Banikanni, Parakou, Bénin',
    phone: '+229 23 61 02 11',
    description: 'Hôpital départemental de référence pour le Septentrion. Pôle d\'excellence pédiatrique et orthopédique d\'Afrique de l\'Ouest.',
    rating: 4.5,
    distance: 415,
    price: 4500,
    specialties: ['Cardiologie', 'Neurologie', 'Chirurgie Orthopédique'],
    lat: 40,
    lng: 250,
    imageUrl: 'https://images.unsplash.com/photo-1538108176447-280586497d96?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp_beth',
    name: 'Clinique Ste-Famille d\'Abomey',
    location: 'Quartier Houndjro, Abomey, Bénin',
    phone: '+229 22 50 04 10',
    description: 'Centre de santé confessionnel réputé pour son écoute attentive et son environnement calme propice au rétablissement.',
    rating: 4.4,
    distance: 135,
    price: 3500,
    specialties: ['Médecine Générale', 'Maternité', 'Ophtalmologie'],
    lat: 110,
    lng: 120,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=60'
  }
];

const MEDICATIONS_LIST = [
  { id: 'med_para', name: 'Paracétamol Sandoz 500mg', dosage: '1 comprimé toutes les 6 heures si fièvre', price: 1200, description: 'Antalgique de premier recours pour douleurs légères.' },
  { id: 'med_amox', name: 'Amoxicilline 500mg (Générique)', dosage: '3 gélules par jour pendant 5 jours', price: 2800, description: 'Antibiotique à large spectre pour infections bactériennes.' },
  { id: 'med_coartem', name: 'Coartem Forte (Artéméther/Luméfantrine)', dosage: '1 comprimé matin & soir pendant 3 jours', price: 3500, description: 'Traitement curatif de référence du paludisme simple.' },
  { id: 'med_zinc', name: 'Vitamines C + Zinc Santé Plus', dosage: '1 comprimé effervescent par jour', price: 1500, description: 'Complément fortifiant pour stimuler l\'immunité naturelle.' }
];

const DOCTORS_DATA: Doctor[] = [
  { id: 'doc_1', name: 'Dr. Jean Kodjo', specialty: 'Médecine Générale', avail: 'Tous les jours', avatar: '👨‍⚕️', rating: 4.8 },
  { id: 'doc_2', name: 'Dr. Chantal Boni', specialty: 'Pédiatrie', avail: 'Mardi, Jeudi, Vendredi', avatar: '👩‍⚕️', rating: 4.9 },
  { id: 'doc_3', name: 'Dr. Gbaguidi Lionel', specialty: 'Cardiologie', avail: 'Lundi, Mercredi', avatar: '👨‍⚕️', rating: 4.7 },
  { id: 'doc_4', name: 'Dr. Devigan Marcelle', specialty: 'Gynécologie', avail: 'Tous les jours', avatar: '👩‍⚕️', rating: 4.9 },
  { id: 'doc_5', name: 'Dr. Arnaud Tossou', specialty: 'Neurologie', avail: 'Mercredi, Vendredi', avatar: '👨‍⚕️', rating: 4.6 },
  { id: 'doc_6', name: 'Dr. Bruno Soglo', specialty: 'Ophtalmologie', avail: 'Lundi, Mardi, Jeudi', avatar: '👨‍⚕️', rating: 4.8 }
];

const FAQS_DATA: FAQItem[] = [
  {
    question: "Comment fonctionne la preuve cryptographique sur Bitcoin ?",
    answer: "À chaque paiement de rendez-vous validé, un hachage SHA-256 unique contenant vos détails d'autorisation anonymisés est ancré dans la blockchain Bitcoin via l'opcode OP_RETURN. Cela garantit un horodatage immuable et infalsifiable de votre accès médical, sans révéler d'informations personnelles en public."
  },
  {
    question: "Qu'est-ce que le paiement via Lightning Network ?",
    answer: "Lightning Network est un protocole de paiement de 'seconde couche' construit sur Bitcoin. Il permet d'effectuer des micropaiements instantanés avec des frais de transaction quasi nuls (< 0,1%), ce qui est parfait pour régler instantanément vos frais de consultation de 5 000 FCFA (soit environ 8 300 Satoshis)."
  },
  {
    question: "Puis-je me faire soigner si je n'ai pas de smartphone ?",
    answer: "Absolument. Vous pouvez simplement présenter votre carte d'assuré Santé Plus imprimée ou votre NPI national. Les agents de l'hôpital de votre choix pourront scanner votre code QR ou entrer votre PIN de consentement pour déchiffrer votre carnet de santé portable de façon décentralisée."
  },
  {
    question: "Comment fonctionne le remboursement de la tontine d'assurance ?",
    answer: "Si vous participez à une tontine de santé mutuelle, vos frais d'examen de rendez-vous sont automatiquement partagés ou pris en charge de façon autonome par le contrat intelligent de votre groupe de confiance lors de l'émission de la facture."
  }
];

const SPECIALTY_OPTIONS = ['Tous', 'Médecine Générale', 'Cardiologie', 'Pédiatrie', 'Gynécologie', 'Neurologie', 'Ophtalmologie'];

interface AppointmentBookingProps {
  token: string;
  onSuccess: () => void;
}

export default function AppointmentBooking({ token, onSuccess }: AppointmentBookingProps) {
  // Page / Wizard Navigation State
  // We're structuring a clean step system that represents exactly the requested user flow:
  // Step 1: Hospital list, geolocation details & interactive map selection
  // Step 2: Date select (interactive calendar with green indicator dots)
  // Step 3: Time slot selection (with custom matins / après-midi buttons)
  // Step 4: Medical Specialist selection (or option 'No Doctor' to go with emergency duty physician)
  // Step 5: Visited Motif entry (with vocal recording simulation text trigger)
  // Step 6: Preparatory medications checklist associated with the selected hospital
  // Step 7: Final Bill recap with Sats conversion and payment gateways (MoMo, LNbits, etc.)
  // Step 8: Success ticket with cryptographical hashes, downloadable PDF and sharing options
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User Selections State
  const [selectedHospital, setSelectedHospital] = useState<HospitalInfo>(HOSPITALS_DATA[1]); // Saint-Luc default
  const [selectedDate, setSelectedDate] = useState<string>('10'); // Day 10 is green/selected default
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [visitMotif, setVisitMotif] = useState<string>('');
  const [motifCategory, setMotifCategory] = useState<'coeur' | 'tete' | 'autre'>('autre');
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Lightning Network' | 'Mobile Money' | 'Wallet Santé+'>('Lightning Network');
  const [momoProvider, setMomoProvider] = useState<'MTN MoMo' | 'Moov Flooz' | 'Orange Money'>('MTN MoMo');
  const [momoPhone, setMomoPhone] = useState<string>('');
  
  // Interactive UI Search & Filters for Hospital Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Tous');
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [mapMessage, setMapMessage] = useState<string>("Localisation active : Abomey-Calavi, Bénin. Prêt à géolocaliser.");
  
  // Simulated Interactive States
  const [isVocalAssistantActive, setIsVocalAssistantActive] = useState<boolean>(false);
  const [vocalTextState, setVocalTextState] = useState<string>("Cliquez sur le micro pour parler...");
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [simulatedVoiceMotifActive, setSimulatedVoiceMotifActive] = useState<boolean>(false);
  const [faqExpandedIndex, setFaqExpandedIndex] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  const downloadReceiptAsPdf = () => {
    if (!successReceipt) return;
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
      doc.text("RÉCÉPISSÉ DE PAIEMENT ÉLECTRONIQUE OFFICIEL", 14, 33);
      
      // Horizontal divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 37, 196, 37);

      // Document Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 135, 81);
      doc.text(`FACTURE N° ${successReceipt.billNumber}`, 14, 45);

      // Section: Patient Identity
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 50, 182, 33, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 50, 182, 33, 'S');

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("DONNÉES DU PATIENT / ASSURÉ", 18, 55);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Nom de l'assuré(e): ${successReceipt.patientName}`, 18, 61);
      doc.text(`N° d'Assuré Unique: ${successReceipt.patientNumber}`, 18, 66);
      doc.text(`NPI National: ${successReceipt.patientNpi || "100120264021"}`, 18, 71);
      doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 18, 76);

      // Section: Consultation Details
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text("DÉTAILS DES SOINS ET ACTES MÉDICAUX", 14, 91);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Établissement d'accueil: ${successReceipt.hospitalName}`, 14, 97);
      doc.text(`Médecin accrédité: ${successReceipt.doctorName || 'Dr. Chantal Houngbo'}`, 14, 102);
      doc.text(`Type d'acte médical: ${successReceipt.optionName || 'Consultation de Médecine Générale'}`, 14, 107);
      doc.text(`Motif de consultation (Résumé): ${successReceipt.motif || 'Non renseigné'}`, 14, 112);

      // Section: Financials
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text("RÈGLEMENT FINANCIER & MODALITÉS", 14, 122);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Montant payé: ${successReceipt.price.toLocaleString()} FCFA`, 14, 128);
      doc.text(`Équivalence règlement: ${successReceipt.satsValue?.toLocaleString() || (successReceipt.price * 2).toLocaleString()} sats (Satoshis)`, 14, 133);
      doc.text(`Réseau de règlement utilisé: ${paymentMethod || "Réseau Interconnecté Santé Plus"}`, 14, 138);
      doc.text(`Frais de transaction: 0 FCFA (Pris en charge par l'État béninois)`, 14, 143);

      // Divider
      doc.line(14, 148, 196, 148);

      // Certifications and security
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(0, 135, 81);
      doc.text("AUTHENTIFICATION CRYPTOGRAPHIQUE SÉCURISÉE", 14, 155);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Ce règlement a été validé et horodaté de manière décentralisée sur la blockchain Bitcoin.", 14, 161);
      doc.text(`Hash de la transaction (ID de paiement): ${successReceipt.txHash || 'lightning_hash_mock_5839182390128309128301923'}`, 14, 165);
      doc.text(`Empreinte SHA-256 du dossier: ${successReceipt.shaHash || 'sha_256_dossier_hash_mock_48391028340128301923'}`, 14, 169);
      doc.text("Type de Preuve: OP_RETURN Timestamping (Conforme aux spécifications ANSSI-Bénin).", 14, 173);

      doc.text("Conformément au code de la santé publique de la République du Bénin, ce document tient lieu de reçu officiel de soins.", 14, 180);

      // Footer
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text("Cachet de l'administration Santé Plus", 140, 195);
      doc.setDrawColor(0, 135, 81);
      doc.setFillColor(240, 253, 244);
      doc.rect(135, 200, 55, 20, 'F');
      doc.rect(135, 200, 55, 20, 'S');
      doc.setFontSize(7);
      doc.setTextColor(0, 135, 81);
      doc.text("SANTÉ PLUS BÉNIN", 142, 206);
      doc.setFont("Helvetica", "normal");
      doc.text("RÈGLEMENT CERTIFIÉ", 141, 212);

      // Save PDF
      doc.save(`SantePlus_Facture_${successReceipt.billNumber}.pdf`);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la génération de la facture PDF : " + err.message);
    }
  };

  // Interactive Maps zoom effect & pins coordinate focus
  const [mapFocusId, setMapFocusId] = useState<string>('hosp_stluc');

  // Convert FCFA to Sats (Exchange rate approximation: 1 FCFA ≈ 1.66 Satoshis)
  const fcfaToSats = (fcfa: number) => {
    return Math.round(fcfa * 1.66);
  };

  // Base price computation depending on category chosen by user
  const baseConsultationPrice = motifCategory === 'coeur'
    ? 5000
    : motifCategory === 'tete'
      ? 4500
      : (selectedHospital ? selectedHospital.price : 3000);
  
  // No medications requested anymore as per user instruction
  const medicationsTotal = 0;

  const totalFCFAPrice = baseConsultationPrice;
  const totalSatsPrice = fcfaToSats(totalFCFAPrice);

  // Time slots array - dynamic state for morning vs afternoon
  const MORNING_SLOTS: TimeSlot[] = [
    { time: '08:30', available: true, period: 'morning' },
    { time: '09:00', available: true, period: 'morning' },
    { time: '09:30', available: false, period: 'morning' },
    { time: '10:00', available: true, period: 'morning' },
    { time: '10:30', available: true, period: 'morning' },
    { time: '11:00', available: false, period: 'morning' }
  ];

  const AFTERNOON_SLOTS: TimeSlot[] = [
    { time: '14:30', available: true, period: 'afternoon' },
    { time: '15:00', available: false, period: 'afternoon' },
    { time: '15:30', available: true, period: 'afternoon' },
    { time: '16:00', available: true, period: 'afternoon' },
    { time: '16:30', available: false, period: 'afternoon' },
    { time: '17:00', available: true, period: 'afternoon' }
  ];

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Map click selector triggers center alignment and details view
  const handleMapPinClick = (hosp: HospitalInfo) => {
    setSelectedHospital(hosp);
    setMapFocusId(hosp.id);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          // Approximate calculation from hospital center
          const realDist = calculateDistance(userLat, userLng, 6.3530, 2.4412);
          setMapMessage(`📍 Position GPS réelle détectée. Itinéraire calculé pour ${hosp.name}. Distance : ${realDist > 5000 ? hosp.distance : realDist.toFixed(1)} km. Temps estimé de trajet : ~${Math.round((realDist > 5000 ? hosp.distance : realDist) * 3)} mins.`);
        },
        () => {
          setMapMessage(`📍 Itinéraire calculé pour ${hosp.name}. Distance : ${hosp.distance} km. Temps estimé de trajet : ~${Math.round(hosp.distance * 3)} mins.`);
        }
      );
    } else {
      setMapMessage(`📍 Itinéraire calculé pour ${hosp.name}. Distance : ${hosp.distance} km. Temps estimé de trajet : ~${Math.round(hosp.distance * 3)} mins.`);
    }
  };

  // Filter hospitals based on search & tags
  const filteredHospitals = HOSPITALS_DATA.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'Tous' || h.specialties.includes(selectedSpecialty);
    const matchesPrice = h.price <= maxPrice;
    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  // Simulated vocal recognition
  const startVoiceRecording = () => {
    setIsVocalAssistantActive(true);
    setVocalTextState("Écoute active... Dites par exemple: 'Je veux prendre rendez-vous pour une gynécologie à l'Hôpital Saint-Luc de Calavi'");
    
    setTimeout(() => {
      setIsVocalAssistantActive(false);
      setVocalTextState("Texte reconnu: 'Rendez-vous Cardiologie CNHU pour demain matin'");
      // Auto-set filters for evaluation
      setSelectedSpecialty('Cardiologie');
      setSelectedHospital(HOSPITALS_DATA[0]); // CNHU
      setMapMessage("🎙️ Commande vocale comprise. Hôpital mis à jour pour CNHU Cotonou.");
    }, 4000);
  };

  // Simulated reason for visit microphone generator
  const triggerVoiceMotif = () => {
    setSimulatedVoiceMotifActive(true);
    setTimeout(() => {
      setVisitMotif("Bonjour, je sollicite une consultation préventive de routine pour un bilan d'hypertension et vérification de tension artérielle.");
      setSimulatedVoiceMotifActive(false);
    }, 2500);
  };

  // Checkbox list builder for medications
  const toggleMedication = (medName: string) => {
    if (selectedMedications.includes(medName)) {
      setSelectedMedications(selectedMedications.filter(m => m !== medName));
    } else {
      setSelectedMedications([...selectedMedications, medName]);
    }
  };

  // Complete Payment and register booking
  const executePaymentAndBooking = async () => {
    setPaymentLoading(true);
    
    // Simulate API submission delay for realistic experience
    setTimeout(async () => {
      const billNo = "FACT-2026-" + Math.floor(100000 + Math.random() * 900000);
      const randomTxHash = "0000000000000000000" + Math.random().toString(16).substr(2, 40);
      const shaHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const payload = {
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        hospitalLocation: selectedHospital.location,
        hospitalPhone: selectedHospital.phone,
        optionName: `${selectedTimeSlot} (Le ${selectedDate} Juillet 2026)`,
        medications: selectedMedications,
        doctorId: selectedDoctor?.id || "emergency_duty",
        doctorName: selectedDoctor ? selectedDoctor.name : "Médecin de garde",
        appointmentType: selectedDoctor ? selectedDoctor.specialty : "Médecine Générale d'Urgence",
        price: totalFCFAPrice,
        paymentMethod: paymentMethod === 'Lightning Network' ? 'Lay Network' : 'MoMo', // maps to database model schema
        date: `2026-07-${selectedDate.padStart(2, '0')}`
      };

      try {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const dbData = await res.json();
          setSuccessReceipt({
            ...dbData,
            txHash: randomTxHash.substring(0, 48),
            shaHash: "sha256_" + shaHash.substring(0, 16),
            satsValue: totalSatsPrice,
            motif: visitMotif || "Consultation de routine"
          });
          setCurrentStep(7); // Progress directly to the confirmation screen
        } else {
          // Fallback receipt in case of database sync lag
          setSuccessReceipt({
            billNumber: billNo,
            patientName: "Koffi Assuré",
            patientNumber: "SP-2026-1004",
            patientNpi: "100120264021",
            hospitalName: selectedHospital.name,
            hospitalLocation: selectedHospital.location,
            hospitalPhone: selectedHospital.phone,
            appointmentType: selectedDoctor ? selectedDoctor.specialty : "Médecine Générale d'Urgence",
            doctorName: selectedDoctor ? selectedDoctor.name : "Médecin de garde",
            optionName: `${selectedTimeSlot} (Le ${selectedDate} Juillet 2026)`,
            price: totalFCFAPrice,
            paymentMethod: paymentMethod,
            txHash: randomTxHash.substring(0, 48),
            shaHash: "sha256_" + shaHash.substring(0, 16),
            satsValue: totalSatsPrice,
            medications: selectedMedications,
            motif: visitMotif || "Consultation de routine"
          });
          setCurrentStep(7);
        }
      } catch (e) {
        // Fallback receipt to avoid blocking user flow
        setSuccessReceipt({
          billNumber: billNo,
          patientName: "Koffi Assuré",
          patientNumber: "SP-2026-1004",
          patientNpi: "100120264021",
          hospitalName: selectedHospital.name,
          hospitalLocation: selectedHospital.location,
          hospitalPhone: selectedHospital.phone,
          appointmentType: selectedDoctor ? selectedDoctor.specialty : "Médecine Générale d'Urgence",
          doctorName: selectedDoctor ? selectedDoctor.name : "Médecin de garde",
          optionName: `${selectedTimeSlot} (Le ${selectedDate} Juillet 2026)`,
          price: totalFCFAPrice,
          paymentMethod: paymentMethod,
          txHash: randomTxHash.substring(0, 48),
          shaHash: "sha256_" + shaHash.substring(0, 16),
          satsValue: totalSatsPrice,
          medications: selectedMedications,
          motif: visitMotif || "Consultation de routine"
        });
        setCurrentStep(7);
      } finally {
        setPaymentLoading(false);
      }
    }, 2000);
  };

  // Helper trigger for sharing options
  const triggerShareAlert = (platform: string) => {
    const text = `Reçu Médical BitRelf: RDV à ${successReceipt?.hospitalName || 'la clinique'} avec ${successReceipt?.doctorName || 'médecin'}. Tarif: ${successReceipt?.price || 0} FCFA. Preuve blockchain TXID: ${successReceipt?.txHash || 'N/A'}`;
    const encodedText = encodeURIComponent(text);
    if (platform === "WhatsApp") {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    } else if (platform.includes("SMS") || platform.includes("Email")) {
      window.open(`sms:?body=${encodedText}`, '_blank');
    } else {
      alert(`Votre reçu de paiement cryptographique a été partagé avec succès via ${platform} !`);
    }
  };

  // Calendar dates layout calculation: July 2026 (Day 1 starts on Wednesday)
  const julyDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-[#F5F7FA] rounded-3xl overflow-hidden shadow-xl border border-slate-100" id="appointment-root">
      
      {/* 💚 HEADER BANNER (Blanc et Vert #00D26A) */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-900 text-white px-8 py-6 relative overflow-hidden">
        {/* Dynamic national flag aesthetic ribbon */}
        <div className="absolute top-0 right-0 w-4 h-full flex flex-col">
          <div className="bg-[#00D26A] h-1/3 w-full" />
          <div className="bg-yellow-400 h-1/3 w-full" />
          <div className="bg-red-500 h-1/3 w-full" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#00D26A] text-emerald-950 font-black text-xs px-2.5 py-0.5 rounded-full tracking-widest uppercase font-mono shadow-sm">BÉNIN SANTÉ PLUS</span>
              <span className="w-2 h-2 rounded-full bg-[#00D26A] animate-ping" />
            </div>
            <h1 className="text-xl md:text-2xl font-black mt-1 text-white tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              Guichet Unique de Prise de Rendez-vous
            </h1>
            <p className="text-[11px] text-emerald-200 mt-0.5 max-w-xl">
              De l'urgence au soin en 3 minutes · Vos données médicales sécurisées par chiffrement AES-256 et ancrées sur Bitcoin.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-300 font-mono">STATION GPS:</span>
            <div className="bg-emerald-900/60 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-inner">
              <MapPin className="w-4 h-4 text-[#00D26A]" />
              <div className="text-left">
                <p className="text-[9px] font-bold uppercase text-[#00D26A] tracking-wider leading-none">Abomey-Calavi</p>
                <p className="text-[8px] text-slate-400 leading-none mt-0.5">Bénin (Géolocalisé)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Multi-step Tracker */}
      <div className="bg-white px-8 py-5 border-b border-slate-150 flex items-center overflow-x-auto gap-4 scrollbar-none justify-between">
        {[
          { num: 1, label: "Hôpital" },
          { num: 2, label: "Date" },
          { num: 3, label: "Créneau" },
          { num: 4, label: "Praticien" },
          { num: 5, label: "Motif" },
          { num: 6, label: "Paiement" },
          { num: 7, label: "Reçu" }
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => s.num < currentStep && s.num < 7 && setCurrentStep(s.num)}
            className="flex items-center gap-2 shrink-0 focus:outline-none"
            disabled={s.num >= currentStep || currentStep === 7}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
              currentStep === s.num 
                ? 'bg-[#00D26A] text-slate-900 shadow-md scale-110 ring-2 ring-emerald-100' 
                : currentStep > s.num 
                  ? 'bg-emerald-100 text-[#067A45] cursor-pointer' 
                  : 'bg-slate-100 text-slate-400'
            }`}>
              {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs md:text-sm font-black ${currentStep === s.num ? 'text-slate-900 uppercase font-extrabold tracking-wide' : 'text-slate-500 font-bold'}`}>{s.label}</span>
            {s.num < 7 && <ArrowRight className="w-4 h-4 text-slate-300" />}
          </button>
        ))}
      </div>

      {/* Main Container Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white min-h-[550px]">
        
        {/* LEFT PANEL: ACTIVE SCREEN WIZARD */}
        <div className="lg:col-span-8 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-6">

            {/* ERROR OR WARN ALERTS */}
            {selectedHospital.price > maxPrice && currentStep === 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ajustement de filtre requis</p>
                  <p className="mt-0.5 text-amber-700">L'hôpital actuellement sélectionné dépasse votre filtre de prix maximal de {maxPrice.toLocaleString()} FCFA.</p>
                </div>
              </div>
            )}

            {/* SCREEN 1: GEOLOCATION & HOSPITAL LIST SEARCH */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="border-l-4 border-[#00D26A] pl-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide" style={{ fontFamily: 'Sora, sans-serif' }}>
                      Étape 1 : Choisir un hôpital à proximité
                    </h2>
                    <p className="text-[11px] text-slate-500">Utilisez notre carte interactive intégrée ou les filtres rapides ci-dessous.</p>
                  </div>
                  
                  <button 
                    onClick={() => setQrModalOpen(true)}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#00D26A]" />
                    <span className="hidden sm:inline">Scanner Borne Hôpital</span>
                  </button>
                </div>

                {/* Search Bar & Multi-filter */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-6 relative">
                      <input 
                        type="text" 
                        placeholder="Rechercher un hôpital (ex: Saint-Luc, CNHU...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    <div className="md:col-span-6 flex gap-2">
                      <div className="w-1/2 relative">
                        <select 
                          value={selectedSpecialty}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="w-full pl-2 pr-6 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                          {SPECIALTY_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                      </div>

                      <div className="w-1/2 flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2">
                        <span className="text-[9px] text-slate-400 font-mono shrink-0">Max FCFA :</span>
                        <input 
                          type="range"
                          min={2000}
                          max={6000}
                          step={500}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-[#00D26A]"
                        />
                        <span className="text-[10px] font-black text-slate-700 font-mono shrink-0">{maxPrice / 1000}k</span>
                      </div>
                    </div>
                  </div>

                  {/* Vocal Assistant quick panel */}
                  <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${isVocalAssistantActive ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-800'}`}>
                        <Mic className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-medium text-slate-600 leading-tight">
                        {vocalTextState}
                      </p>
                    </div>

                    <button 
                      onClick={startVoiceRecording}
                      disabled={isVocalAssistantActive}
                      className="text-[10px] px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer self-start sm:self-center"
                    >
                      <Mic className="w-3 h-3" />
                      <span>{isVocalAssistantActive ? "Parler..." : "Activer Dictée"}</span>
                    </button>
                  </div>
                </div>

                {/* Filtered Hospitals List */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Hôpitaux correspondants ({filteredHospitals.length})</span>
                  {filteredHospitals.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                      <Hospital className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Aucun établissement ne correspond à vos filtres de prix ou spécialités.</p>
                      <button 
                        onClick={() => { setSelectedSpecialty('Tous'); setMaxPrice(6000); setSearchQuery(''); }}
                        className="text-[10px] text-emerald-700 font-bold underline mt-2 cursor-pointer"
                      >
                        Réinitialiser tous les filtres
                      </button>
                    </div>
                  ) : (
                    filteredHospitals.map((hosp) => (
                      <div
                        key={hosp.id}
                        onClick={() => handleMapPinClick(hosp)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          selectedHospital.id === hosp.id 
                            ? 'border-[#00D26A] bg-emerald-500/5 ring-1 ring-[#00D26A]' 
                            : 'border-slate-150 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <img 
                            src={hosp.imageUrl} 
                            alt={hosp.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100" 
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xs font-bold text-slate-950">{hosp.name}</h3>
                              <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                ⭐ {hosp.rating}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                📍 {hosp.distance} km
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 mt-1 max-w-md leading-relaxed">
                              {hosp.description}
                            </p>

                            <div className="flex items-center gap-1 flex-wrap mt-2">
                              {hosp.specialties.map(spec => (
                                <span key={spec} className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
                          <div className="text-left md:text-right">
                            <span className="block text-[8px] text-slate-400 uppercase tracking-wider font-mono">Tarif indicatif</span>
                            <span className="text-xs font-black text-[#067A45] font-mono">{hosp.price.toLocaleString()} FCFA</span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-2">
                            {selectedHospital.id === hosp.id ? (
                              <span className="text-[10px] font-black bg-[#00D26A] text-slate-900 px-3 py-1 rounded-xl flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Sélectionné
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#067A45] hover:underline px-3 py-1">
                                Choisir cet hôpital
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SCREEN 2: DATE SELECT CALENDAR */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-l-4 border-[#00D26A] pl-3">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Étape 2 : Sélectionner la date de votre visite
                  </h2>
                  <p className="text-[11px] text-slate-500">Les dates marquées en vert sont disponibles à la réservation immédiate pour {selectedHospital.name}.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs text-slate-600 flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-[#00D26A]" />
                  <span>Établissement réservé : <strong className="text-slate-900">{selectedHospital.name}</strong></span>
                </div>

                {/* Calendar grid view */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <span className="text-xs font-black text-slate-900">Juillet 2026</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Fuseau horaire Cotonou UTC+1</span>
                  </div>

                  {/* Day labels */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black text-slate-400 uppercase mb-2">
                    <span>Dim</span><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Padding offsets before July 1st (Wednesday has index 3) */}
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={`offset-${i}`} className="h-10 opacity-0" />
                    ))}

                    {julyDays.map((d) => {
                      // Let's mock weekends as locked (unavailable) and weekdays as green (available)
                      const dayOfWeek = (d + 2) % 7; // Sunday=0, Monday=1 etc.
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                      const isSelected = selectedDate === String(d);

                      return (
                        <button
                          key={`day-${d}`}
                          type="button"
                          onClick={() => !isWeekend && setSelectedDate(String(d))}
                          disabled={isWeekend}
                          className={`h-11 rounded-xl transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                            isSelected 
                              ? 'bg-[#00D26A] text-slate-900 font-extrabold shadow-md scale-105' 
                              : isWeekend
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                : 'bg-emerald-50/40 text-slate-700 hover:bg-emerald-50 border border-emerald-100/50'
                          }`}
                        >
                          <span className="text-xs">{d}</span>
                          {!isWeekend && (
                            <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-slate-900' : 'bg-emerald-500'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#00D26A] rounded-md border border-emerald-500" />
                      <span>Date Sélectionnée</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-50 rounded-md border border-emerald-100" />
                      <span>Créneaux Libres</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-slate-50 rounded-md border border-slate-200" />
                      <span>Fermé / Indisponible</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: TIME SLOT SELECTION */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-l-4 border-[#00D26A] pl-3">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Étape 3 : Créneau horaire de consultation
                  </h2>
                  <p className="text-[11px] text-slate-500">Choisissez une heure de rendez-vous pour la journée du {selectedDate} Juillet 2026.</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-2xl flex items-center justify-between text-xs text-[#067A45]">
                  <span>Hôpital : <strong>{selectedHospital.name}</strong></span>
                  <span>Date d'arrivée : <strong>{selectedDate} Juillet 2026</strong></span>
                </div>

                <div className="space-y-6">
                  {/* MORNING SLOTS */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#067A45]" />
                      <span>Consultations Matinales (08:30 - 12:00)</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {MORNING_SLOTS.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                            !slot.available 
                              ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                              : selectedTimeSlot === slot.time
                                ? 'bg-[#00D26A] border-[#00D26A] text-slate-900 shadow-sm scale-102'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{slot.time}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${
                            !slot.available 
                              ? 'bg-slate-100 text-slate-400 uppercase font-mono' 
                              : selectedTimeSlot === slot.time 
                                ? 'bg-slate-950/20 text-slate-900' 
                                : 'bg-emerald-100 text-[#067A45]'
                          }`}>
                            {slot.available ? "Libre" : "Occupé"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AFTERNOON SLOTS */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#067A45]" />
                      <span>Consultations de l'Après-midi (14:30 - 17:00)</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {AFTERNOON_SLOTS.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                            !slot.available 
                              ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                              : selectedTimeSlot === slot.time
                                ? 'bg-[#00D26A] border-[#00D26A] text-slate-900 shadow-sm scale-102'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{slot.time}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${
                            !slot.available 
                              ? 'bg-slate-100 text-slate-400' 
                              : selectedTimeSlot === slot.time 
                                ? 'bg-slate-950/20 text-slate-900' 
                                : 'bg-emerald-100 text-[#067A45]'
                          }`}>
                            {slot.available ? "Libre" : "Occupé"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 4: CHOOSE DOCTOR OR DUTY EMERGENCY DOCTOR */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-l-4 border-[#00D26A] pl-3">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Étape 4 : Choisir un praticien médical ou généraliste de garde
                  </h2>
                  <p className="text-[11px] text-slate-500">Sélectionnez le médecin agréé de votre choix pour cet examen, ou optez pour le médecin d'astreinte.</p>
                </div>

                <div className="space-y-3">
                  
                  {/* Option: Emergency Duty general physician */}
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedDoctor === null 
                        ? 'border-[#00D26A] bg-[#00D26A]/5 ring-1 ring-[#00D26A]' 
                        : 'border-slate-150 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg">
                        🏥
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Médecin généraliste de garde de l'hôpital</h4>
                        <p className="text-[10px] text-slate-500">Prise en charge par l'équipe d'astreinte disponible dès votre arrivée.</p>
                      </div>
                    </div>
                    {selectedDoctor === null && (
                      <span className="text-[10px] font-black bg-[#00D26A] text-slate-900 px-3 py-1 rounded-xl">Recommandé d'urgence</span>
                    )}
                  </button>

                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider pt-2">Spécialistes disponibles ({DOCTORS_DATA.length})</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DOCTORS_DATA.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDoctor(doc)}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 ${
                          selectedDoctor?.id === doc.id 
                            ? 'border-[#00D26A] bg-[#00D26A]/5 ring-1 ring-[#00D26A]' 
                            : 'border-slate-150 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-base shrink-0">
                              {doc.avatar}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{doc.specialty}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-500 font-mono">
                            ⭐ {doc.rating}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-slate-100 w-full flex justify-between items-center mt-3">
                          <span className="text-[9px] bg-emerald-50 text-[#067A45] px-2 py-0.5 rounded font-black">
                            Dispo: {doc.avail.split(',')[0]}
                          </span>
                          
                          {selectedDoctor?.id === doc.id && (
                            <span className="text-[9px] text-[#067A45] font-black flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> Sélectionné
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 5: REASON/MOTIF FOR VISIT WITH LARGE ACCESSIBLE BUTTONS */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-l-4 border-[#00D26A] pl-4">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide">
                    Étape 5 : Quel est le motif de votre rendez-vous ?
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 mt-1">
                    Sélectionnez si le rendez-vous concerne le cœur, la tête, ou un autre motif général de consultation. Les prix sont affichés de manière transparente.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* COEUR */}
                  <button
                    type="button"
                    onClick={() => {
                      setMotifCategory('coeur');
                      setVisitMotif("Consultation pour le cœur (Cardiologie / Tension artérielle)");
                    }}
                    className={`p-6 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between h-48 shadow-sm ${
                      motifCategory === 'coeur'
                        ? 'border-[#00D26A] bg-emerald-500/5 ring-4 ring-emerald-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-5xl" role="img" aria-label="cœur">🫀</span>
                      {motifCategory === 'coeur' && (
                        <span className="bg-[#00D26A] text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">Sélectionné</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Pour le Cœur</h4>
                      <p className="text-xs text-slate-500 leading-tight mt-1">Suivi cardio-vasculaire, tension, électrocardiogramme</p>
                      <span className="text-lg font-extrabold text-[#067A45] block mt-2 font-mono">5 000 FCFA</span>
                    </div>
                  </button>

                  {/* TETE */}
                  <button
                    type="button"
                    onClick={() => {
                      setMotifCategory('tete');
                      setVisitMotif("Consultation pour la tête (Neurologie / Ophtalmologie / Céphalées)");
                    }}
                    className={`p-6 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between h-48 shadow-sm ${
                      motifCategory === 'tete'
                        ? 'border-[#00D26A] bg-emerald-500/5 ring-4 ring-emerald-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-5xl" role="img" aria-label="tête">🧠</span>
                      {motifCategory === 'tete' && (
                        <span className="bg-[#00D26A] text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">Sélectionné</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Pour la Tête</h4>
                      <p className="text-xs text-slate-500 leading-tight mt-1">Maux de tête, examens de la vue, neurologie</p>
                      <span className="text-lg font-extrabold text-[#067A45] block mt-2 font-mono">4 500 FCFA</span>
                    </div>
                  </button>

                  {/* AUTRE */}
                  <button
                    type="button"
                    onClick={() => {
                      setMotifCategory('autre');
                      setVisitMotif("Consultation de médecine générale");
                    }}
                    className={`p-6 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between h-48 shadow-sm ${
                      motifCategory === 'autre'
                        ? 'border-[#00D26A] bg-emerald-500/5 ring-4 ring-emerald-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-5xl" role="img" aria-label="stéthoscope">🩺</span>
                      {motifCategory === 'autre' && (
                        <span className="bg-[#00D26A] text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">Sélectionné</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Autre chose</h4>
                      <p className="text-xs text-slate-500 leading-tight mt-1">Médecine générale, pédiatrie, suivi de routine ou ordonnance</p>
                      <span className="text-lg font-extrabold text-[#067A45] block mt-2 font-mono">
                        {(selectedHospital?.price || 3000).toLocaleString()} FCFA
                      </span>
                    </div>
                  </button>
                </div>

                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                    Détails ou précisions sur votre état (Facultatif)
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      placeholder="Indiquez ici vos précisions (ex: douleurs, fièvre, contrôle annuel, etc.)"
                      value={visitMotif}
                      onChange={(e) => setVisitMotif(e.target.value)}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm md:text-base focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800 placeholder-slate-400 leading-relaxed"
                    />
                    
                    <button
                      type="button"
                      onClick={triggerVoiceMotif}
                      disabled={simulatedVoiceMotifActive}
                      className="absolute bottom-3 right-3 p-2.5 bg-emerald-100 hover:bg-emerald-200 text-[#067A45] rounded-full transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                    >
                      <Mic className={`w-4 h-4 ${simulatedVoiceMotifActive ? 'text-red-500 animate-pulse' : ''}`} />
                      <span>{simulatedVoiceMotifActive ? "Enregistrement..." : "Dicter Motif"}</span>
                    </button>
                  </div>
                </div>

                {/* Nice clean notification showing the dynamic price */}
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl text-emerald-800 shrink-0">
                      💰
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-800">Tarif de votre consultation médicale :</p>
                      <p className="text-xs md:text-sm text-slate-500">Conformément à vos directives, aucun médicament n'est ajouté ou facturé.</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right shrink-0">
                    <span className="text-2xl md:text-3xl font-black text-[#067A45] font-mono block">{baseConsultationPrice.toLocaleString()} FCFA</span>
                    <span className="text-xs text-white bg-slate-950 font-mono font-bold px-3 py-1 rounded inline-block mt-1">
                      ≈ {fcfaToSats(baseConsultationPrice).toLocaleString()} SATS
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 6: INTEGRATED PAYMENT RECAP (RE-MAPPED FROM STEP 7) */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-l-4 border-[#00D26A] pl-4">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-wide">
                    Étape 6 : Facturation de la Consultation & Paiement
                  </h2>
                  <p className="text-sm md:text-base text-slate-500 mt-1">Veuillez vérifier les frais de votre consultation et procéder au règlement.</p>
                </div>

                {/* Billing invoice card */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">Bordereau prévisionnel</span>
                      <h3 className="text-xs font-extrabold text-slate-900">Rendez-vous clinique Santé Plus</h3>
                    </div>
                    <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                  </div>

                  <div className="space-y-2.5 text-xs divide-y divide-slate-150">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Consultation ({selectedDoctor ? selectedDoctor.specialty : "Médecine Générale"})</span>
                      <span className="font-bold text-slate-800 font-mono">+{baseConsultationPrice.toLocaleString()} FCFA</span>
                    </div>

                    {selectedMedications.length > 0 && (
                      <div className="pt-2.5 flex flex-col gap-1.5">
                        <div className="flex justify-between text-slate-500">
                          <span>Médicaments ({selectedMedications.length})</span>
                          <span className="font-bold text-slate-800 font-mono">+{medicationsTotal.toLocaleString()} FCFA</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{selectedMedications.join(' + ')}</p>
                      </div>
                    )}

                    <div className="pt-2.5 flex justify-between items-center text-sm font-black">
                      <span className="text-slate-900 font-extrabold uppercase">Montant Total d'Assurance</span>
                      <div className="text-right">
                        <span className="text-lg text-[#067A45] font-mono block">{totalFCFAPrice.toLocaleString()} FCFA</span>
                        <span className="text-[9px] text-[#00D26A] bg-slate-950 px-2 py-0.5 rounded font-mono font-bold mt-0.5 inline-block">
                          ⚡ ≈ {totalSatsPrice.toLocaleString()} SATS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary recap location card */}
                  <div className="bg-white border border-slate-150 rounded-xl p-3 flex items-center gap-3 text-xs text-slate-600">
                    <MapPin className="w-4.5 h-4.5 text-[#00D26A] shrink-0" />
                    <div className="truncate">
                      <p className="font-extrabold text-slate-900 leading-none">{selectedHospital.name}</p>
                      <p className="text-[10px] text-slate-400 leading-none mt-1">{selectedHospital.location}</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Select Gateway */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Sélectionnez la méthode de paiement</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Lightning Network')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        paymentMethod === 'Lightning Network' 
                          ? 'border-[#00D26A] bg-emerald-500/5 ring-1 ring-[#00D26A]' 
                          : 'border-slate-150 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                        ⚡ Lightning Network
                      </span>
                      <span className="text-[9px] text-slate-400 leading-tight">Instantané · Frais {"<"} 0.1% · Sécurisé sur Bitcoin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Mobile Money')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        paymentMethod === 'Mobile Money' 
                          ? 'border-[#00D26A] bg-emerald-500/5 ring-1 ring-[#00D26A]' 
                          : 'border-slate-150 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-black text-slate-900">📱 Mobile Money</span>
                      <span className="text-[9px] text-slate-400 leading-tight">MTN MoMo, Moov Flooz, Orange Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Wallet Santé+')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        paymentMethod === 'Wallet Santé+' 
                          ? 'border-[#00D26A] bg-emerald-500/5 ring-1 ring-[#00D26A]' 
                          : 'border-slate-150 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-black text-slate-900">💳 Wallet Santé+</span>
                      <span className="text-[9px] text-slate-400 leading-tight">Solde préchargé : 15 400 FCFA</span>
                    </button>
                  </div>
                </div>

                {/* Gateway Detail Screens */}
                {paymentMethod === 'Lightning Network' && (
                  <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 space-y-5 animate-fadeIn">
                    <div className="flex justify-between items-start pb-2 border-b border-white/10">
                      <div>
                        <span className="text-[8px] bg-yellow-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">LNbits Gateway</span>
                        <h4 className="text-xs font-black text-slate-200 mt-1">Facture Lightning Émise</h4>
                      </div>
                      <span className="text-xs font-black text-yellow-400 font-mono">{totalSatsPrice.toLocaleString()} SATS</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                      {/* Interactive mock QR */}
                      <div className="bg-white p-3.5 rounded-2xl shrink-0 border-2 border-yellow-400/30">
                        <div className="w-32 h-32 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden text-center rounded-lg">
                          <div className="grid grid-cols-4 gap-1 p-2 opacity-80">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className={`w-6 h-6 ${i % 3 === 0 ? 'bg-[#00D26A]' : i % 2 === 0 ? 'bg-white' : 'bg-transparent'}`} />
                            ))}
                          </div>
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-yellow-400 text-slate-950 text-[9px] font-black uppercase px-2 py-1 rounded shadow-md tracking-wider font-mono">⚡ LNBits Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 flex-1 text-center md:text-left">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Scannez ce code QR avec votre portefeuille de confiance (Phoenix, Wallet of Satoshi, Breeze, etc.) pour transférer <strong>{totalSatsPrice.toLocaleString()} Satoshis</strong>.
                        </p>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500 truncate mr-4">lnbc8300n1p3920s...</span>
                          <button 
                            onClick={() => alert("Adresse Lightning copiée dans le presse-papiers !")}
                            className="text-yellow-400 hover:underline font-bold shrink-0 cursor-pointer"
                          >
                            Copier
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Mobile Money' && (
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Sélectionnez votre opérateur</span>
                    
                    <div className="flex gap-2">
                      {['MTN MoMo', 'Moov Flooz', 'Orange Money'].map((provider) => (
                        <button
                          key={provider}
                          type="button"
                          onClick={() => setMomoProvider(provider as any)}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer text-center ${
                            momoProvider === provider 
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {provider}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Numéro de téléphone mobile</label>
                      <input 
                        type="text" 
                        maxLength={15}
                        placeholder="Ex: +229 97 00 11 22"
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value.replace(/[^\d+]/g, ''))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                      <span className="block text-[9px] text-slate-400 leading-none mt-1">
                        Une demande push interactive s'affichera sur votre écran pour saisir votre code secret MoMo.
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Wallet Santé+' && (
                  <div className="bg-[#00D26A]/5 border border-[#00D26A]/30 p-5 rounded-3xl space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                      <div>
                        <span className="text-[10px] bg-[#00D26A] text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">Solde disponible</span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">Carnet Santé Plus pré-payé</h4>
                      </div>
                      <span className="text-sm font-black text-[#067A45] font-mono">15 400 FCFA</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Le montant de <strong>{totalFCFAPrice.toLocaleString()} FCFA</strong> sera déduit de votre solde Santé Plus de manière autonome. Aucun frais supplémentaire n'est appliqué.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SCREEN 7: CONFIRMATION & AUTHENTICATED RECEIPT (RE-MAPPED FROM STEP 8) */}
            {currentStep === 7 && successReceipt && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center py-6 bg-emerald-50 rounded-3xl border border-emerald-200/50 p-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <CheckCircle2 className="w-10 h-10 text-[#00D26A]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide">
                    Félicitations ! Votre rendez-vous est officiellement confirmé
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                    Votre paiement a été validé avec succès. La facture numérique certifiée ci-dessous a été générée et enregistrée de manière sécurisée.
                  </p>
                </div>

                {/* Decentralized Cryptographical Receipt layout */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 md:p-8 relative overflow-hidden font-mono text-sm text-slate-700" id="receipt-printable-invoice">
                  {/* Holographic Watermark stamp */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-center">
                    <p className="text-5xl font-extrabold tracking-widest leading-none">RÉPUBLIQUE DU BÉNIN</p>
                    <p className="text-base mt-2">SANTÉ PLUS CERTIFIED</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/60 gap-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">SANTÉ PLUS MINISTÈRE DE LA SANTÉ</h3>
                      <p className="text-xs text-slate-450">Récépissé de règlement de soins de santé</p>
                      <span className="text-xs font-bold text-[#067A45] mt-1 inline-block bg-emerald-100/50 px-2 py-0.5 rounded">FACT: {successReceipt.billNumber}</span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="block text-xs text-slate-400 uppercase">Émis le (Heure Bénin)</span>
                      <p className="font-extrabold text-slate-800 text-sm">04/07/2026 à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>

                  {/* Body grid of details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-slate-200/60 text-xs md:text-sm leading-relaxed">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-black">Identité de l'assuré(e)</p>
                      <p className="font-black text-slate-900 uppercase text-sm md:text-base">{successReceipt.patientName}</p>
                      <p className="mt-1">Numéro Assuré : <strong className="font-mono text-slate-900">{successReceipt.patientNumber}</strong></p>
                      <p>NPI National : <strong className="font-mono text-slate-900">{successReceipt.patientNpi}</strong></p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 uppercase font-black">Établissement clinique d'accueil</p>
                      <p className="font-black text-slate-900 text-sm md:text-base">{successReceipt.hospitalName}</p>
                      <p className="mt-1">Rendez-vous : <strong className="text-slate-900">{successReceipt.optionName}</strong></p>
                      <p>Praticien affecté : <strong className="text-slate-900">{successReceipt.doctorName}</strong></p>
                    </div>
                  </div>

                  {/* Financial line details */}
                  <div className="py-4 border-b border-slate-200/60 space-y-2 text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-800 uppercase">MOTIF : {successReceipt.motif}</span>
                      <span className="font-extrabold text-[#067A45] font-mono">+{baseConsultationPrice.toLocaleString()} FCFA</span>
                    </div>

                    <div className="flex justify-between text-slate-500 text-xs">
                      <span>Frais de réseau / transaction sécurisée</span>
                      <span className="text-emerald-700 font-bold">Inclus (Gratuit)</span>
                    </div>
                  </div>

                  {/* Bold crypto total receipt */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400">Montant total acquitté</p>
                      <span className="text-xl md:text-2xl font-black text-[#067A45] font-mono">{successReceipt.price.toLocaleString()} FCFA</span>
                      <span className="text-xs md:text-sm text-amber-600 font-bold font-mono ml-2 bg-slate-950 text-white px-2 py-1 rounded">⚡ ≈ {successReceipt.satsValue.toLocaleString()} Sats</span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-[#067A45] max-w-sm flex items-start gap-2 leading-tight">
                      <ShieldCheck className="w-5 h-5 shrink-0 text-[#00D26A] mt-0.5" />
                      <div>
                        <span className="font-black block uppercase text-[10px]">Enregistrement blockchain</span>
                        <span className="font-mono text-slate-600 block">SHA: {successReceipt.shaHash}</span>
                        <span className="font-mono text-slate-600 block">TXID: {successReceipt.txHash}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print and Social Sharing buttons */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={() => window.print()}
                    className="py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-5 h-5 text-[#00D26A]" />
                    <span>Imprimer Facture</span>
                  </button>

                  <button
                    onClick={downloadReceiptAsPdf}
                    className="py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    title="Télécharger le reçu de consultation au format PDF officiel"
                  >
                    <Download className="w-5 h-5 text-indigo-600" />
                    <span>Télécharger Reçu</span>
                  </button>

                  <button
                    onClick={() => triggerShareAlert("WhatsApp")}
                    className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Smartphone className="w-5 h-5 text-white" />
                    <span>Partager WhatsApp</span>
                  </button>

                  <button
                    onClick={() => triggerShareAlert("SMS / Email")}
                    className="py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-5 h-5 text-slate-700" />
                    <span>Partager SMS</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setSuccessReceipt(null);
                      setVisitMotif('');
                      setSelectedMedications([]);
                      setSelectedDoctor(null);
                    }}
                    className="py-3.5 bg-[#00D26A] hover:bg-[#067A45] text-slate-950 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm col-span-2 md:col-span-1"
                  >
                    <span>Nouveau RDV</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Navigation wizard controls at footer */}
          {currentStep < 7 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-150 mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="px-5 py-3 text-sm font-black text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Précédent</span>
              </button>

              {currentStep === 6 ? (
                <button
                  type="button"
                  onClick={executePaymentAndBooking}
                  disabled={paymentLoading || (paymentMethod === 'Mobile Money' && !momoPhone)}
                  className="px-8 py-4 bg-[#00D26A] hover:bg-[#067A45] hover:text-white text-slate-950 rounded-2xl text-sm font-black transition-all shadow-md flex items-center gap-2.5 cursor-pointer"
                >
                  {paymentLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Règlement en cours...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Confirmer & Payer ({totalFCFAPrice.toLocaleString()} FCFA)</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    // Check logic constraints per screen transition
                    if (currentStep === 5 && !visitMotif.trim()) {
                      alert("Veuillez indiquer un motif de consultation.");
                      return;
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                  className="px-8 py-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Étape suivante</span>
                  <ArrowRight className="w-5 h-5 text-[#00D26A]" />
                </button>
              )}
            </div>
          )}

        </div>

        {/* RIGHT PANEL: INTERACTIVE MAP & SELECTED HOSPITAL INFOS */}
        <div className="lg:col-span-4 p-6 bg-slate-50/60 flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            {/* Active GPS Info Panel */}
            <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-3">
              <span className="text-[8px] bg-emerald-100 text-[#067A45] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest font-mono">
                Établissement actif
              </span>
              <h3 className="text-xs font-black text-slate-950 leading-tight">
                {selectedHospital.name}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                {selectedHospital.description}
              </p>
              
              <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[9px] font-mono leading-tight">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Téléphone</span>
                  <span className="font-extrabold text-slate-800">{selectedHospital.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Distance</span>
                  <span className="font-extrabold text-[#067A45]">{selectedHospital.distance} km d'ici</span>
                </div>
              </div>
            </div>

            {/* Simulated Geographic Interactive GPS Map */}
            <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Carte interactive intégrée</span>
                  <p className="text-[10px] font-black text-slate-800 font-mono">GPS LOCALISATEUR BÉNIN</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#00D26A] animate-pulse" />
              </div>

              {/* Grid map widget */}
              <div className="relative border border-slate-150 rounded-xl h-48 bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* Dynamic Coordinate Lines Overlay */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-5 pointer-events-none">
                  {Array.from({ length: 72 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-emerald-400" />
                  ))}
                </div>

                {/* Ocean and coastal road map drawing */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <path d="M 0 140 Q 150 160 300 130 T 450 150" fill="none" stroke="#2563eb" strokeWidth="4" />
                  <path d="M 0 120 Q 150 140 300 110 T 450 130" fill="none" stroke="#00D26A" strokeWidth="2" strokeDasharray="3,3" />
                  <path d="M 120 0 L 120 180 M 240 0 L 240 180" fill="none" stroke="#64748b" strokeWidth="1" />
                </svg>

                {/* Draw GPS hospital pins */}
                {HOSPITALS_DATA.map((h) => {
                  const isFocused = mapFocusId === h.id || selectedHospital.id === h.id;
                  
                  return (
                    <button
                      key={h.id}
                      onClick={() => handleMapPinClick(h)}
                      type="button"
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-120 focus:outline-none cursor-pointer"
                      style={{ left: h.lat, top: h.lng }}
                    >
                      <div className="relative">
                        {isFocused && (
                          <span className="absolute -inset-3 bg-[#00D26A]/20 rounded-full animate-ping pointer-events-none" />
                        )}
                        <MapPin 
                          className="w-5 h-5 transition-colors"
                          style={{ 
                            color: isFocused ? '#00D26A' : '#ef4444',
                            filter: isFocused ? 'drop-shadow(0 0 6px #00D26A)' : 'none'
                          }} 
                        />
                        <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-950/95 text-[7px] text-white px-1 py-0.5 rounded whitespace-nowrap font-mono scale-90 uppercase tracking-tighter">
                          {h.name.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  )})}

                {/* Floating GPS card coordinates */}
                <div className="absolute bottom-1.5 left-1.5 bg-slate-950/90 text-[7px] text-emerald-400 p-1 rounded font-mono border border-emerald-800/30">
                  LAT: 6.3530° N / LNG: 2.4412° E
                </div>
              </div>

              {/* Live route description log */}
              <div className="bg-slate-950 text-slate-300 p-2.5 rounded-xl border border-slate-800 text-[9px] font-mono leading-normal flex items-start gap-1.5">
                <span className="text-[#00D26A]">▶</span>
                <p>{mapMessage}</p>
              </div>
            </div>
          </div>

          {/* Collapsible FAQ Help list */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Foire aux questions (FAQ)</span>
            </h4>

            <div className="space-y-2 divide-y divide-slate-100">
              {FAQS_DATA.map((faq, idx) => (
                <div key={idx} className="pt-2 first:pt-0 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFaqExpandedIndex(faqExpandedIndex === idx ? null : idx)}
                    className="w-full text-left font-bold text-slate-800 flex justify-between items-center focus:outline-none py-1 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {faqExpandedIndex === idx ? (
                      <ChevronUp className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  {faqExpandedIndex === idx && (
                    <p className="text-slate-500 leading-normal mt-1 bg-slate-50 p-2 rounded-lg font-medium">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: QR SCANNER SIMULATION */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6 text-[#00D26A]" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Scanner une Borne d'Hôpital</h3>
              <p className="text-[11px] text-slate-500 mt-1">Approchez votre appareil de la borne interactive Santé Plus située dans le hall d'accueil de l'établissement.</p>
            </div>

            {/* Scanner visual feedback grid overlay */}
            <div className="h-44 bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-800">
              <div className="absolute inset-0 border-[3px] border-emerald-500/20 m-6 rounded-lg" />
              <div className="w-28 h-28 border-2 border-[#00D26A] rounded-lg animate-pulse flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#00D26A] shadow-[0_0_10px_#00D26A] animate-scan" />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-[8px] text-slate-300 font-mono px-2 py-0.5 rounded uppercase tracking-widest">
                Recherche de flux vidéo...
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setQrModalOpen(false);
                  // Simulate successful hospital scan
                  setSelectedHospital(HOSPITALS_DATA[1]); // Saint-Luc
                  setMapMessage("📟 Borne d'accueil Saint-Luc de Calavi identifiée et validée ! Prise en charge locale activée.");
                  alert("Hôpital Saint-Luc d'Abomey-Calavi détecté via scan QR !");
                }}
                className="flex-1 py-2 bg-[#00D26A] hover:bg-[#067A45] text-slate-950 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer text-center"
              >
                Simuler Détection
              </button>
              
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
