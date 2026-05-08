import Icon from "@/components/ui/icon";
import type { Slot, Player } from "./types";

interface RoundModalProps {
  roundNum: number;
  slots: Slot[];
  players: Player[];
  onNewRound: () => void;
}

export default function RoundModal({ roundNum, slots, players, onNewRound }: RoundModalProps) {
  return (
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
          onClick={onNewRound}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-[#0A0C12] font-oswald text-lg font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-gold/20"
        >
          Новый раунд →
        </button>
      </div>
    </div>
  );
}
