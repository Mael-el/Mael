import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  initDB, 
  readDB, 
  writeDB, 
  User, 
  PatientDossier, 
  BlockchainAnchor 
} from "./server/db";
import { 
  hashPassword, 
  encryptData, 
  decryptData, 
  sha256, 
  generateToken 
} from "./server/crypto";
import { getClinicalSummary } from "./server/gemini";

// Initialize database
initDB();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory active sessions store
const sessions: Record<string, { userId: string; role: string; name: string }> = {};

// Helper: authenticate request
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !sessions[token]) {
    res.status(401).json({ error: "Session expirée ou non autorisée" });
    return;
  }
  (req as any).user = sessions[token];
  next();
}

// ==========================================
// AUTH API
// ==========================================

// Register
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, role, name, hospitalName, licenseNumber, phone, npi } = req.body;

    if (!email || !password || !role || !name) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
    }

    if (role === "patient" && !npi) {
      res.status(400).json({ error: "Le numéro NPI est obligatoire pour l'inscription patient" });
      return;
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: "Cet email est déjà enregistré" });
      return;
    }

    const { hash, salt } = hashPassword(password);
    const userId = "u_" + Math.random().toString(36).substr(2, 9);
    const patientNumber = role === "patient" ? "SP-2026-" + Math.floor(1000 + Math.random() * 9000) : undefined;

    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash: hash,
      salt,
      role,
      name,
      phone,
      npi: role === "patient" ? npi : undefined,
      patientNumber,
      createdAt: new Date().toISOString()
    };

    if (role === "doctor") {
      newUser.hospitalName = hospitalName || "Hôpital Santé Plus";
      newUser.licenseNumber = licenseNumber || "MOCK-LIC-" + Math.floor(1000 + Math.random() * 9000);
    }

    db.users.push(newUser);

    // If registered as patient, automatically create an empty encrypted dossier
    if (role === "patient") {
      const defaultDossier: PatientDossier = {
        patientId: userId,
        bloodType: "Non spécifié",
        allergies: [],
        medicalHistory: [],
        activeTreatments: [],
        emergencyContact: { name: "", phone: "", relation: "" },
        consentPin: "1234", // Default PIN
        updatedAt: new Date().toISOString()
      };

      const encrypted = encryptData(JSON.stringify(defaultDossier));
      db.dossiers[userId] = encrypted;

      const pinHash = hashPassword("1234");
      db.dossiersMetadata[userId] = {
        consentPinHash: pinHash.hash,
        updatedAt: defaultDossier.updatedAt
      };
    }

    writeDB(db);

    res.status(201).json({ success: true, message: "Compte créé avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

// Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Veuillez fournir un email et un mot de passe" });
      return;
    }

    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      res.status(401).json({ error: "Identifiants incorrects" });
      return;
    }

    const { hash } = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      res.status(401).json({ error: "Identifiants incorrects" });
      return;
    }

    const token = "tok_" + generateToken();
    sessions[token] = { userId: user.id, role: user.role, name: user.name };

    // Format safe response
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        hospitalName: user.hospitalName,
        licenseNumber: user.licenseNumber,
        npi: user.npi,
        patientNumber: user.patientNumber
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur de connexion : " + err.message });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token && sessions[token]) {
    delete sessions[token];
  }
  res.json({ success: true });
});

// Get profile
app.get("/api/auth/profile", authenticate, (req, res) => {
  const session = (req as any).user;
  const db = readDB();
  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    hospitalName: user.hospitalName,
    licenseNumber: user.licenseNumber,
    npi: user.npi,
    patientNumber: user.patientNumber
  });
});

// ==========================================
// PATIENT SEARCH & AUTHORIZATION REQUESTS API
// ==========================================

