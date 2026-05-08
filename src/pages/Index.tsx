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
        if (allDone) setTimeout(() => handleRoundEnd(next), 0);
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
    <div className="min-h-screen bg-[var(--tg-bg)]">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[var(--tg-divider)] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--tg-blue)] flex items-center justify-center">
              <Icon name="Gavel" size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-foreground">АукционПро</span>
          </div>

          <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
            {(["game", "history"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  tab === t
                    ? "bg-white text-[var(--tg-blue)] shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon name={t === "game" ? "Flame" : "Archive"} size={14} />
                {t === "game" ? "Игра" : "История"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--tg-green)] animate-pulse-dot" />
            <span className="text-sm font-medium text-foreground">Раунд {roundNum}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-5">
        {tab === "game" && (
          <div className="space-y-4 animate-fade-in">

            {/* Players bar */}
            <div className="tg-card p-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">Игрок:</span>
              {players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchPlayer(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 border ${
                    currentPlayerId === p.id
                      ? "bg-[#F0F7FF] border-[var(--tg-blue)] text-[var(--tg-blue)]"
                      : "bg-white border-[var(--tg-divider)] text-foreground hover:border-gray-300"
                  }`}
                >
                  <img src={p.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  {p.name}
                  <span className={`font-bold text-xs ${currentPlayerId === p.id ? "text-[var(--tg-blue)]" : "text-muted-foreground"}`}>
                    {p.balance}
                  </span>
                </button>
              ))}

              {currentPlayer && (
                <div className="ml-auto flex items-center gap-1.5">
                  <Icon name="Coins" size={14} className="text-[var(--tg-orange)]" />
                  <span className="text-sm font-bold text-foreground">{currentPlayer.balance}</span>
                  <span className="text-xs text-muted-foreground">монет</span>
                </div>
              )}
            </div>

            {/* Info strip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F0F7FF] border border-blue-100">
              <Icon name="Info" size={14} className="text-[var(--tg-blue)] shrink-0" />
              <span className="text-xs text-[var(--tg-blue)]">
                Ставка <strong>2 монеты</strong> · 1 монета идёт в банк слота · +15 сек при каждой ставке
              </span>
            </div>

            {/* Slots grid */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`transition-all duration-200 ${flashSlot === slot.id ? "animate-bid-flash" : ""}`}
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

        {tab === "history" && <HistoryTab history={history} />}
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
