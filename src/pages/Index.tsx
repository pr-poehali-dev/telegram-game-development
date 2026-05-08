import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const PARTICIPANT_1 = "https://cdn.poehali.dev/projects/3d539b43-1a77-4371-8ab4-b437e1755fa8/files/eb046628-6cac-4cf4-856c-dd7216ba71ef.jpg";
const PARTICIPANT_2 = "https://cdn.poehali.dev/projects/3d539b43-1a77-4371-8ab4-b437e1755fa8/files/d149bbd6-0fde-4bbc-bd7e-889b9b990c17.jpg";

interface Bid {
  id: number;
  name: string;
  surname: string;
  amount: number;
  time: string;
  avatar: string;
  isNew?: boolean;
}

interface Auction {
  id: number;
  title: string;
  description: string;
  bank: number;
  currentBid: number;
  startBid: number;
  endsAt: number;
  bids: Bid[];
  winner?: string;
  status: "active" | "ended";
  avatar: string;
  category: string;
}

const initialBids: Bid[] = [
  { id: 1, name: "Александр", surname: "Петров", amount: 185000, time: "14:32", avatar: PARTICIPANT_1 },
  { id: 2, name: "Мария", surname: "Соколова", amount: 172000, time: "14:28", avatar: PARTICIPANT_2 },
  { id: 3, name: "Дмитрий", surname: "Иванов", amount: 155000, time: "14:21", avatar: PARTICIPANT_1 },
  { id: 4, name: "Елена", surname: "Новикова", amount: 140000, time: "14:15", avatar: PARTICIPANT_2 },
  { id: 5, name: "Сергей", surname: "Козлов", amount: 120000, time: "14:05", avatar: PARTICIPANT_1 },
];

const initialAuctions: Auction[] = [
  {
    id: 1,
    title: "Картина Малевича",
    description: "Оригинальная работа начала XX века, холст/масло, 60×80 см",
    bank: 850000,
    currentBid: 185000,
    startBid: 100000,
    endsAt: Date.now() + 1000 * 60 * 8 + 1000 * 47,
    bids: initialBids,
    status: "active",
    avatar: PARTICIPANT_1,
    category: "Живопись",
  },
  {
    id: 2,
    title: "Редкая монета 1812 г.",
    description: "Серебряный рубль Александра I, состояние превосходное",
    bank: 320000,
    currentBid: 98000,
    startBid: 50000,
    endsAt: Date.now() + 1000 * 60 * 23 + 1000 * 12,
    bids: [
      { id: 10, name: "Игорь", surname: "Белов", amount: 98000, time: "13:55", avatar: PARTICIPANT_2 },
      { id: 11, name: "Татьяна", surname: "Орлова", amount: 85000, time: "13:40", avatar: PARTICIPANT_1 },
    ],
    status: "active",
    avatar: PARTICIPANT_2,
    category: "Нумизматика",
  },
  {
    id: 3,
    title: "Антикварные часы Breguet",
    description: "Карманные часы 1890 года, золотой корпус, механизм в рабочем состоянии",
    bank: 560000,
    currentBid: 210000,
    startBid: 150000,
    endsAt: Date.now() + 1000 * 60 * 45,
    bids: [
      { id: 20, name: "Виктор", surname: "Смирнов", amount: 210000, time: "13:20", avatar: PARTICIPANT_1 },
      { id: 21, name: "Анна", surname: "Лебедева", amount: 190000, time: "13:10", avatar: PARTICIPANT_2 },
      { id: 22, name: "Олег", surname: "Васильев", amount: 170000, time: "13:00", avatar: PARTICIPANT_1 },
    ],
    status: "active",
    avatar: PARTICIPANT_1,
    category: "Антиквариат",
  },
];

