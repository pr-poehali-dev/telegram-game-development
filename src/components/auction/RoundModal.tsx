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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in overflow-hidden">

        <div className="bg-[var(--tg-blue)] px-6 pt-6 pb-5 text-white text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Icon name="Trophy" size={24} className="text-white" />
          </div>
          <div className="text-xl font-bold">Раунд завершён!</div>
          <div className="text-blue-100 text-sm mt-0.5">Раунд #{roundNum}</div>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            {slots.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--tg-bg)]">
                <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">{s.label}</span>
                {s.winner ? (
                  <>
                    <img src={s.winner.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate font-medium">{s.winner.name} {s.winner.surname}</span>
                    <span className="text-sm font-bold text-[var(--tg-blue)] shrink-0">+{s.bank}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground flex-1">Никто не ставил</span>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[var(--tg-bg)]">
            <div className="text-[11px] font-medium text-muted-foreground mb-2">Баланс игроков</div>
            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-[var(--tg-divider)]">
                  <img src={p.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-xs text-foreground font-medium">{p.name}</span>
                  <span className="text-sm font-bold text-[var(--tg-blue)]">{p.balance}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onNewRound} className="btn-primary w-full py-3.5 text-base">
            Новый раунд →
          </button>
        </div>
      </div>
    </div>
  );
}
