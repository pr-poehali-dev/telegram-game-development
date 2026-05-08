import Icon from "@/components/ui/icon";
import { BID_COST, formatTime, timerClass, timerBorderClass } from "./types";
import type { Slot, Player } from "./types";

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