const completedAuctions: Auction[] = [
  {
    id: 101,
    title: "Скрипка Страдивари (реплика)",
    description: "Мастерская копия XVIII века",
    bank: 1200000,
    currentBid: 480000,
    startBid: 200000,
    endsAt: Date.now() - 1000 * 3600,
    bids: [
      { id: 100, name: "Николай", surname: "Фролов", amount: 480000, time: "09:15", avatar: PARTICIPANT_1 },
      { id: 101, name: "Светлана", surname: "Морозова", amount: 420000, time: "09:00", avatar: PARTICIPANT_2 },
    ],
    winner: "Николай Фролов",
    status: "ended",
    avatar: PARTICIPANT_1,
    category: "Музыка",
  },
  {
    id: 102,
    title: "Бриллиантовое кольцо XIX в.",
    description: "Фамильная реликвия, 3.2 карата",
    bank: 2100000,
    currentBid: 920000,
    startBid: 500000,
    endsAt: Date.now() - 1000 * 7200,
    bids: [
      { id: 110, name: "Павел", surname: "Горин", amount: 920000, time: "07:45", avatar: PARTICIPANT_2 },
      { id: 111, name: "Ирина", surname: "Волкова", amount: 870000, time: "07:30", avatar: PARTICIPANT_1 },
    ],
    winner: "Павел Горин",
    status: "ended",
    avatar: PARTICIPANT_2,
    category: "Ювелирика",
  },
];

function formatMoney(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function useCountdown(endsAt: number) {
  const [remaining, setRemaining] = useState(Math.max(0, endsAt - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, endsAt - Date.now());
      setRemaining(r);
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 60000 && remaining > 0;
  const isEnded = remaining === 0;

  return { minutes, seconds, isUrgent, isEnded, remaining };
}

function CountdownTimer({ endsAt }: { endsAt: number }) {
  const { minutes, seconds, isUrgent, isEnded } = useCountdown(endsAt);

  if (isEnded) return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
      <span className="text-muted-foreground font-golos text-sm font-medium">Завершён</span>
    </div>
  );

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isUrgent ? "border-pink/60 bg-pink/10 timer-urgent" : "border-gold/40 bg-gold/5"}`}>
      <Icon name="Clock" size={14} className={isUrgent ? "text-pink" : "text-gold"} />
      <span className={`font-oswald text-lg font-semibold tabular-nums ${isUrgent ? "text-pink neon-pink" : "text-gold neon-gold"}`}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function BidRow({ bid, index }: { bid: Bid; index: number }) {
  const [flashing, setFlashing] = useState(bid.isNew || false);

  useEffect(() => {
    if (bid.isNew) {
      setFlashing(true);
      setTimeout(() => setFlashing(false), 800);
    }
  }, [bid.isNew]);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${flashing ? "animate-bid-flash" : ""} ${index === 0 ? "bg-cyan/5 border border-cyan/20" : "bg-muted/30"}`}>
      <div className="text-muted-foreground font-oswald text-sm w-5 text-center">#{index + 1}</div>
      <img src={bid.avatar} alt={bid.name} className="w-8 h-8 rounded-full object-cover border border-border" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{bid.name} {bid.surname}</div>
        <div className="text-xs text-muted-foreground">{bid.time}</div>
      </div>
      <div className={`font-oswald font-semibold text-sm ${index === 0 ? "text-cyan neon-cyan" : "text-foreground/70"}`}>
        {formatMoney(bid.amount)}
      </div>
    </div>
  );
}

