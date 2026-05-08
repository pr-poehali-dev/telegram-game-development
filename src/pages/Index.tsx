import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const PARTICIPANT_1 = "https://cdn.poehali.dev/projects/3d539b43-1a77-4371-8ab4-b437e1755fa8/files/eb046628-6cac-4cf4-856c-dd7216ba71ef.jpg";
const PARTICIPANT_2 = "https://cdn.poehali.dev/projects/3d539b43-1a77-4371-8ab4-b437e1755fa8/files/d149bbd6-0fde-4bbc-bd7e-889b9b990c17.jpg";

const BID_COST = 2;
const BID_TO_BANK = 1;
const EXTEND_SECONDS = 15;

interface Player {
  id: string;
  name: string;
  surname: string;
  avatar: string;
  balance: number;
}

interface BidEntry {
  playerId: string;
  name: string;
  surname: string;
  avatar: string;
  time: string;
}

interface Slot {
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

const SLOT_CONFIGS = [
  { id: 1, label: "Слот A", initialBank: 4,  timeLimit: 90  },
  { id: 2, label: "Слот B", initialBank: 4,  timeLimit: 90  },
  { id: 3, label: "Слот C", initialBank: 8,  timeLimit: 120 },
  { id: 4, label: "Слот D", initialBank: 10, timeLimit: 120 },
];

function buildSlots(): Slot[] {
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

function formatTime(ms: number) {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function timerClass(ms: number, limit: number) {
  const ratio = ms / (limit * 1000);
  if (ratio < 0.2) return "text-pink neon-pink";
  if (ratio < 0.5) return "text-gold neon-gold";
  return "text-cyan neon-cyan";
}

function timerBorderClass(ms: number, limit: number) {
  const ratio = ms / (limit * 1000);
  if (ratio < 0.2) return "border-pink/60 bg-pink/10 timer-urgent";
  if (ratio < 0.5) return "border-gold/40 bg-gold/5";
  return "border-cyan/30 bg-cyan/5";
}

const DEMO_PLAYERS: Player[] = [
  { id: "p1", name: "Александр", surname: "Петров",  avatar: PARTICIPANT_1, balance: 50 },
  { id: "p2", name: "Мария",     surname: "Соколова", avatar: PARTICIPANT_2, balance: 50 },
  { id: "p3", name: "Дмитрий",   surname: "Иванов",   avatar: PARTICIPANT_1, balance: 50 },
  { id: "p4", name: "Елена",     surname: "Новикова", avatar: PARTICIPANT_2, balance: 50 },
];

type Tab = "game" | "history";

interface RoundResult {
  round: number;
  slots: { label: string; winner: string | null; winnerAvatar: string | null; bank: number }[];
}

function SlotCard({
  slot,
  currentPlayer,
  onBid,
  blockedSlots,
}: {
  slot: Slot;
  currentPlayer: Player | null;
  onBid: (slotId: number) => void;
  blockedSlots: number[];
}) {
  const isHolder  = !!(currentPlayer && slot.holder?.id === currentPlayer.id);
  const isBlocked = !!(currentPlayer && blockedSlots.includes(slot.id));
  const canBid    = !!(currentPlayer && !isHolder && !isBlocked && !slot.finished && slot.remainingMs > 0 && currentPlayer.balance >= BID_COST);
  const ratio     = slot.remainingMs / (slot.timeLimit * 1000);

  return (
    <div className={`card-glass rounded-2xl flex flex-col transition-all duration-300 ${
      isHolder ? "border-gold/50 glow-gold" : slot.finished ? "opacity-70" : ""
    }`}>
      <div className="p-5 space-y-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-oswald text-2xl text-foreground">{slot.label}</div>
            <div className="text-xs text-muted-foreground font-golos mt-0.5">
              {slot.finished
                ? "Завершён"
                : slot.holder
                  ? `${slot.holder.name} ${slot.holder.surname}`
                  : "Свободен"}
            </div>
          </div>

          {slot.finished ? (
            <div className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-golos text-muted-foreground shrink-0">
              Финиш
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border shrink-0 ${timerBorderClass(slot.remainingMs, slot.timeLimit)}`}>
              <Icon name="Clock" size={13} className={timerClass(slot.remainingMs, slot.timeLimit)} />
              <span className={`font-oswald text-xl font-bold tabular-nums ${timerClass(slot.remainingMs, slot.timeLimit)}`}>
                {formatTime(slot.remainingMs)}
              </span>
            </div>
          )}
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              ratio < 0.2 ? "bg-pink" : ratio < 0.5 ? "bg-gradient-to-r from-gold to-amber-400" : "bg-cyan"
            }`}
            style={{ width: `${Math.max(2, ratio * 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground font-golos mb-1">Банк</div>
            <div className="font-oswald text-3xl font-bold text-gold neon-gold">{slot.bank}</div>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground font-golos mb-1">Ставок</div>
            <div className="font-oswald text-3xl font-bold text-foreground">{slot.bids.length}</div>
          </div>
        </div>

        {slot.holder && !slot.finished && (
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isHolder ? "bg-gold/10 border border-gold/30" : "bg-muted/30"}`}>
            <img src={slot.holder.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-gold/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-golos font-semibold text-foreground truncate">
                {slot.holder.name} {slot.holder.surname}
              </div>
              <div className="text-xs text-muted-foreground font-golos">держатель</div>
            </div>
            {isHolder && <Icon name="Crown" size={15} className="text-gold neon-gold shrink-0" />}
          </div>
        )}

        {slot.finished && slot.winner && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan/8 border border-cyan/25">
            <img src={slot.winner.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-cyan/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-golos font-semibold text-cyan neon-cyan truncate">
                {slot.winner.name} {slot.winner.surname}
              </div>
              <div className="text-xs text-muted-foreground font-golos">победитель · +{slot.bank} монет</div>
            </div>
            <Icon name="Trophy" size={15} className="text-cyan shrink-0" />
          </div>
        )}

        {slot.finished && !slot.winner && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/50">
            <Icon name="Ghost" size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-golos">Никто не ставил — банк остался</span>
          </div>
        )}

        {isBlocked && !slot.finished && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/50">
            <Icon name="Ban" size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-golos">Пропуск — победили в прошлом раунде</span>
          </div>
        )}

        <button
          onClick={() => canBid && onBid(slot.id)}
          disabled={!canBid}
          className={`w-full py-3 rounded-xl font-oswald text-base font-semibold transition-all duration-200 ${
            slot.finished || slot.remainingMs === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : isHolder
                ? "bg-gold/10 border border-gold/30 text-gold/70 cursor-not-allowed"
                : isBlocked
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : !currentPlayer || currentPlayer.balance < BID_COST
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-gold to-amber-500 text-[#0A0C12] hover:scale-[1.02] hover:shadow-lg hover:shadow-gold/25 active:scale-[0.99]"
          }`}
        >
          {slot.finished
            ? "Завершён"
            : isHolder
              ? "Вы держите слот"
              : isBlocked
                ? "Пропуск раунда"
                : !currentPlayer
                  ? "Выберите игрока"
                  : currentPlayer.balance < BID_COST
                    ? "Недостаточно монет"
                    : "Поставить 2 монеты"}
        </button>
      </div>

      {slot.bids.length > 0 && (
        <div className="border-t border-border/40 px-5 py-3">
          <div className="text-xs text-muted-foreground font-golos mb-2">Последние ставки</div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {[...slot.bids].reverse().slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={b.avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-border shrink-0" />
                <span className="text-xs font-golos text-foreground/70 flex-1 truncate">{b.name} {b.surname}</span>
                <span className="text-xs font-oswald text-muted-foreground shrink-0">{b.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Index() {
  const [tab, setTab]                       = useState<Tab>("game");
  const [slots, setSlots]                   = useState<Slot[]>(buildSlots());
  const [players, setPlayers]               = useState<Player[]>(DEMO_PLAYERS);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("p1");
  const [blockedSlots, setBlockedSlots]     = useState<number[]>([]);
  const [roundNum, setRoundNum]             = useState(1);
  const [history, setHistory]               = useState<RoundResult[]>([]);
  const [roundOver, setRoundOver]           = useState(false);
  const [flashSlot, setFlashSlot]           = useState<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPlayer = players.find((p) => p.id === currentPlayerId) ?? null;

  const handleRoundEnd = useCallback((finishedSlots: Slot[]) => {
    setRoundOver(true);
    const result: RoundResult = {
      round: roundNum,
      slots: finishedSlots.map((s) => ({
        label: s.label,
        winner: s.winner ? `${s.winner.name} ${s.winner.surname}` : null,
        winnerAvatar: s.winner?.avatar ?? null,
        bank: s.bank,
      })),
    };
    setHistory((h) => [result, ...h]);
    setPlayers((pp) =>
      pp.map((p) => {
        const wonSlot = finishedSlots.find((s) => s.winner?.id === p.id);
        return wonSlot ? { ...p, balance: p.balance + wonSlot.bank } : p;
      })
    );
  }, [roundNum]);

  useEffect(() => {
    if (roundOver) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setSlots((prev) => {
        const next = prev.map((s) => {
          if (s.finished || s.remainingMs <= 0) return s;
          const newMs = Math.max(0, s.remainingMs - 100);
          if (newMs === 0) {
            return { ...s, remainingMs: 0, finished: true, winner: s.holder };
          }
          return { ...s, remainingMs: newMs };
        });

        const allDone = next.every((s) => s.finished);
        if (allDone) {
          setTimeout(() => handleRoundEnd(next), 0);
        }
        return next;
      });
    }, 100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [roundOver, handleRoundEnd]);

  const handleBid = (slotId: number) => {
    if (!currentPlayer || currentPlayer.balance < BID_COST) return;

    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId || s.finished || s.remainingMs <= 0) return s;
        if (s.holder?.id === currentPlayer.id) return s;

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const newBid: BidEntry = {
          playerId: currentPlayer.id,
          name: currentPlayer.name,
          surname: currentPlayer.surname,
          avatar: currentPlayer.avatar,
          time: timeStr,
        };
        const newBank     = s.holder !== null ? s.bank + BID_TO_BANK : s.bank;
        const newMs       = Math.min(s.remainingMs + EXTEND_SECONDS * 1000, s.timeLimit * 1000);

        return { ...s, bank: newBank, holder: { ...currentPlayer }, bids: [...s.bids, newBid], remainingMs: newMs };
      })
    );

    setPlayers((prev) => prev.map((p) => p.id === currentPlayer.id ? { ...p, balance: p.balance - BID_COST } : p));
    setFlashSlot(slotId);
    setTimeout(() => setFlashSlot(null), 600);
  };

  const startNewRound = () => {
    const wonSlotIds = slots.filter((s) => s.winner?.id === currentPlayerId).map((s) => s.id);
    setBlockedSlots(wonSlotIds);
    setSlots(buildSlots());
    setRoundOver(false);
    setRoundNum((r) => r + 1);
  };

  const switchPlayer = (id: string) => {
    setCurrentPlayerId(id);
    const wonSlotIds = slots.filter((s) => s.winner?.id === id).map((s) => s.id);
    setBlockedSlots(wonSlotIds);
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] grid-lines">
      <div className="bg-mesh fixed inset-0 pointer-events-none" />

      <nav className="sticky top-0 z-40 border-b border-border/50 bg-[var(--dark-bg)]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center animate-pulse-ring">
              <Icon name="Gavel" size={16} className="text-[#0A0C12]" />
            </div>
            <span className="font-oswald text-xl text-foreground tracking-wide">
              АУКЦИОН<span className="text-gold neon-gold">ПРО</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 border border-border/50">
            {(["game", "history"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-golos font-medium transition-all duration-200 ${
                  tab === t ? "bg-gold text-[#0A0C12]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon name={t === "game" ? "Flame" : "Archive"} size={14} />
                {t === "game" ? "Игра" : "История"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
            <Icon name="Hash" size={13} className="text-muted-foreground" />
            <span className="font-oswald text-base text-foreground">Раунд {roundNum}</span>
          </div>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-4 py-6">
        {tab === "game" && (
          <div className="space-y-5 animate-fade-in">

            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div>
                <h2 className="font-oswald text-2xl text-foreground">Раунд #{roundNum}</h2>
                <p className="text-xs text-muted-foreground font-golos mt-0.5">
                  Ставка <span className="text-gold font-semibold">2 монеты</span> · 1 монета идёт в банк слота
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => switchPlayer(p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                      currentPlayerId === p.id
                        ? "border-gold/60 bg-gold/10 scale-[1.03]"
                        : "border-border bg-muted/20 hover:border-border/80"
                    }`}
                  >
                    <img src={p.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-border" />
                    <span className="text-xs font-golos font-medium text-foreground">{p.name}</span>
                    <span className={`font-oswald text-sm font-bold ${currentPlayerId === p.id ? "text-gold neon-gold" : "text-muted-foreground"}`}>
                      {p.balance}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {currentPlayer && (
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                currentPlayer.balance < BID_COST ? "bg-pink/8 border-pink/30" : "bg-muted/20 border-border/50"
              }`}>
                <img src={currentPlayer.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-gold/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-golos font-semibold text-foreground text-sm">{currentPlayer.name} {currentPlayer.surname}</span>
                  <span className="text-xs text-muted-foreground font-golos ml-2">активный игрок</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Icon name="Coins" size={14} className="text-gold" />
                  <span className="font-oswald text-xl font-bold text-gold neon-gold">{currentPlayer.balance}</span>
                  <span className="text-xs text-muted-foreground font-golos">монет</span>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`transition-all duration-300 ${flashSlot === slot.id ? "animate-bid-flash" : ""}`}
                >
                  <SlotCard
                    slot={slot}
                    currentPlayer={currentPlayer}
                    onBid={handleBid}
                    blockedSlots={blockedSlots}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-oswald text-3xl text-foreground">История раундов</h2>
              <p className="text-muted-foreground font-golos text-sm mt-1">Завершённые раунды и победители</p>
            </div>

            {history.length === 0 ? (
              <div className="card-glass rounded-2xl p-16 text-center">
                <Icon name="Archive" size={36} className="text-muted-foreground mx-auto mb-3" />
                <div className="text-muted-foreground font-golos">Нет завершённых раундов</div>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((r, i) => (
                  <div key={i} className="card-glass rounded-2xl p-5 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                        <span className="font-oswald text-sm font-bold text-gold">{r.round}</span>
                      </div>
                      <div className="font-oswald text-lg text-foreground">Раунд #{r.round}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {r.slots.map((s, j) => (
                        <div key={j} className={`rounded-xl p-3 text-center ${s.winner ? "bg-gold/5 border border-gold/20" : "bg-muted/20"}`}>
                          <div className="text-xs text-muted-foreground font-golos mb-1">{s.label}</div>
                          <div className="font-oswald text-2xl font-bold text-gold mb-1">{s.bank}</div>
                          {s.winner && s.winnerAvatar && (
                            <div className="flex items-center justify-center gap-1.5 mt-1">
                              <img src={s.winnerAvatar} alt="" className="w-5 h-5 rounded-full object-cover border border-border" />
                              <span className="text-xs font-golos text-cyan neon-cyan truncate">{s.winner.split(" ")[0]}</span>
                            </div>
                          )}
                          {!s.winner && <span className="text-xs text-muted-foreground font-golos">—</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {roundOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div className="relative card-glass rounded-2xl p-8 max-w-md w-full text-center animate-scale-in space-y-5">
            <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto">
              <Icon name="Trophy" size={28} className="text-gold neon-gold" />
            </div>
            <div>
              <div className="font-oswald text-3xl text-foreground">Раунд завершён!</div>
              <div className="text-muted-foreground font-golos text-sm mt-1">Раунд #{roundNum}</div>
            </div>

            <div className="space-y-2 text-left">
              {slots.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <span className="font-oswald text-sm text-muted-foreground w-14 shrink-0">{s.label}</span>
                  {s.winner ? (
                    <>
                      <img src={s.winner.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-border shrink-0" />
                      <span className="text-sm font-golos text-foreground flex-1 truncate">{s.winner.name} {s.winner.surname}</span>
                      <span className="font-oswald font-bold text-gold shrink-0">+{s.bank}</span>
                    </>
                  ) : (
                    <span className="text-sm font-golos text-muted-foreground flex-1">Никто не ставил</span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
              <div className="text-xs text-muted-foreground font-golos mb-2">Баланс игроков</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5">
                    <img src={p.avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-border" />
                    <span className="text-xs font-golos text-foreground">{p.name}:</span>
                    <span className="font-oswald text-sm text-gold font-bold">{p.balance}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startNewRound}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-[#0A0C12] font-oswald text-lg font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-gold/20"
            >
              Новый раунд →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
