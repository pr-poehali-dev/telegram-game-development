export const PARTICIPANT_1 = "https://cdn.poehali.dev/projects/3d539b43-1a77-4371-8ab4-b437e1755fa8/files/eb046628-6cac-4cf4-856c-dd7216ba71ef.jpg";
export const PARTICIPANT_2 = "https://cdn.poehali.dev/projects/3d539b43-1a77-4371-8ab4-b437e1755fa8/files/d149bbd6-0fde-4bbc-bd7e-889b9b990c17.jpg";

export const BID_COST = 2;
export const BID_TO_BANK = 1;
export const EXTEND_SECONDS = 15;

export interface Player {
  id: string;
  name: string;
  surname: string;
  avatar: string;
  balance: number;
}

export interface BidEntry {
  playerId: string;
  name: string;
  surname: string;
  avatar: string;
  time: string;
}

export interface Slot {
  id: number;
  label: string;
  initialBank: number;
  bank: number;
  timeLimit: number;
  remainingMs: number;
  holder: Player | null;
  bids: BidEntry[];
  finished: boolean;
  winner: Player | null;
}

export interface RoundResult {
  round: number;
  slots: { label: string; winner: string | null; winnerAvatar: string | null; bank: number }[];
}

export type Tab = "game" | "history";

export const SLOT_CONFIGS = [
  { id: 1, label: "Слот A", initialBank: 4,  timeLimit: 90  },
  { id: 2, label: "Слот B", initialBank: 4,  timeLimit: 90  },
  { id: 3, label: "Слот C", initialBank: 8,  timeLimit: 120 },
  { id: 4, label: "Слот D", initialBank: 10, timeLimit: 120 },
];

export const DEMO_PLAYERS: Player[] = [
  { id: "p1", name: "Александр", surname: "Петров",  avatar: PARTICIPANT_1, balance: 50 },
  { id: "p2", name: "Мария",     surname: "Соколова", avatar: PARTICIPANT_2, balance: 50 },
  { id: "p3", name: "Дмитрий",   surname: "Иванов",   avatar: PARTICIPANT_1, balance: 50 },
  { id: "p4", name: "Елена",     surname: "Новикова", avatar: PARTICIPANT_2, balance: 50 },
];

export function buildSlots(): Slot[] {
  return SLOT_CONFIGS.map((s) => ({
    ...s,
    bank: s.initialBank,
    remainingMs: s.timeLimit * 1000,
    holder: null,
    bids: [],
    finished: false,
    winner: null,
  }));
}

export function formatTime(ms: number) {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function timerClass(ms: number, limit: number) {
  const ratio = ms / (limit * 1000);
  if (ratio < 0.2) return "text-pink neon-pink";
  if (ratio < 0.5) return "text-gold neon-gold";
  return "text-cyan neon-cyan";
}

export function timerBorderClass(ms: number, limit: number) {
  const ratio = ms / (limit * 1000);
  if (ratio < 0.2) return "border-pink/60 bg-pink/10 timer-urgent";
  if (ratio < 0.5) return "border-gold/40 bg-gold/5";
  return "border-cyan/30 bg-cyan/5";
}