// Search Patients (For Doctor)
app.get("/api/patients/search", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "doctor") {
      res.status(403).json({ error: "Accès réservé aux professionnels de santé accrédités" });
      return;
    }

    const q = (req.query.q as string || "").toLowerCase().trim();
    if (!q) {
      res.json([]);
      return;
    }

    const db = readDB();
    const results = db.users.filter(u => 
      u.role === "patient" && (
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.npi && u.npi.includes(q)) ||
        (u.patientNumber && u.patientNumber.toLowerCase().includes(q))
      )
    ).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      npi: u.npi,
      patientNumber: u.patientNumber
    }));

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Request Access Authorization (Doctor -> Patient)
app.post("/api/authorization-requests", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "doctor") {
      res.status(403).json({ error: "Accès réservé aux médecins" });
      return;
    }

    const { patientId } = req.body;
    if (!patientId) {
      res.status(400).json({ error: "ID du patient requis" });
      return;
    }

    const db = readDB();
    const patient = db.users.find(u => u.id === patientId && u.role === "patient");
    if (!patient) {
      res.status(404).json({ error: "Patient introuvable" });
      return;
    }

    if (!db.authRequests) {
      db.authRequests = [];
    }

    const existingIndex = db.authRequests.findIndex(r => r.doctorId === session.userId && r.patientId === patientId);
    
    const newRequest = {
      id: existingIndex >= 0 ? db.authRequests[existingIndex].id : "req_" + Math.random().toString(36).substr(2, 9),
      doctorId: session.userId,
      doctorName: session.name,
      hospitalName: session.hospitalName || "Hôpital de Zone",
      patientId,
      patientName: patient.name,
      patientNpi: patient.npi || "",
      status: "pending" as const,
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      db.authRequests[existingIndex] = newRequest;
    } else {
      db.authRequests.push(newRequest);
    }

    writeDB(db);
    res.json({ success: true, request: newRequest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Authorization Requests (For Patient or Doctor)
app.get("/api/authorization-requests/patient", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    const db = readDB();
    if (!db.authRequests) {
      db.authRequests = [];
    }

    if (session.role === "patient") {
      // Patients get requests where they are the target patient
      const list = db.authRequests.filter(r => r.patientId === session.userId);
      res.json(list);
    } else if (session.role === "doctor") {
      // Doctors get requests they sent
      const list = db.authRequests.filter(r => r.doctorId === session.userId);
      res.json(list);
    } else {
      res.status(403).json({ error: "Non autorisé" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Respond to Access Request (Patient approves or declines)
app.post("/api/authorization-requests/:id/respond", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "patient") {
      res.status(403).json({ error: "Accès réservé aux patients" });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (status !== "accepted" && status !== "declined") {
      res.status(400).json({ error: "Statut invalide" });
      return;
    }

    const db = readDB();
    if (!db.authRequests) {
      db.authRequests = [];
    }

    const request = db.authRequests.find(r => r.id === id && r.patientId === session.userId);
    if (!request) {
      res.status(404).json({ error: "Demande d'autorisation introuvable" });
      return;
    }

    request.status = status;
    request.respondedAt = new Date().toISOString();

    writeDB(db);
    res.json({ success: true, request });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check Status of Authorization (For Doctor)
app.get("/api/authorization-requests/status", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "doctor") {
      res.status(403).json({ error: "Accès réservé aux médecins" });
      return;
    }

    const { patientId } = req.query;
    if (!patientId) {
      res.status(400).json({ error: "ID du patient requis" });
      return;
    }

    const db = readDB();
    if (!db.authRequests) {
      db.authRequests = [];
    }

    const request = db.authRequests.find(r => r.doctorId === session.userId && r.patientId === patientId);
    res.json({ request: request || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MEDICAL DOSSIER API
// ==========================================

// Get dossier (Self-Patient)
app.get("/api/dossier/patient", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "patient") {
      res.status(403).json({ error: "Seuls les patients peuvent voir leur propre dossier directement" });
      return;
    }

    const db = readDB();
    const encrypted = db.dossiers[session.userId];
    const metadata = db.dossiersMetadata[session.userId];

    if (!encrypted) {
      res.status(404).json({ error: "Dossier médical introuvable" });
      return;
    }

    const decryptedStr = decryptData(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    const dossier: PatientDossier = JSON.parse(decryptedStr);

    res.json({
      ...dossier,
      blockchainAnchor: metadata?.blockchainAnchor
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur lors du déchiffrement du dossier : " + err.message });
  }
});

// Doctor View (Requires Patient PIN for Decryption) - Explicit consent mechanism
app.post("/api/dossier/doctor/view", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "doctor") {
      res.status(403).json({ error: "Accès réservé aux professionnels de santé accrédités" });
      return;
    }

    const { patientId, consentPin, bypassPinCheck } = req.body;
    if (!patientId) {
      res.status(400).json({ error: "Identifiant du patient requis" });
      return;
    }

    const db = readDB();
    const metadata = db.dossiersMetadata[patientId];
    const encrypted = db.dossiers[patientId];

    if (!encrypted || !metadata) {
      res.status(404).json({ error: "Dossier introuvable pour ce patient" });
      return;
    }

    const decryptedStr = decryptData(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    const dossier: PatientDossier = JSON.parse(decryptedStr);

    let isAuthorized = false;
    if (bypassPinCheck) {
      if (!db.authRequests) db.authRequests = [];
      const hasAuth = db.authRequests.some(r => r.patientId === patientId && r.doctorId === session.userId && r.status === 'accepted');
      if (hasAuth) {
        isAuthorized = true;
      } else {
        res.status(403).json({ error: "Vous n'êtes pas autorisé à consulter ce dossier. Veuillez d'abord faire une demande d'autorisation." });
        return;
      }
    }

    if (!isAuthorized) {
      if (!consentPin) {
        res.status(400).json({ error: "PIN requis" });
        return;
      }
      if (dossier.consentPin !== consentPin) {
        res.status(403).json({ error: "Code PIN de consentement incorrect. Accès refusé par le patient." });
        return;
      }
    }

    const patientUser = db.users.find(u => u.id === patientId);

    res.json({
      patientName: patientUser?.name || "Koffi Mensah",
      patientEmail: patientUser?.email || "patient@sante.bj",
      patientPhone: patientUser?.phone || "",
      dossier: {
        ...dossier,
        blockchainAnchor: metadata.blockchainAnchor
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Échec du chiffrement/déchiffrement ou PIN erroné" });
  }
});

// Doctor updates/adds medical act (CRUD)
app.post("/api/dossier/doctor/add-history", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "doctor") {
      res.status(403).json({ error: "Accès réservé aux médecins" });
      return;
    }

    const { patientId, consentPin, bypassPinCheck, diagnosis, treatment, bloodType, allergies, activeTreatments } = req.body;

    const db = readDB();
    const encrypted = db.dossiers[patientId];
    if (!encrypted) {
      res.status(404).json({ error: "Dossier médical introuvable" });
      return;
    }

    const decryptedStr = decryptData(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    const dossier: PatientDossier = JSON.parse(decryptedStr);

    let isAuthorized = false;
    if (bypassPinCheck) {
      if (!db.authRequests) db.authRequests = [];
      isAuthorized = db.authRequests.some(r => r.patientId === patientId && r.doctorId === session.userId && r.status === 'accepted');
    }

    if (!isAuthorized) {
      if (dossier.consentPin !== consentPin) {
        res.status(403).json({ error: "PIN incorrect. Modification refusée." });
        return;
      }
    }

    // Update dossier
    if (bloodType) dossier.bloodType = bloodType;
    if (allergies) dossier.allergies = allergies;
    if (activeTreatments) dossier.activeTreatments = activeTreatments;

    // Add consultation entry
    if (diagnosis || treatment) {
      dossier.medicalHistory.unshift({
        id: "h_" + Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split("T")[0],
        doctorName: session.name,
        diagnosis: diagnosis || "Observation générale",
        treatment: treatment || "Conseils d'usage",
        hospital: db.users.find(u => u.id === session.userId)?.hospitalName || "Hôpital Sante Plus"
      });
    }

    dossier.updatedAt = new Date().toISOString();

    // Re-encrypt updated dossier at rest (AES-256)
    const newEncrypted = encryptData(JSON.stringify(dossier));
    db.dossiers[patientId] = newEncrypted;

    // Update metadata
    if (!db.dossiersMetadata[patientId]) {
      db.dossiersMetadata[patientId] = {
        consentPinHash: hashPassword(consentPin).hash,
        updatedAt: dossier.updatedAt
      };
    } else {
      db.dossiersMetadata[patientId].updatedAt = dossier.updatedAt;
    }

    writeDB(db);
    res.json({ success: true, dossier });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur de mise à jour du dossier : " + err.message });
  }
});

// Update PIN
app.post("/api/dossier/patient/update-pin", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "patient") {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }

    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin) {
      res.status(400).json({ error: "Ancien et nouveau PIN requis" });
      return;
    }

    const db = readDB();
    const encrypted = db.dossiers[session.userId];
    const decryptedStr = decryptData(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    const dossier: PatientDossier = JSON.parse(decryptedStr);

    if (dossier.consentPin !== oldPin) {
      res.status(400).json({ error: "Ancien code PIN incorrect" });
      return;
    }

    dossier.consentPin = newPin;
    dossier.updatedAt = new Date().toISOString();

    db.dossiers[session.userId] = encryptData(JSON.stringify(dossier));
    db.dossiersMetadata[session.userId].consentPinHash = hashPassword(newPin).hash;
    db.dossiersMetadata[session.userId].updatedAt = dossier.updatedAt;

    writeDB(db);
    res.json({ success: true, message: "Code PIN de consentement mis à jour !" });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

// ==========================================
// BLOCKCHAIN TIMESTAMPING (ANCHORING) API
// ==========================================

// Anchor dossier on Bitcoin Testnet (OP_RETURN via Blockstream API simulation)
app.post("/api/dossier/anchor", authenticate, async (req, res) => {
  try {
    const session = (req as any).user;
    const { patientId } = req.body;

    const targetPatientId = patientId || session.userId;
    const db = readDB();
    const encrypted = db.dossiers[targetPatientId];

    if (!encrypted) {
      res.status(404).json({ error: "Dossier introuvable" });
      return;
    }

    // Get the clean plaintext dossier JSON to calculate the authentic hash
    const decryptedStr = decryptData(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    const dossier: PatientDossier = JSON.parse(decryptedStr);

    // Calculate cryptographic integrity SHA-256 hash (no clinical data goes on chain)
    const cleanDossierForHash = {
      patientId: dossier.patientId,
      bloodType: dossier.bloodType,
      allergies: dossier.allergies,
      medicalHistory: dossier.medicalHistory,
      activeTreatments: dossier.activeTreatments
    };
    const dossierHash = sha256(JSON.stringify(cleanDossierForHash));

    // Simulate standard OP_RETURN anchoring via Blockstream Testnet API
    const mockTxId = sha256(dossierHash + Date.now().toString());
    const mockHeight = 842000 + Math.floor(Math.random() * 5000);

    const anchor: BlockchainAnchor = {
      hash: dossierHash,
      txId: mockTxId,
      blockHeight: mockHeight,
      anchoredAt: new Date().toISOString(),
      status: "anchored"
    };

    // Store in metadata
    if (!db.dossiersMetadata[targetPatientId]) {
      db.dossiersMetadata[targetPatientId] = {
        consentPinHash: hashPassword(dossier.consentPin).hash,
        updatedAt: dossier.updatedAt
      };
    }
    db.dossiersMetadata[targetPatientId].blockchainAnchor = anchor;
    writeDB(db);

    res.json({
      success: true,
      message: "Horodatage ancré avec succès sur Bitcoin Testnet (OP_RETURN)",
      anchor
    });
  } catch (err: any) {
    res.status(500).json({ error: "Échec de l'ancrage blockchain : " + err.message });
  }
});

// ==========================================
// LIGHTNING NETWORK PAYMENT API (MOCK / LNBITS TESTNET)
// ==========================================

// Create invoice (FCFA to satoshis)
app.post("/api/lightning/invoice", (req, res) => {
  try {
    const { amountFcfa, description } = req.body;
    if (!amountFcfa) {
      res.status(400).json({ error: "Montant FCFA requis" });
      return;
    }

    // Rate: 1 FCFA = 2 satoshis (simulated hackathon rate)
    const satoshis = Math.round(amountFcfa * 2);
    const paymentHash = sha256("lh_" + Math.random().toString() + Date.now().toString());
    
    // Standard-looking Bolt11 Lightning Invoice format
    const invoice = `lnbc${satoshis}u1p3${paymentHash.substring(0, 20)}spsp9q9q...`;

    res.json({
      invoice,
      paymentHash,
      satoshis,
      amountFcfa,
      description: description || "Paiement Santé Plus"
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur de facturation Lightning" });
  }
});

// Simulate Lightning Invoice Payment (Webhook/trigger)
app.post("/api/lightning/pay", (req, res) => {
  try {
    const { paymentHash } = req.body;
    if (!paymentHash) {
      res.status(400).json({ error: "Payment Hash requis" });
      return;
    }

    const db = readDB();
    let updated = false;

    // 1. Check consultations
    const cons = db.consultations.find(c => c.paymentHash === paymentHash);
    if (cons) {
      cons.paymentStatus = "paid";
      updated = true;
    }

    // 2. Check tontines contribution
    for (const t of db.tontines) {
      const contrib = t.contributions.find(c => c.txHash === paymentHash);
      if (contrib) {
        // Only credit tontine once
        const isPaid = t.contributions.some(c => c.txHash === paymentHash && c.id === contrib.id && contrib.amount === 0);
        if (contrib.amount > 0) {
          t.currentAmount += contrib.amount;
          updated = true;
        }
      }
    }

    if (updated) {
      writeDB(db);
    }

    res.json({ success: true, message: "Facture Lightning payée et confirmée via canal d'état !" });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur lors du traitement du paiement" });
  }
});

// ==========================================
// CONSULTATIONS API
// ==========================================

app.get("/api/consultations/patient", authenticate, (req, res) => {
  const session = (req as any).user;
  const db = readDB();
  const list = db.consultations.filter(c => c.patientId === session.userId);
  res.json(list);
});

app.get("/api/consultations/doctor", authenticate, (req, res) => {
  const session = (req as any).user;
  const db = readDB();
  const list = db.consultations.filter(c => c.doctorId === session.userId);
  res.json(list);
});

// Record a new consultation (Doctor)
app.post("/api/consultations", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "doctor") {
      res.status(403).json({ error: "Accès médecin uniquement" });
      return;
    }

    const { patientId, patientName, diagnosis, treatment, billingAmount } = req.body;
    const db = readDB();

    const paymentHash = sha256("lh_consult_" + Math.random().toString());
    const satoshis = Math.round(billingAmount * 2);
    const lightningInvoice = `lnbc${satoshis}u1p3_${paymentHash.substring(0, 15)}`;

    const newConsultation = {
      id: "c_" + Math.random().toString(36).substr(2, 9),
      patientId,
      patientName,
      doctorId: session.userId,
      doctorName: session.name,
      date: new Date().toISOString().split("T")[0],
      diagnosis,
      treatment,
      hospital: db.users.find(u => u.id === session.userId)?.hospitalName || "Hôpital Sante Plus",
      billingAmount,
      paymentStatus: "pending" as const,
      lightningInvoice,
      paymentHash,
      createdAt: new Date().toISOString()
    };

    db.consultations.push(newConsultation);
    writeDB(db);

    res.status(201).json(newConsultation);
  } catch (err: any) {
    res.status(500).json({ error: "Erreur d'enregistrement : " + err.message });
  }
});

// ==========================================
// TONTINES (HEALTH COOPERATIVE) API
// ==========================================

app.get("/api/tontines", (req, res) => {
  const db = readDB();
  res.json(db.tontines);
});

app.post("/api/tontines/join", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    const { tontineId } = req.body;

    const db = readDB();
    const tontine = db.tontines.find(t => t.id === tontineId);

    if (!tontine) {
      res.status(404).json({ error: "Tontine introuvable" });
      return;
    }

    const alreadyMember = tontine.members.some(m => m.patientId === session.userId);
    if (alreadyMember) {
      res.status(400).json({ error: "Vous êtes déjà membre de cette tontine" });
      return;
    }

    tontine.members.push({
      patientId: session.userId,
      name: session.name,
      joinedAt: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, tontine });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/tontines/contribute", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    const { tontineId, amount } = req.body;

    const db = readDB();
    const tontine = db.tontines.find(t => t.id === tontineId);

    if (!tontine) {
      res.status(404).json({ error: "Tontine introuvable" });
      return;
    }

    const paymentHash = sha256("lh_tontine_" + Math.random().toString());
    const satoshis = Math.round(amount * 2);
    const invoice = `lnbc${satoshis}u1p3_tontine_${paymentHash.substring(0, 10)}`;

    // Add pending contribution
    tontine.contributions.unshift({
      id: "ct_" + Math.random().toString(36).substr(2, 9),
      patientId: session.userId,
      patientName: session.name,
      amount,
      date: new Date().toISOString(),
      txHash: paymentHash
    });

    writeDB(db);

    res.json({
      invoice,
      paymentHash,
      amount
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/tontines/create", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    const { name, description, targetAmount, contributionAmount } = req.body;

    const db = readDB();
    const newTontine = {
      id: "t_" + Math.random().toString(36).substr(2, 9),
      name,
      description,
      targetAmount,
      currentAmount: 0,
      contributionAmount,
      cycleDays: 30,
      members: [{
        patientId: session.userId,
        name: session.name,
        joinedAt: new Date().toISOString()
      }],
      contributions: [],
      createdAt: new Date().toISOString()
    };

    db.tontines.push(newTontine);
    writeDB(db);
    res.status(201).json(newTontine);
  } catch (err: any) {
    res.status(500).json({ error: "Erreur lors de la création de la tontine" });
  }
});

// ==========================================
// BLOOD DONATION / ALERTS API
// ==========================================

app.get("/api/blood-requests", (req, res) => {
  const db = readDB();
  res.json(db.bloodRequests);
});

app.post("/api/blood-requests", authenticate, (req, res) => {
  try {
    const { bloodType, hospital, location, urgency, unitsNeeded, phone } = req.body;

    const db = readDB();
    const newRequest = {
      id: "b_" + Math.random().toString(36).substr(2, 9),
      bloodType,
      hospital,
      location,
      urgency,
      unitsNeeded,
      unitsReceived: 0,
      status: "active" as const,
      phone,
      createdAt: new Date().toISOString()
    };

    db.bloodRequests.push(newRequest);
    writeDB(db);

    res.status(201).json(newRequest);
  } catch (err: any) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/blood-requests/fulfill", authenticate, (req, res) => {
  try {
    const { requestId, units } = req.body;
    const db = readDB();
    const reqItem = db.bloodRequests.find(b => b.id === requestId);

    if (!reqItem) {
      res.status(404).json({ error: "Demande introuvable" });
      return;
    }

    reqItem.unitsReceived += units || 1;
    if (reqItem.unitsReceived >= reqItem.unitsNeeded) {
      reqItem.status = "fulfilled";
    }

    writeDB(db);
    res.json({ success: true, request: reqItem });
  } catch (err: any) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ==========================================
// VACCINATION CARNET API
// ==========================================

app.get("/api/vaccinations/patient", authenticate, (req, res) => {
  const session = (req as any).user;
  const db = readDB();
  const list = db.vaccinations.filter(v => v.patientId === session.userId);
  res.json(list);
});

app.post("/api/vaccinations", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    const { patientId, vaccineName, doseNumber, hospital, batchNumber, nextDoseDate } = req.body;

    const db = readDB();
    const targetId = patientId || session.userId;

    // Simulate instant secure blockchain registration (OP_RETURN proof)
    const txId = sha256(vaccineName + batchNumber + Date.now().toString());

    const newVaccine = {
      id: "v_" + Math.random().toString(36).substr(2, 9),
      patientId: targetId,
      vaccineName,
      dateAdministered: new Date().toISOString().split("T")[0],
      doseNumber: doseNumber || 1,
      hospital: hospital || "Centre de Santé Béninois",
      batchNumber,
      blockchainVerified: true,
      txId,
      nextDoseDate,
      createdAt: new Date().toISOString()
    };

    db.vaccinations.push(newVaccine);
    writeDB(db);

    res.status(201).json(newVaccine);
  } catch (err: any) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ==========================================
// APPOINTMENT BOOKING API
// ==========================================

app.get("/api/appointments", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    const db = readDB();
    if (!db.appointments) {
      db.appointments = [];
    }
    
    let list = [];
    if (session.role === "patient") {
      list = db.appointments.filter(a => a.patientId === session.userId);
    } else if (session.role === "doctor") {
      list = db.appointments.filter(a => a.doctorId === session.userId);
    } else {
      list = db.appointments;
    }
    
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/appointments", authenticate, (req, res) => {
  try {
    const session = (req as any).user;
    if (session.role !== "patient") {
      res.status(403).json({ error: "Seuls les patients peuvent réserver des rendez-vous" });
      return;
    }

    const { 
      hospitalId, 
      hospitalName, 
      hospitalLocation, 
      hospitalPhone, 
      optionName, 
      medications, 
      doctorId, 
      doctorName, 
      appointmentType, 
      price, 
      paymentMethod,
      date 
    } = req.body;

    if (!hospitalId || !hospitalName || !optionName || !appointmentType || !price || !paymentMethod) {
      res.status(400).json({ error: "Paramètres requis manquants pour la réservation" });
      return;
    }

    const db = readDB();
    const patientUser = db.users.find(u => u.id === session.userId);
    if (!patientUser) {
      res.status(404).json({ error: "Patient introuvable" });
      return;
    }

    const billNumber = "FACT-2026-" + Math.floor(100000 + Math.random() * 900000);
    const newAppointment = {
      id: "apt_" + Math.random().toString(36).substr(2, 9),
      patientId: session.userId,
      patientName: patientUser.name,
      patientNpi: patientUser.npi || "",
      patientNumber: patientUser.patientNumber || "SP-2026-1004",
      hospitalId,
      hospitalName,
      hospitalLocation: hospitalLocation || "République du Bénin",
      hospitalPhone: hospitalPhone || "+229 21 30 01 12",
      optionName,
      medications: medications || [],
      doctorId,
      doctorName,
      appointmentType,
      price: Number(price),
      paymentMethod,
      paymentStatus: "paid" as const,
      billNumber,
      date: date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };

    if (!db.appointments) {
      db.appointments = [];
    }

    db.appointments.push(newAppointment);
    writeDB(db);

    res.status(201).json(newAppointment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// AI MEDICAL DIAGNOSTICS & SUMMARY API
// ==========================================

app.post("/api/ai/diagnose", authenticate, async (req, res) => {
  try {
    const session = (req as any).user;
    const { patientId, consentPin, bypassPinCheck } = req.body;

    const targetPatientId = patientId || session.userId;
    const db = readDB();
    const encrypted = db.dossiers[targetPatientId];

    if (!encrypted) {
      res.status(404).json({ error: "Dossier introuvable" });
      return;
    }

    const decryptedStr = decryptData(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    const dossier: PatientDossier = JSON.parse(decryptedStr);

    let isAuthorized = false;
    if (session.role === "doctor" && bypassPinCheck) {
      if (!db.authRequests) db.authRequests = [];
      isAuthorized = db.authRequests.some(r => r.patientId === targetPatientId && r.doctorId === session.userId && r.status === 'accepted');
    }

    // If professional is querying, verify PIN first
    if (session.role === "doctor" && !isAuthorized) {
      if (dossier.consentPin !== consentPin) {
        res.status(403).json({ error: "PIN incorrect. Accès à l'IA refusé par le patient." });
        return;
      }
    }

    const patientUser = db.users.find(u => u.id === targetPatientId);
    const payload = {
      patientName: patientUser?.name || "Koffi Mensah",
      bloodType: dossier.bloodType,
      allergies: dossier.allergies,
      activeTreatments: dossier.activeTreatments,
      medicalHistory: dossier.medicalHistory
    };

    const result = await getClinicalSummary(payload);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Erreur de l'analyse clinique assistée : " + err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

app.get("/api/admin/stats", authenticate, (req, res) => {
  const session = (req as any).user;
  if (session.role !== "admin") {
    res.status(403).json({ error: "Accès administrateur requis" });
    return;
  }

  const db = readDB();
  const totalPatients = db.users.filter(u => u.role === "patient").length;
  const totalDoctors = db.users.filter(u => u.role === "doctor").length;
  const totalDossiers = Object.keys(db.dossiers).length;
  const totalConsultations = db.consultations.length;
  const paidConsultations = db.consultations.filter(c => c.paymentStatus === "paid").length;
  const totalTontines = db.tontines.length;

  // Aggregate active blood request groups
  const bloodNeeds = db.bloodRequests.filter(b => b.status === "active").length;

  res.json({
    totalPatients,
    totalDoctors,
    totalDossiers,
    totalConsultations,
    paidConsultations,
    totalTontines,
    bloodNeeds
  });
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SANTE PLUS] Backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
