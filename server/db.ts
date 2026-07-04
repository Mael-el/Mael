import fs from 'fs';
import path from 'path';
import { hashPassword, encryptData, decryptData, sha256 } from './crypto';

const DB_FILE = path.join(process.cwd(), 'data', 'sante_plus_db.json');

// Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'patient' | 'doctor' | 'admin';
  name: string;
  hospitalName?: string;
  licenseNumber?: string;
  phone?: string;
  npi?: string;
  patientNumber?: string;
  createdAt: string;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
}

export interface BlockchainAnchor {
  hash: string;
  txId: string;
  blockHeight: number;
  anchoredAt: string;
  status: 'pending' | 'anchored';
}

export interface PatientDossier {
  patientId: string;
  bloodType: string;
  allergies: string[];
  medicalHistory: {
    id: string;
    date: string;
    doctorName: string;
    diagnosis: string;
    treatment: string;
    hospital: string;
  }[];
  activeTreatments: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  consentPin: string; // Used to authorize doctor decryption
  blockchainAnchor?: BlockchainAnchor;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  treatment: string;
  hospital: string;
  billingAmount: number; // in FCFA or sats
  paymentStatus: 'pending' | 'paid';
  lightningInvoice?: string;
  paymentHash?: string;
  createdAt: string;
}

export interface Tontine {
  id: string;
  name: string;
  description: string;
  targetAmount: number; // in FCFA
  currentAmount: number;
  contributionAmount: number;
  cycleDays: number;
  members: {
    patientId: string;
    name: string;
    joinedAt: string;
  }[];
  contributions: {
    id: string;
    patientId: string;
    patientName: string;
    amount: number;
    date: string;
    txHash?: string; // Lightning payment hash
  }[];
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  bloodType: string;
  hospital: string;
  location: string;
  urgency: 'high' | 'medium' | 'low';
  unitsNeeded: number;
  unitsReceived: number;
  status: 'active' | 'fulfilled';
  phone: string;
  createdAt: string;
}

export interface Vaccination {
  id: string;
  patientId: string;
  vaccineName: string;
  dateAdministered: string;
  doseNumber: number;
  hospital: string;
  batchNumber: string;
  blockchainVerified: boolean;
  txId?: string;
  nextDoseDate?: string;
  createdAt: string;
}

export interface AuthorizationRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  patientId: string;
  patientName: string;
  patientNpi: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientNpi: string;
  patientNumber: string;
  hospitalId: string;
  hospitalName: string;
  hospitalLocation: string;
  hospitalPhone: string;
  optionName: string;
  medications: string[];
  doctorId?: string;
  doctorName?: string;
  appointmentType: string;
  price: number;
  paymentMethod: 'HLB' | 'EasyPay' | 'Blink' | 'MoMo' | 'Lay Network';
  paymentStatus: 'paid';
  billNumber: string;
  date: string;
  createdAt: string;
}

interface DBStructure {
  users: User[];
  dossiers: Record<string, EncryptedData>; // Keyed by patientId
  dossiersMetadata: Record<string, { consentPinHash: string; updatedAt: string; blockchainAnchor?: BlockchainAnchor }>; // To store non-sensitive queryable metadata
  consultations: Consultation[];
  tontines: Tontine[];
  bloodRequests: BloodRequest[];
  vaccinations: Vaccination[];
  authRequests: AuthorizationRequest[];
  appointments?: Appointment[];
}

const defaultDB: DBStructure = {
  users: [],
  dossiers: {},
  dossiersMetadata: {},
  consultations: [],
  tontines: [],
  bloodRequests: [],
  vaccinations: [],
  authRequests: [],
  appointments: []
};

// Initialize DB and folder
export function initDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    writeDB(defaultDB);
    seedDB();
  }
}

export function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initDB();
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read DB:', error);
    return defaultDB;
  }
}

export function writeDB(db: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write DB:', error);
  }
}

