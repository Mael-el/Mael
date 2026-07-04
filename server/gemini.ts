import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client only if key is available, following best practice
let ai: GoogleGenAI | null = null;
const key = process.env.GEMINI_API_KEY;

if (key && key !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

/**
 * Generate an automated clinical summary and medical recommendations.
 * If Gemini API is not configured or fails, it falls back to a highly realistic template-based local system.
 */
export async function getClinicalSummary(dossier: any): Promise<{ summary: string; isAI: boolean }> {
  const patientName = dossier.patientName || "Koffi Mensah";
  const bloodType = dossier.bloodType || "O+";
  const allergies = dossier.allergies || [];
  const activeTreatments = dossier.activeTreatments || [];
  const history = dossier.medicalHistory || [];

  const prompt = `
    En tant que médecin conseil du programme Santé Plus au Bénin, analyse le dossier médical suivant et génère un résumé clinique structuré :
    - Patient : ${patientName}
    - Groupe sanguin : ${bloodType}
    - Allergies connues : ${allergies.join(', ') || 'Aucune'}
    - Traitements actifs : ${activeTreatments.join(', ') || 'Aucun'}
    - Historique des actes médicaux :
      ${history.map((h: any) => `- Date : ${h.date} | Médecin : ${h.doctorName} | Diagnostic : ${h.diagnosis} | Traitement : ${h.treatment} | Hôpital : ${h.hospital}`).join('\n')}

    Formatte ta réponse en français avec :
    1. Résumé synthétique du patient et risques immédiats (ex: allergies).
    2. Analyse des antécédents et compatibilité des traitements en cours.
    3. Recommandations de prévention adaptées au contexte de santé béninois (ex: prévention paludisme, hydratation, etc.).
    Garde un ton très professionnel, clair et axé sur l'aide à la décision pour le médecin traitant.
  `;

  if (ai) {
    const retries = 3;
    let delay = 1000;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (response && response.text) {
          return {
            summary: response.text,
            isAI: true
          };
        }
      } catch (error: any) {
        const isTransient = error?.status === 503 || error?.statusCode === 503 ||
                            error?.status === 429 || error?.statusCode === 429 ||
                            (error?.message && (
                              error.message.includes('503') ||
                              error.message.includes('429') ||
                              error.message.includes('high demand') ||
                              error.message.includes('UNAVAILABLE') ||
                              error.message.includes('ResourceExhausted') ||
                              error.message.includes('overloaded')
                            ));

        if (isTransient && attempt < retries) {
          console.warn(`[Gemini] Model experiencing high demand (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        console.warn(`[Gemini] API execution failed after ${attempt} attempts, falling back to local simulation:`, error?.message || error);
        break;
      }
    }
  }

  // Local fallback simulation (Mock AI)
  const localSummary = `
### 🩺 Résumé Clinique Structuré (Analyse Locale)

**1. Profil de Risque & Alerte Médicale**
- **Groupe Sanguin :** **${bloodType}** (Donneur universel utile, vérifier les stocks pour les urgences).
- **Allergies Critiques :** ${allergies.length > 0 ? `⚠️ **${allergies.join(', ')}**` : 'Aucune allergie signalée.'}
  *Recommandation :* Éviter formellement la prescription de molécules de la famille des ${allergies.includes('Pénicilline') ? 'Bêta-lactamines' : 'allergènes signalés'}.

**2. Analyse Thérapeutique & Antécédents**
- **Traitements en cours :** ${activeTreatments.join(', ') || 'Aucun traitement majeur en cours.'}
- **Historique récent :**
  ${history.length > 0 
    ? `Dernière consultation le **${history[0].date}** pour **${history[0].diagnosis}** traitée par *${history[0].treatment}* à l'établissement *${history[0].hospital}*.`
    : 'Aucun antécédent répertorié dans la base interconnectée.'
  }

**3. Directives de Prévention (Contexte Bénin)**
- **Prévention du Paludisme :** En raison de l'antécédent de paludisme, insister sur l'utilisation stricte de moustiquaires imprégnées d'insecticide (MII) et l'assainissement de l'environnement immédiat pour éviter les gîtes larvaires.
- **Suivi vaccinal :** Recommander au patient de mettre à jour son carnet de vaccination numérique (notamment la Fièvre Jaune et l'Hépatite B, endémiques dans la région).
- **Hydratation :** Conseiller une hydratation abondante en période d'harmattan ou de forte chaleur.
  `;

  return {
    summary: localSummary.trim(),
    isAI: false
  };
}
