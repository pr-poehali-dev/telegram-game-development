import Icon from "@/components/ui/icon";
import type { RoundResult } from "./types";

interface HistoryTabProps {
  history: RoundResult[];
}

export default function HistoryTab({ history }: HistoryTabProps) {
  return (
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
  );
}
