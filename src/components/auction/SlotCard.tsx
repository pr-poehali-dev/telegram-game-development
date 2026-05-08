import Icon from "@/components/ui/icon";
import { BID_COST, formatTime } from "./types";
import type { Slot, Player } from "./types";

function timerColor(ms: number, limit: number) {
  const r = ms / (limit * 1000);
  if (r < 0.2) return { text: "text-[var(--tg-red)]", bar: "bg-[var(--tg-red)]", border: "border-red-200 bg-red-50" };
  if (r < 0.5) return { text: "text-[var(--tg-orange)]", bar: "bg-[var(--tg-orange)]", border: "border-orange-200 bg-orange-50" };
  return { text: "text-[var(--tg-blue)]", bar: "bg-[var(--tg-blue)]", border: "border-blue-200 bg-blue-50" };
}

interface SlotCardProps {
  slot: Slot;
  currentPlayer: Player | null;
  onBid: (slotId: number) => void;
  blockedSlots: number[];
}

export default function SlotCard({ slot, currentPlayer, onBid, blockedSlots }: SlotCardProps) {
  const isHolder  = !!(currentPlayer && slot.holder?.id === currentPlayer.id);
  const isBlocked = !!(currentPlayer && blockedSlots.includes(slot.id));
  const canBid    = !!(currentPlayer && !isHolder && !isBlocked && !slot.finished && slot.remainingMs > 0 && currentPlayer.balance >= BID_COST);
  const ratio     = slot.remainingMs / (slot.timeLimit * 1000);
  const tc        = timerColor(slot.remainingMs, slot.timeLimit);

  return (
    <div className={`tg-card flex flex-col transition-all duration-200 ${isHolder ? "ring-2 ring-[var(--tg-blue)] ring-offset-1" : ""} ${slot.finished ? "opacity-60" : ""}`}>
      <div className="p-4 space-y-3 flex-1">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-foreground">{slot.label}</span>
          {slot.finished ? (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              Завершён
            </span>
          ) : (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold tabular-nums ${tc.border} ${tc.text}`}>
              <Icon name="Clock" size={11} />
              {formatTime(slot.remainingMs)}
            </div>
          )}
        </div>

        {/* Timer bar */}
        {!slot.finished && (
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${tc.bar}`}
              style={{ width: `${Math.max(2, ratio * 100)}%` }}
            />
          </div>
        )}

        {/* Bank & bids */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#F0F7FF] rounded-xl p-3 text-center">
            <div className="text-[11px] text-muted-foreground font-medium mb-0.5">Банк</div>
            <div className="text-2xl font-bold text-[var(--tg-blue)]">{slot.bank}</div>
          </div>
          <div className="flex-1 bg-muted rounded-xl p-3 text-center">
            <div className="text-[11px] text-muted-foreground font-medium mb-0.5">Ставок</div>
            <div className="text-2xl font-bold text-foreground">{slot.bids.length}</div>
          </div>
        </div>

        {/* Holder */}
        {slot.holder && !slot.finished && (
          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl ${isHolder ? "bg-blue-50 border border-blue-200" : "bg-muted"}`}>
            <img src={slot.holder.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{slot.holder.name} {slot.holder.surname}</div>
              <div className="text-[11px] text-muted-foreground">держатель</div>
            </div>
            {isHolder && <Icon name="Crown" size={14} className="text-[var(--tg-blue)] shrink-0" />}
          </div>
        )}

        {/* Winner */}
        {slot.finished && slot.winner && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-green-50 border border-green-200">
            <img src={slot.winner.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--tg-green)] truncate">{slot.winner.name} {slot.winner.surname}</div>
              <div className="text-[11px] text-muted-foreground">победитель · +{slot.bank} монет</div>
            </div>
            <Icon name="Trophy" size={14} className="text-[var(--tg-green)] shrink-0" />
          </div>
        )}

        {slot.finished && !slot.winner && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted text-muted-foreground text-xs">
            <Icon name="Ghost" size={13} />
            Никто не ставил — банк остался
          </div>
        )}

        {isBlocked && !slot.finished && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[var(--tg-orange)] text-xs font-medium">
            <Icon name="Ban" size={13} />
            Пропуск — победили в прошлом раунде
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => canBid && onBid(slot.id)}
          disabled={!canBid}
          className="btn-primary w-full py-3 text-sm font-semibold"
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

      {/* Bid log */}
      {slot.bids.length > 0 && (
        <div className="border-t border-[var(--tg-divider)] px-4 py-3">
          <div className="text-[11px] font-medium text-muted-foreground mb-2">Последние ставки</div>
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {[...slot.bids].reverse().slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={b.avatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <span className="text-xs text-foreground/70 flex-1 truncate">{b.name} {b.surname}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">{b.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