function AuctionCard({ auction, onClick }: { auction: Auction; onClick: () => void }) {
  const bidStep = Math.ceil(auction.currentBid * 0.05 / 1000) * 1000;
  const progress = Math.min(100, (auction.currentBid / auction.bank) * 100);

  return (
    <div
      onClick={onClick}
      className="card-glass rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all duration-300 hover:border-gold/40"
    >
      <div className="relative h-48 bg-gradient-to-br from-muted to-background overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-60"></div>
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg text-xs font-golos font-medium bg-card/80 border border-border text-muted-foreground backdrop-blur-sm">
            {auction.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <CountdownTimer endsAt={auction.endsAt} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-end gap-3">
            <img src={auction.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-gold/60 object-cover" />
            <div>
              <div className="text-white font-oswald text-lg leading-tight">{auction.title}</div>
              <div className="text-white/60 text-xs mt-0.5 font-golos">{auction.description}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-muted-foreground font-golos">Текущая ставка</div>
            <div className="text-gold neon-gold font-oswald text-2xl font-bold">{formatMoney(auction.currentBid)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-golos">Банк</div>
            <div className="text-foreground font-oswald text-lg">{formatMoney(auction.bank)}</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground font-golos">
            <span>Прогресс банка</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-cyan rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-golos">
            <Icon name="Users" size={12} />
            <span>{auction.bids.length} ставок</span>
          </div>
          <div className="text-xs text-muted-foreground font-golos">
            Шаг: <span className="text-foreground font-medium">{formatMoney(bidStep)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuctionModal({ auction, onClose, onBid }: {
  auction: Auction;
  onClose: () => void;
  onBid: (id: number, amount: number, name: string, surname: string, avatar: string) => void;
}) {
  const [bidAmount, setBidAmount] = useState(auction.currentBid + Math.ceil(auction.currentBid * 0.05 / 1000) * 1000);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [localEndsAt, setLocalEndsAt] = useState(auction.endsAt);
  const { minutes, seconds, isUrgent, isEnded } = useCountdown(localEndsAt);
  const [submitted, setSubmitted] = useState(false);

  const minBid = auction.currentBid + Math.ceil(auction.currentBid * 0.05 / 1000) * 1000;

  const handleBid = () => {
    if (!name.trim() || !surname.trim()) return;
    if (bidAmount < minBid) return;

    const avatar = Math.random() > 0.5 ? PARTICIPANT_1 : PARTICIPANT_2;

    if (localEndsAt - Date.now() < 120000) {
      setLocalEndsAt(Date.now() + 120000);
    }

    onBid(auction.id, bidAmount, name, surname, avatar);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setBidAmount(bidAmount + Math.ceil(bidAmount * 0.05 / 1000) * 1000);
    setName("");
    setSurname("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div
        className="relative card-glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 card-glass border-b border-border p-4 flex items-center justify-between">
          <div>
            <div className="font-oswald text-xl text-foreground">{auction.title}</div>
            <div className="text-xs text-muted-foreground font-golos">{auction.category}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isUrgent && !isEnded ? "border-pink/60 bg-pink/10 timer-urgent" : "border-gold/40 bg-gold/5"}`}>
              <Icon name="Clock" size={14} className={isUrgent && !isEnded ? "text-pink" : "text-gold"} />
              <span className={`font-oswald text-xl font-bold tabular-nums ${isUrgent && !isEnded ? "text-pink neon-pink" : "text-gold neon-gold"}`}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted hover:bg-border flex items-center justify-center transition-colors">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {isUrgent && !isEnded && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-pink/10 border border-pink/30 animate-fade-in">
              <Icon name="Zap" size={16} className="text-pink" />
              <span className="text-pink text-sm font-golos font-medium">
                Осталось меньше минуты! При новой ставке время продлится на 2 минуты.
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Текущая ставка", value: formatMoney(auction.currentBid), color: "text-gold neon-gold" },
              { label: "Банк аукциона", value: formatMoney(auction.bank), color: "text-foreground" },
              { label: "Ставок", value: String(auction.bids.length), color: "text-foreground" },
            ].map((s) => (
              <div key={s.label} className="bg-muted/30 rounded-xl p-3 text-center">
                <div className="text-xs text-muted-foreground font-golos mb-1">{s.label}</div>
                <div className={`font-oswald text-xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="font-oswald text-base text-foreground">Сделать ставку</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-golos block mb-1.5">Имя</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Александр"
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm font-golos text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-golos block mb-1.5">Фамилия</label>
                <input
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Петров"
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm font-golos text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/60 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-golos block mb-1.5">
                Сумма ставки (мин. {formatMoney(minBid)})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  min={minBid}
                  className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm font-golos text-foreground focus:outline-none focus:border-gold/60 transition-all"
                />
                <button
                  onClick={() => setBidAmount(bidAmount + Math.ceil(bidAmount * 0.05 / 1000) * 1000)}
                  className="px-3 py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-border text-muted-foreground text-xs font-golos transition-colors"
                >
                  +5%
                </button>
                <button
                  onClick={() => setBidAmount(bidAmount + Math.ceil(bidAmount * 0.1 / 1000) * 1000)}
                  className="px-3 py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-border text-muted-foreground text-xs font-golos transition-colors"
                >
                  +10%
                </button>
              </div>
            </div>
            <button
              onClick={handleBid}
              disabled={isEnded || !name.trim() || !surname.trim() || bidAmount < minBid}
              className={`w-full py-3.5 rounded-xl font-oswald text-lg font-semibold transition-all duration-200 ${
                submitted
                  ? "bg-cyan/20 border border-cyan/60 text-cyan"
                  : isEnded
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-gold to-amber-500 text-[#0A0C12] hover:scale-[1.01] hover:shadow-lg hover:shadow-gold/20 active:scale-[0.99]"
              }`}
            >
              {submitted ? "✓ Ставка принята!" : isEnded ? "Аукцион завершён" : "Сделать ставку"}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="font-oswald text-base text-foreground">История ставок</div>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground font-golos">{auction.bids.length} ставок</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {auction.bids.map((bid, i) => (
                <BidRow key={bid.id} bid={bid} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = "home" | "active" | "history";

export default function Index() {
  const [auctions, setAuctions] = useState<Auction[]>(initialAuctions);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const handleBid = useCallback((auctionId: number, amount: number, name: string, surname: string, avatar: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auctionId) return a;
        const newBid: Bid = { id: Date.now(), name, surname, amount, time: timeStr, avatar, isNew: true };
        const updatedBids = [newBid, ...a.bids];
        const newEndsAt = a.endsAt - Date.now() < 120000 ? Date.now() + 120000 : a.endsAt;
        return { ...a, currentBid: amount, bids: updatedBids, endsAt: newEndsAt };
      })
    );

    setSelectedAuction((prev) => {
      if (!prev || prev.id !== auctionId) return prev;
      const newBid: Bid = { id: Date.now() + 1, name, surname, amount, time: timeStr, avatar, isNew: true };
      return { ...prev, currentBid: amount, bids: [newBid, ...prev.bids] };
    });
  }, []);

  const stats = {
    total: auctions.length + completedAuctions.length,
    active: auctions.length,
    volume: auctions.reduce((s, a) => s + a.bank, 0) + completedAuctions.reduce((s, a) => s + a.bank, 0),
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] grid-lines">
      <div className="bg-mesh fixed inset-0 pointer-events-none"></div>

      <nav className="sticky top-0 z-40 border-b border-border/50 bg-[var(--dark-bg)]/80 backdrop-blur-xl">
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
            {(["home", "active", "history"] as Tab[]).map((tab) => {
              const labels: Record<Tab, string> = { home: "Главная", active: "Торги", history: "История" };
              const icons: Record<Tab, string> = { home: "Home", active: "Flame", history: "Archive" };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-golos font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-gold text-[#0A0C12] shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon name={icons[tab]} size={14} />
                  <span className="hidden sm:inline">{labels[tab]}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/20">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></div>
            <span className="text-cyan text-xs font-golos font-medium">{auctions.length} активных</span>
          </div>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-4 py-8">
        {activeTab === "home" && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center pt-8 pb-4 space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm font-golos font-medium stagger-1 animate-fade-in">
                <Icon name="Zap" size={14} />
                Онлайн-аукцион нового поколения
              </div>
              <h1 className="font-oswald text-5xl md:text-7xl text-foreground leading-none tracking-tight stagger-2 animate-fade-in">
                ТОРГИ<br />
                <span className="text-gold neon-gold">БЕЗ ГРАНИЦ</span>
              </h1>
              <p className="text-muted-foreground font-golos text-lg max-w-xl mx-auto stagger-3 animate-fade-in">
                Участвуйте в уникальных аукционах редких предметов. Обратный отсчёт, азарт, победа.
              </p>
              <div className="flex items-center justify-center gap-3 stagger-4 animate-fade-in">
                <button
                  onClick={() => setActiveTab("active")}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-[#0A0C12] font-oswald text-lg font-semibold hover:scale-105 transition-all shadow-lg shadow-gold/20"
                >
                  Смотреть торги
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className="px-8 py-3.5 rounded-xl border border-border bg-muted/30 text-foreground font-oswald text-lg hover:border-gold/40 transition-all"
                >
                  История
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 stagger-3 animate-fade-in">
              {[
                { label: "Всего аукционов", value: stats.total, icon: "Gavel", color: "text-gold neon-gold" },
                { label: "Активные торги", value: stats.active, icon: "Flame", color: "text-cyan neon-cyan" },
                { label: "Объём торгов", value: formatMoney(stats.volume), icon: "TrendingUp", color: "text-pink neon-pink" },
              ].map((s) => (
                <div key={s.label} className="card-glass rounded-2xl p-5 text-center space-y-2">
                  <Icon name={s.icon} size={22} className={s.color} />
                  <div className={`font-oswald text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-muted-foreground text-xs font-golos">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-oswald text-2xl text-foreground">Горящие торги</h2>
                <button onClick={() => setActiveTab("active")} className="text-gold text-sm font-golos hover:underline flex items-center gap-1">
                  Все аукционы <Icon name="ArrowRight" size={14} />
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {auctions.map((a) => (
                  <AuctionCard key={a.id} auction={a} onClick={() => setSelectedAuction(a)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "active" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-oswald text-3xl text-foreground">Активные торги</h2>
                <p className="text-muted-foreground font-golos text-sm mt-1">{auctions.length} аукциона идут прямо сейчас</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan/10 border border-cyan/20">
                <div className="w-2 h-2 rounded-full bg-cyan animate-pulse"></div>
                <span className="text-cyan text-sm font-golos font-semibold">LIVE</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {auctions.map((a, i) => (
                <div key={a.id} className={`stagger-${i + 1} animate-fade-in`}>
                  <AuctionCard auction={a} onClick={() => setSelectedAuction(a)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-oswald text-3xl text-foreground">История аукционов</h2>
              <p className="text-muted-foreground font-golos text-sm mt-1">Завершённые торги и победители</p>
            </div>
            <div className="space-y-4">
              {completedAuctions.map((a, i) => (
                <div key={a.id} className={`card-glass rounded-2xl p-5 stagger-${i + 1} animate-fade-in`}>
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img src={a.avatar} alt="" className="w-14 h-14 rounded-xl object-cover border border-border" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan/20 border border-cyan/60 flex items-center justify-center">
                        <Icon name="Trophy" size={10} className="text-cyan" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="font-oswald text-lg text-foreground">{a.title}</div>
                          <div className="text-xs text-muted-foreground font-golos mt-0.5">{a.description}</div>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-lg bg-muted border border-border text-xs font-golos text-muted-foreground">
                          {a.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-end gap-4 mt-3">
                        <div>
                          <div className="text-xs text-muted-foreground font-golos">Финальная ставка</div>
                          <div className="font-oswald text-xl font-bold text-gold neon-gold">{formatMoney(a.currentBid)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-golos">Банк</div>
                          <div className="font-oswald text-lg text-foreground">{formatMoney(a.bank)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-golos">Участников</div>
                          <div className="font-oswald text-lg text-foreground">{a.bids.length}</div>
                        </div>
                        {a.winner && (
                          <div className="ml-auto">
                            <div className="text-xs text-muted-foreground font-golos">Победитель</div>
                            <div className="flex items-center gap-2 mt-1">
                              <img src={a.bids[0]?.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-cyan/40" />
                              <span className="font-golos font-medium text-cyan neon-cyan">{a.winner}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="text-xs text-muted-foreground font-golos mb-2">Топ ставок</div>
                    <div className="space-y-2">
                      {a.bids.slice(0, 3).map((bid, idx) => (
                        <div key={bid.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${idx === 0 ? "bg-cyan/5 border border-cyan/20" : "bg-muted/20"}`}>
                          <span className="text-muted-foreground font-oswald text-sm w-5 text-center">#{idx + 1}</span>
                          <img src={bid.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-border" />
                          <div className="flex-1">
                            <span className="text-sm font-golos text-foreground">{bid.name} {bid.surname}</span>
                          </div>
                          <span className={`font-oswald text-sm font-semibold ${idx === 0 ? "text-cyan neon-cyan" : "text-foreground/60"}`}>
                            {formatMoney(bid.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2.5 card-glass rounded-full border border-gold/20 shadow-lg animate-ticker whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shrink-0"></div>
          <span className="text-xs font-golos text-muted-foreground">
            Александр П. поставил <span className="text-gold font-medium">185 000 ₽</span> на «Картину Малевича»
          </span>
        </div>
      </div>

      {selectedAuction && (
        <AuctionModal
          auction={selectedAuction}
          onClose={() => setSelectedAuction(null)}
          onBid={handleBid}
        />
      )}
    </div>
  );
}
