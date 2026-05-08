import Icon from "@/components/ui/icon";
import type { RoundResult } from "./types";

interface HistoryTabProps {
  history: RoundResult[];
}

export default function HistoryTab({ history }: HistoryTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground">История раундов</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Завершённые раунды и победители</p>
      </div>

      {history.length === 0 ? (
        <div className="tg-card p-14 text-center">
          <Icon name="Archive" size={32} className="text-muted-foreground mx-auto mb-3" />
          <div className="text-muted-foreground text-sm">Нет завершённых раундов</div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((r, i) => (
            <div key={i} className="tg-card p-4 animate-fade-in">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-full bg-[var(--tg-blue)] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">{r.round}</span>
                </div>
                <span className="font-semibold text-foreground">Раунд #{r.round}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {r.slots.map((s, j) => (
                  <div key={j} className={`rounded-xl p-3 text-center ${s.winner ? "bg-[#F0F7FF] border border-blue-100" : "bg-muted"}`}>
                    <div className="text-[11px] text-muted-foreground font-medium mb-1">{s.label}</div>
                    <div className="text-xl font-bold text-[var(--tg-blue)] mb-1">{s.bank}</div>
                    {s.winner && s.winnerAvatar ? (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <img src={s.winnerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                        <span className="text-[11px] text-[var(--tg-blue)] font-medium truncate">{s.winner.split(" ")[0]}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