function seedDB() {
  const db = readDB();
  if (db.users.length > 0) return; // Already seeded

  console.log('Seeding Sante Plus local database...');

  // 1. Create Default Users
  const patientPass = hashPassword('password123');
  const patient: User = {
    id: 'u_patient1',
    email: 'patient@sante.bj',
    passwordHash: patientPass.hash,
    salt: patientPass.salt,
    role: 'patient',
    name: 'Koffi Mensah',
    phone: '+229 97 00 11 22',
    npi: '100120264021',
    patientNumber: 'SP-2026-1004',
    createdAt: new Date().toISOString()
  };

  const doctorPass = hashPassword('password123');
  const doctor: User = {
    id: 'u_doctor1',
    email: 'doctor@sante.bj',
    passwordHash: doctorPass.hash,
    salt: doctorPass.salt,
    role: 'doctor',
    name: 'Dr. Chantal Houngbo',
    hospitalName: 'CNHU-HKM Cotonou',
    licenseNumber: 'CNMB-2026-4029',
    phone: '+229 95 33 44 55',
    createdAt: new Date().toISOString()
  };

  const adminPass = hashPassword('admin123');
  const admin: User = {
    id: 'u_admin1',
    email: 'admin@sante.bj',
    passwordHash: adminPass.hash,
    salt: adminPass.salt,
    role: 'admin',
    name: 'Directeur Ministère de la Santé',
    phone: '+229 21 30 01 12',
    createdAt: new Date().toISOString()
  };

  db.users.push(patient, doctor, admin);

  // 2. Create Patient Dossier with sample medical records
  const sampleDossier: PatientDossier = {
    patientId: 'u_patient1',
    bloodType: 'O+',
    allergies: ['Pénicilline', 'Arachides'],
    activeTreatments: ['Coartem 80/480mg (Paludisme - Fin de traitement)'],
    medicalHistory: [
      {
        id: 'h_1',
        date: '2026-05-10',
        doctorName: 'Dr. Chantal Houngbo',
        diagnosis: 'Paludisme simple à Plasmodium falciparum',
        treatment: 'Coartem (Artéméther/Luméfantrine) sur 3 jours + Paracétamol',
        hospital: 'CNHU-HKM Cotonou'
      },
      {
        id: 'h_2',
        date: '2025-11-14',
        doctorName: 'Dr. Amoussou Jean',
        diagnosis: 'Bronchite aiguë',
        treatment: 'Sirop expectorant, Repos, Hydratation intense',
        hospital: 'Hôpital de zone de Calavi'
      }
    ],
    emergencyContact: {
      name: 'Abla Mensah',
      phone: '+229 96 11 22 33',
      relation: 'Épouse'
    },
    consentPin: '1234', // Patient consent PIN
    updatedAt: new Date().toISOString()
  };

  // Encrypt the dossier data
  const encryptedDossier = encryptData(JSON.stringify(sampleDossier));
  db.dossiers['u_patient1'] = encryptedDossier;

  // Store metadata
  const pinHash = hashPassword('1234');
  
  // Set up mock blockchain anchor for initial patient dossier
  const fileHash = sha256(JSON.stringify(sampleDossier));
  const sampleAnchor: BlockchainAnchor = {
    hash: fileHash,
    txId: 'b09d6f851722d3e4cf6b0488f7bfa97914f68e0d9b5463ad1e7a5c88ea7b7bfd',
    blockHeight: 841203,
    anchoredAt: '2026-05-10T11:45:00Z',
    status: 'anchored'
  };

  db.dossiersMetadata['u_patient1'] = {
    consentPinHash: pinHash.hash,
    updatedAt: sampleDossier.updatedAt,
    blockchainAnchor: sampleAnchor
  };

  // 3. Add Sample Consultations
  db.consultations.push({
    id: 'c_1',
    patientId: 'u_patient1',
    patientName: 'Koffi Mensah',
    doctorId: 'u_doctor1',
    doctorName: 'Dr. Chantal Houngbo',
    date: '2026-05-10',
    diagnosis: 'Paludisme simple à Plasmodium falciparum',
    treatment: 'Coartem (Artéméther/Luméfantrine) sur 3 jours + Paracétamol',
    hospital: 'CNHU-HKM Cotonou',
    billingAmount: 5500, // 5500 FCFA
    paymentStatus: 'paid',
    paymentHash: 'lightning_hash_mock_123849102834091832049182309481230948',
    createdAt: '2026-05-10T10:00:00Z'
  });

  // 4. Add Sample Tontines (Health Cooperatives)
  db.tontines.push({
    id: 't_1',
    name: 'Tontine Solidarité Cotonou',
    description: 'Fonds d\'urgence médicale collective pour les commerçantes du marché Dantokpa.',
    targetAmount: 500000,
    currentAmount: 180000,
    contributionAmount: 5000,
    cycleDays: 30,
    members: [
      { patientId: 'u_patient1', name: 'Koffi Mensah', joinedAt: '2026-01-15T08:00:00Z' },
      { patientId: 'u_m2', name: 'Amina Soglo', joinedAt: '2026-01-20T09:30:00Z' },
      { patientId: 'u_m3', name: 'Marc Tokpo', joinedAt: '2026-02-01T14:15:00Z' }
    ],
    contributions: [
      { id: 'ct_1', patientId: 'u_patient1', patientName: 'Koffi Mensah', amount: 5000, date: '2026-06-01T10:30:00Z', txHash: 'tx_lightning_t_1' },
      { id: 'ct_2', patientId: 'u_m2', patientName: 'Amina Soglo', amount: 5000, date: '2026-06-02T11:00:00Z', txHash: 'tx_lightning_t_2' },
      { id: 'ct_3', patientId: 'u_m3', patientName: 'Marc Tokpo', amount: 5000, date: '2026-06-05T09:15:00Z', txHash: 'tx_lightning_t_3' }
    ],
    createdAt: '2026-01-10T12:00:00Z'
  });

  db.tontines.push({
    id: 't_2',
    name: 'Tontine Santé Calavi Enseignants',
    description: 'Couverture collective des examens de laboratoire complexes et actes chirurgicaux mineurs.',
    targetAmount: 1200000,
    currentAmount: 640000,
    contributionAmount: 10000,
    cycleDays: 30,
    members: [
      { patientId: 'u_patient1', name: 'Koffi Mensah', joinedAt: '2026-02-10T10:00:00Z' }
    ],
    contributions: [
      { id: 'ct_4', patientId: 'u_patient1', patientName: 'Koffi Mensah', amount: 10000, date: '2026-05-25T16:00:00Z', txHash: 'tx_lightning_t_4' }
    ],
    createdAt: '2026-02-01T08:00:00Z'
  });

  // 5. Add Sample Blood Donor Requests
  db.bloodRequests.push({
    id: 'b_1',
    bloodType: 'O-',
    hospital: 'CNHU-HKM Cotonou',
    location: 'Service des Urgences, Bloc A',
    urgency: 'high',
    unitsNeeded: 3,
    unitsReceived: 1,
    status: 'active',
    phone: '+229 97 40 50 60',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString() // 4 hours ago
  });

  db.bloodRequests.push({
    id: 'b_2',
    bloodType: 'B+',
    hospital: 'Hôpital Saint-Luc de Cotonou',
    location: 'Maternité',
    urgency: 'medium',
    unitsNeeded: 2,
    unitsReceived: 2,
    status: 'fulfilled',
    phone: '+229 95 12 34 56',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString() // 24 hours ago
  });

  // 6. Add Sample Vaccination Records
  db.vaccinations.push({
    id: 'v_1',
    patientId: 'u_patient1',
    vaccineName: 'Fièvre Jaune (Stamaril)',
    dateAdministered: '2025-04-12',
    doseNumber: 1,
    hospital: 'Centre de Santé de Cotonou 1',
    batchNumber: 'YF-9482-BJ',
    blockchainVerified: true,
    txId: 'aa11bb22cc33dd44ee55ff667788990011223344556677889900aabbccddeeff',
    createdAt: '2025-04-12T09:00:00Z'
  });

  db.vaccinations.push({
    id: 'v_2',
    patientId: 'u_patient1',
    vaccineName: 'Hépatite B (Engerix-B)',
    dateAdministered: '2026-03-01',
    doseNumber: 1,
    hospital: 'Clinique Mahouna',
    batchNumber: 'HB-0492-BJ',
    blockchainVerified: true,
    txId: '223344556677889900aabbccddeeff0011223344556677889900aabbccddeeff',
    nextDoseDate: '2026-10-01',
    createdAt: '2026-03-01T11:00:00Z'
  });

  writeDB(db);
  console.log('Sante Plus local database successfully seeded.');
}
