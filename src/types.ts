export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  name: string;
  phone?: string;
  hospitalName?: string;
  licenseNumber?: string;
  npi?: string;
  patientNumber?: string;
}

export interface BlockchainAnchor {
  hash: string;
  txId: string;
  blockHeight: number;
  anchoredAt: string;
  status: 'pending' | 'anchored';
}

export interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  hospital: string;
}

export interface PatientDossier {
  patientId: string;
  bloodType: string;
  allergies: string[];
  medicalHistory: MedicalRecord[];
  activeTreatments: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  consentPin: string;
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
  billingAmount: number;
  paymentStatus: 'pending' | 'paid';
  lightningInvoice?: string;
  paymentHash?: string;
  createdAt: string;
}

export interface Tontine {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
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
    txHash?: string;
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

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalDossiers: number;
  totalConsultations: number;
  paidConsultations: number;
  totalTontines: number;
  bloodNeeds: number;
}
