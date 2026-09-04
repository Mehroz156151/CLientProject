export const VERIFICATION_LABELS: Record<string, string> = {
  identite: "IDENTITÉ",
  vehicule: "VÉHICULE",
  document: "DOCUMENT",
  taxi: "TAXI",
  vtc: "VTC",
  transport: "TRANSPORT",
  autre: "ACTIVITÉ",
};

export function verificationLabel(type: string): string {
  return VERIFICATION_LABELS[type] ?? type.toUpperCase();
}

export interface VerificationCopy {
  cardTitle: string;
  checklist: string[];
  showVehicle: boolean;
  showCardDetails: boolean;
  // Which checklist entry (if any) should reflect real vehicle-registration
  // status instead of the card's overall status — e.g. a valid card with no
  // vehicle on file still shouldn't show a green check next to "Véhicule".
  vehicleCheckLabel?: string;
}

const COPY: Record<string, VerificationCopy> = {
  identite: {
    cardTitle: "Pièce d'identité",
    checklist: ["Identité", "Document présenté", "Antécédents", "Statut"],
    showVehicle: false,
    showCardDetails: false,
  },
  vehicule: {
    cardTitle: "Contrôle véhicule",
    checklist: ["Immatriculation", "Assurance", "Propriétaire", "Statut"],
    showVehicle: true,
    showCardDetails: false,
    vehicleCheckLabel: "Immatriculation",
  },
  document: {
    cardTitle: "Justificatif",
    checklist: ["Document", "Authenticité", "Validité", "Titulaire"],
    showVehicle: false,
    showCardDetails: false,
  },
};

const DEFAULT_COPY: VerificationCopy = {
  cardTitle: "Carte professionnelle",
  checklist: ["Carte professionnelle", "Identité", "Statut professionnel", "Véhicule"],
  showVehicle: true,
  showCardDetails: true,
  vehicleCheckLabel: "Véhicule",
};

export function verificationCopy(type: string): VerificationCopy {
  return COPY[type] ?? DEFAULT_COPY;
}
