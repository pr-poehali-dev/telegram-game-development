import Icon from "@/components/ui/icon";
import { BID_COST, formatTime } from "./types";
import type { Slot, Player } from "./types";

function timerColor(ms: number, limit: number) {
  const r = ms / (limit * 1000);
  if (r < 0.2) return { text: "text-[var(--tg-red)]",    bar: "bg-[var(--tg-red)]",    border: "border-red-200 bg-red-50" };
  if (r < 0.5) return { text: "text-[var(--tg-orange)]", bar: "bg-[var(--tg-orange)]", border: "border-orange-200 bg-orange-50" };
  return         { text: "text-[var(--tg-blue)]",   bar: "bg-[var(--tg-blue)]",   border: "border-blue-200 bg-blue-50" };
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

  const ringColor = slot.finished
    ? (slot.winner ? "ring-[var(--tg-green)]" : "ring-gray-300")
    : isHolder
      ? "ring-[var(--tg-blue)]"
      : slot.holder
        ? "ring-blue-200"
        : "ring-gray-200";

  return (
    <div className={`tg-card flex flex-col transition-all duration-200 ${isHolder ? "ring-2 ring-[var(--tg-blue)] ring-offset-1" : ""} ${slot.finished ? "opacity-70" : ""}`}>
      <div className="p-4 space-y-3 flex-1">

        {/* Header: label + timer */}
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

        {!slot.finished && (
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${tc.bar}`}
              style={{ width: `${Math.max(2, ratio * 100)}%` }}
            />
          </div>
        )}

        {/* Holder/Winner — большое фото сверху */}
        <div className="flex flex-col items-center pt-1">
          {slot.holder || slot.winner ? (
            <>
              <div className="relative">
                <img
                  src={(slot.winner ?? slot.holder)!.avatar}
                  alt=""
                  className={`w-20 h-20 rounded-full object-cover ring-4 ring-offset-2 ring-offset-white ${ringColor}`}
                />
                {isHolder && !slot.finished && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[var(--tg-blue)] flex items-center justify-center shadow">
                    <Icon name="Crown" size={14} className="text-white" />
                  </div>
                )}
                {slot.finished && slot.winner && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[var(--tg-green)] flex items-center justify-center shadow">
                    <Icon name="Trophy" size={14} className="text-white" />
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground text-center truncate max-w-full">
                {(slot.winner ?? slot.holder)!.name} {(slot.winner ?? slot.holder)!.surname}
              </div>
              <div className={`text-[11px] font-medium ${slot.finished ? "text-[var(--tg-green)]" : isHolder ? "text-[var(--tg-blue)]" : "text-muted-foreground"}`}>
                {slot.finished ? `победитель · +${slot.bank}` : "держатель"}
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-muted ring-4 ring-offset-2 ring-offset-white ring-gray-200 flex items-center justify-center">
                <Icon name="User" size={32} className="text-muted-foreground" />
              </div>
              <div className="mt-2 text-sm font-medium text-muted-foreground">Свободен</div>
              <div className="text-[11px] text-muted-foreground/70">никто не ставит</div>
            </>
          )}
        </div>

        {/* Bank & bids — под держателем */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#F0F7FF] rounded-xl py-2.5 text-center">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Банк</div>
            <div className="text-2xl font-bold text-[var(--tg-blue)] leading-tight">{slot.bank}</div>
          </div>
          <div className="flex-1 bg-muted rounded-xl py-2.5 text-center">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Ставок</div>
            <div className="text-2xl font-bold text-foreground leading-tight">{slot.bids.length}</div>
          </div>
        </div>

        {/* Compact statuses */}
        {slot.finished && !slot.winner && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground text-[11px]">
            <Icon name="Ghost" size={12} />
            Никто не ставил
          </div>
        )}

        {isBlocked && !slot.finished && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-[var(--tg-orange)] text-[11px] font-medium">
            <Icon name="Ban" size={12} />
            Пропуск раунда
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => canBid && onBid(slot.id)}
          disabled={!canBid}
          className="btn-primary w-full py-3 text-sm"
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

      {/* Compact bid log */}
      {slot.bids.length > 0 && (
        <div className="border-t border-[var(--tg-divider)] px-4 py-2.5">
          <div className="flex items-center -space-x-1.5">
            {[...slot.bids].reverse().slice(0, 5).map((b, i) => (
              <img
                key={i}
                src={b.avatar}
                alt=""
                title={`${b.name} ${b.surname} · ${b.time}`}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
              />
            ))}
            <span className="text-[11px] text-muted-foreground pl-3">
              {slot.bids.length > 5 ? `+${slot.bids.length - 5} ещё` : `${slot.bids.length} ставок`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
