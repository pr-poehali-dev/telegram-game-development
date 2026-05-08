import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import SlotCard from "@/components/auction/SlotCard";
import RoundModal from "@/components/auction/RoundModal";
import HistoryTab from "@/components/auction/HistoryTab";
import {
  BID_COST,
  BID_TO_BANK,
  EXTEND_SECONDS,
  DEMO_PLAYERS,
  buildSlots,
  type Player,
  type BidEntry,
  type Slot,
  type RoundResult,
  type Tab,
} from "@/components/auction/types";

export default function Index() {
  const [tab, setTab]                         = useState<Tab>("game");
  const [slots, setSlots]                     = useState<Slot[]>(buildSlots());
  const [players, setPlayers]                 = useState<Player[]>(DEMO_PLAYERS);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("p1");
  const [blockedSlots, setBlockedSlots]       = useState<number[]>([]);
  const [roundNum, setRoundNum]               = useState(1);
  const [history, setHistory]                 = useState<RoundResult[]>([]);
  const [roundOver, setRoundOver]             = useState(false);
  const [flashSlot, setFlashSlot]             = useState<number | null>(null);
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
        const newBank = s.holder !== null ? s.bank + BID_TO_BANK : s.bank;
        const newMs   = Math.min(s.remainingMs + EXTEND_SECONDS * 1000, s.timeLimit * 1000);

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
          <HistoryTab history={history} />
        )}
      </main>

      {roundOver && (
        <RoundModal
          roundNum={roundNum}
          slots={slots}
          players={players}
          onNewRound={startNewRound}
        />
      )}
    </div>
  );
}
