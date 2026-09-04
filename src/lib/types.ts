export type PlayerStatus = "valid" | "suspended" | "revoked";

export type ActivityType = "TAXI" | "VTC" | "TRANSPORT" | "AUTRE";

export interface Player {
  id: string;
  user_id: string;
  qr_token: string;
  card_number: string;
  full_name: string;
  date_of_birth: string | null;
  activity: ActivityType;
  agency: string | null;
  avatar_url: string | null;
  vehicle_plate: string | null;
  vehicle_model: string | null;
  issued_at: string;
  expires_at: string;
  status: PlayerStatus;
  created_at: string;
}

export type NewPlayerInput = Omit<
  Player,
  "id" | "user_id" | "qr_token" | "created_at" | "status"
> & { status?: PlayerStatus };
