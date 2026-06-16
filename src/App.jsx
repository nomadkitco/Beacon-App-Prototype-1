import { useState, useRef, useEffect } from "react";
import {
  Compass, MapPin, Plane, Wallet, ScanLine, ArrowLeftRight, Map,
  ShieldCheck, Camera, Upload, ChevronRight, Loader2, ChevronLeft,
  Check, AlertTriangle, Coffee, Bed, Car, ShoppingBag, RotateCcw,
  Sparkles, X, Menu, Bell, Sun, CloudSun, CloudRain, Plus, Home as HomeIcon,
  Phone, Building2, Clock, Trash2,
} from "lucide-react";

// ---- Beacon palette: WARM (terracotta / cream / gold) ------------------
const C = {
  ink: "#CE5430",        // terracotta hero surfaces / header
  inkSoft: "#B5431F",
  bg: "#F4EBE0",         // warm cream app background
  card: "#FDF8F3",       // cream card
  beacon: "#E2982C",     // gold accent
  beaconDeep: "#C2761C",
  beaconWash: "#FBEFD9",
  teal: "#2F8B57",       // positive / healthy (matches "Acquired" green)
  tealWash: "#E4F1E8",
  text: "#2B2018",       // warm near-black
  sub: "#7A6B5E",
  muted: "#A89684",
  line: "#EBDFD2",
  good: "#2F8B57",
  bad: "#C5453B",
  onDark: "#F3DCC0",     // light text on terracotta heroes
};
const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif';

const RATES_TO_USD = { USD: 1, EUR: 1.08, GBP: 1.27, JPY: 0.0067, THB: 0.028, MXN: 0.05 };
const toUSD = (amt, cur) => amt * (RATES_TO_USD[cur] || 1);
const usd = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd0 = (n) => "$" + Math.round(n).toLocaleString("en-US");
const eur = (n) => "\u20AC" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CATS = ["Food & Drink", "Transport", "Lodging", "Shopping", "Groceries", "Other"];
const CAT_ICON = { "Food & Drink": Coffee, Transport: Car, Lodging: Bed, Shopping: ShoppingBag, Groceries: ShoppingBag, Other: Sparkles };

const TODAY = "2026-06-16";
const DAILY_BUDGET = 250;
const SEED_EXPENSES = [
  { id: 1, merchant: "Selina Lisbon \u00b7 7 nights", category: "Lodging", currency: "EUR", amountLocal: 620.0, date: "2026-06-02" },
  { id: 2, merchant: "TAP Air, intra-EU", category: "Transport", currency: "EUR", amountLocal: 148.0, date: "2026-06-02" },
  { id: 3, merchant: "Pingo Doce groceries", category: "Groceries", currency: "EUR", amountLocal: 58.75, date: "2026-06-07" },
  { id: 4, merchant: "Bolt rides (week)", category: "Transport", currency: "EUR", amountLocal: 41.3, date: "2026-06-09" },
  { id: 5, merchant: "Coworking day pass", category: "Other", currency: "EUR", amountLocal: 22.0, date: "2026-06-11", addedAt: TODAY },
  { id: 6, merchant: "Time Out Market", category: "Food & Drink", currency: "EUR", amountLocal: 34.5, date: "2026-06-12", addedAt: TODAY },
];
const TRIP_BUDGET = 2500;

const SEED_NOTIFS = [
  { id: "n1", icon: AlertTriangle, tone: C.beacon, title: "Visa expiry approaching", body: "Your Portugal entry permission expires in 18 days, on 18 Jul 2026.", time: "2h ago", read: false },
  { id: "n2", icon: ShieldCheck, tone: C.beaconDeep, title: "Schengen window", body: "23 of your 90 days remain in the current 180-day window. Resets 12 Sep 2026.", time: "1d ago", read: false },
  { id: "n3", icon: Plane, tone: C.teal, title: "Next trip confirmed", body: "Tokyo departs 13 Jul 2026 on JL 0062. Visa acquired.", time: "2d ago", read: true },
];

// ---- live clock --------------------------------------------------------
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
}
const statusTime = (now) => now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s[AP]M$/, "");
const tzTime = (now, tz) => now.toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });

// ---- atoms -------------------------------------------------------------
const glow = (color, size = 220, opacity = 0.5) =>
  `radial-gradient(${size}px circle at 50% 0%, ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}, transparent 70%)`;

function Eyebrow({ children, right }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: C.beaconDeep, textTransform: "uppercase" }}>{children}</span>
      {right}
    </div>
  );
}
function LinkBtn({ children, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center" style={{ gap: 2, color: C.teal, fontSize: 12.5, fontWeight: 700, background: "none", border: "none" }}>
      {children} <ChevronRight size={14} />
    </button>
  );
}
function Tag({ children, color = C.muted }) {
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color, border: `1px solid ${color}40`, borderRadius: 6, padding: "2px 6px", textTransform: "uppercase" }}>{children}</span>;
}
function Card({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.line}`, boxShadow: "0 1px 2px rgba(43,32,24,0.05)", ...style }}>{children}</div>;
}
function Header({ title, sub, right }) {
  return (
    <div className="flex items-end justify-between" style={{ padding: "6px 20px 14px" }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
function StatusDots() {
  return (
    <div className="flex items-center" style={{ gap: 6 }}>
      <span style={{ letterSpacing: 1, fontSize: 11 }}>{"\u25CF\u25CF\u25CF\u25CF"}</span>
      <span style={{ fontSize: 11, fontWeight: 700 }}>5G</span>
      <span>{"\u{1F50B}"}</span>
    </div>
  );
}
function MenuButton({ color, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center" style={{ background: "none", border: "none", padding: 4, margin: -4, cursor: "pointer" }} aria-label="Open menu">
      <Menu size={22} color={color} />
    </button>
  );
}
function BellButton({ color, ringColor, unread, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center" style={{ position: "relative", background: "none", border: "none", padding: 4, margin: -4, cursor: "pointer" }} aria-label="Notifications">
      <Bell size={20} color={color} />
      {unread > 0 && <span style={{ position: "absolute", top: 1, right: 1, width: 9, height: 9, borderRadius: 999, background: C.bad, border: `1.5px solid ${ringColor}` }} />}
    </button>
  );
}
function UtilityBar({ onMenu, onBell, unread }) {
  return (
    <div className="flex items-center justify-between" style={{ background: C.bg, padding: "8px 18px 4px" }}>
      <MenuButton color={C.text} onClick={onMenu} />
      <BellButton color={C.text} ringColor={C.bg} unread={unread} onClick={onBell} />
    </div>
  );
}

// =======================================================================
//  HOME
// =======================================================================
function HomeScreen({ spent, spentToday, go, now, onMenu, onBell, unread }) {
  return (
    <div>
      <div style={{ background: C.ink, paddingBottom: 18, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: glow(C.beacon, 280, 0.45) }} />
        <div style={{ position: "relative" }}>
          <div className="flex items-center justify-between" style={{ padding: "12px 20px 2px", color: "#fff" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{statusTime(now)}</span><StatusDots />
          </div>
          <div className="flex items-center justify-between" style={{ padding: "6px 20px 0" }}>
            <MenuButton color="#fff" onClick={onMenu} />
            <BellButton color="#fff" ringColor={C.ink} unread={unread} onClick={onBell} />
          </div>
          <div style={{ textAlign: "center", padding: "8px 0 0" }}>
            <div style={{ color: C.onDark, fontSize: 13 }}>Salutations,</div>
            <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, fontFamily: SERIF }}>Tabitha</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px 0", marginTop: 16 }}>
        <button onClick={() => go("passport")} style={{ width: "100%", textAlign: "left", borderRadius: 16, padding: "16px 18px", background: `linear-gradient(135deg, ${C.beacon}, ${C.beaconDeep})`, border: "none", boxShadow: "0 8px 20px rgba(194,118,28,0.3)" }}>
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: "#fff" }}>Visa expiry</span>
            <AlertTriangle size={18} color="#fff" />
          </div>
          <div style={{ fontSize: 13.5, color: "#FFF3E0", marginTop: 4, fontWeight: 600 }}>Expires in 18 days \u00b7 18 Jul 2026</div>
          <div className="flex items-center" style={{ gap: 2, fontSize: 12.5, color: "#fff", fontWeight: 700, marginTop: 8 }}>View <ChevronRight size={14} /></div>
        </button>

        <Card style={{ marginTop: 14, padding: 18 }}>
          <Eyebrow>World clock</Eyebrow>
          <div className="flex">
            <ClockCol label="Lisbon, Portugal" time={tzTime(now, "Europe/Lisbon")} />
            <div style={{ width: 1, background: C.line, margin: "0 16px" }} />
            <ClockCol label="Home" time={tzTime(now, "America/New_York")} />
          </div>
        </Card>

        <Card style={{ marginTop: 14, padding: 18 }}>
          <Eyebrow>Weather</Eyebrow>
          <div className="flex items-stretch">
            {[["Today", Sun, "Sunny", 79, 61], ["Tue", CloudSun, "Partly cloudy", 79, 61], ["Wed", CloudRain, "Rainy", 74, 60]].map(([d, Icon, cond, hi, lo], i) => (
              <div key={d} style={{ flex: 1, textAlign: "center", borderLeft: i ? `1px solid ${C.line}` : "none", padding: "0 4px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>{d}</div>
                <Icon size={26} color={C.beaconDeep} style={{ margin: "8px auto 6px" }} />
                <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 4 }}>{cond}</div>
                <div><span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{hi}</span> <span style={{ fontSize: 12, color: C.muted }}>{lo}</span></div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ marginTop: 14, padding: 18 }}>
          <Eyebrow right={<LinkBtn onClick={() => go("budget")}>Add expense</LinkBtn>}>Trip budget</Eyebrow>
          <div style={{ fontSize: 12, color: C.muted }}>USD 1.00 {"\u2192"} EUR 0.93</div>
          <div className="flex" style={{ marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>Daily</div>
              <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: C.text, marginTop: 2 }}>{usd0(spentToday)} <span style={{ fontSize: 14, color: C.muted }}>/{usd0(DAILY_BUDGET)}</span></div>
              <div style={{ fontSize: 11, color: C.muted }}>spent today</div>
            </div>
            <div style={{ width: 1, background: C.line, margin: "0 16px" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>Trip total</div>
              <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: C.text, marginTop: 2 }}>{usd0(spent)} <span style={{ fontSize: 14, color: C.muted }}>/{usd0(TRIP_BUDGET)}</span></div>
              <div style={{ fontSize: 11, color: C.muted }}>spent since Jun 1</div>
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: 14, padding: 18 }}>
          <Eyebrow right={<LinkBtn onClick={() => go("trip")}>Trip details</LinkBtn>}>Next trip</Eyebrow>
          <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: C.text }}>Tokyo, Japan</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Country #22</div>
          <div className="flex" style={{ marginTop: 16 }}>
            {[["Departure", "13 Jul 2026", C.text], ["Flight", "JL 0062", C.text], ["Visa", "Acquired \u2713", C.good]].map(([k, v, col], i) => (
              <div key={k} style={{ flex: 1, borderLeft: i ? `1px solid ${C.line}` : "none", paddingLeft: i ? 12 : 0 }}>
                <div style={{ fontSize: 10.5, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: col, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ marginTop: 14, marginBottom: 4, padding: 18 }}>
          <Eyebrow>My atlas</Eyebrow>
          <div className="flex">
            {[[21, "Countries"], [3, "Continents"], [14, "Timezones"]].map(([n, l], i) => (
              <div key={l} style={{ flex: 1, textAlign: "center", borderLeft: i ? `1px solid ${C.line}` : "none" }}>
                <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 600, color: C.text }}>{n}</div>
                <div style={{ fontSize: 10.5, color: C.sub, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 700, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
function ClockCol({ label, time }) {
  const [hm, ap] = time.split(" ");
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12.5, color: C.sub }}>{label}</div>
      <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: C.text, marginTop: 2 }}>{hm} <span style={{ fontSize: 16 }}>{ap}</span></div>
    </div>
  );
}

// =======================================================================
//  TRIP
// =======================================================================
function TripScreen({ go, now }) {
  return (
    <div>
      <Header title="Current trip" sub="Everything about where you are now" />
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ borderRadius: 18, padding: 18, background: C.ink, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: glow(C.beacon, 220, 0.35) }} />
          <div style={{ position: "relative" }}>
            <div className="flex items-center" style={{ gap: 6 }}>
              <MapPin size={14} color="#fff" />
              <span style={{ color: C.onDark, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>PORTUGAL {"\u{1F1F5}\u{1F1F9}"}</span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: "#fff", marginTop: 8 }}>Lisbon</div>
            <div style={{ color: C.onDark, fontSize: 13, marginTop: 2 }}>2 Jun \u2013 2 Jul 2026 \u00b7 Day 23 of 31</div>
            <div style={{ height: 7, background: "#ffffff33", borderRadius: 999, marginTop: 14, overflow: "hidden" }}>
              <div style={{ width: "74%", height: "100%", background: "#fff", borderRadius: 999 }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 14 }}>
          <Fact icon={Bed} label="Staying at" value="Selina Lisbon" foot="Checks out 2 Jul" />
          <Fact icon={Clock} label="Local time" value={tzTime(now, "Europe/Lisbon")} foot="WEST \u00b7 +5h from home" />
          <Fact icon={Wallet} label="Currency" value="Euro (EUR)" foot="1 EUR = $1.08" />
          <Fact icon={Sun} label="Today" value="79\u00b0 Sunny" foot="Light breeze" />
        </div>

        <Card style={{ marginTop: 14, padding: 16 }}>
          <Eyebrow>If something goes wrong</Eyebrow>
          {[[Phone, "Emergency services", "112"], [Building2, "U.S. Embassy Lisbon", "+351 21 727 3300"], [ShieldCheck, "Advisory level", "Level 1 \u00b7 Normal"]].map(([Icon, k, v], i, a) => (
            <div key={k} className="flex items-center" style={{ gap: 12, padding: "10px 0", borderBottom: i === a.length - 1 ? "none" : `1px solid ${C.line}` }}>
              <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 10, background: C.tealWash, flexShrink: 0 }}>
                <Icon size={16} color={C.teal} />
              </div>
              <span style={{ flex: 1, fontSize: 13.5, color: C.sub }}>{k}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{v}</span>
            </div>
          ))}
        </Card>

        <button onClick={() => go("budget")} className="flex items-center justify-between" style={{ width: "100%", marginTop: 14, padding: 16, borderRadius: 16, background: C.beaconWash, border: `1px solid ${C.beacon}40` }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <Wallet size={18} color={C.beaconDeep} />
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Open this trip's budget</span>
          </div>
          <ChevronRight size={18} color={C.beaconDeep} />
        </button>
      </div>
    </div>
  );
}
function Fact({ icon: Icon, label, value, foot }) {
  return (
    <Card style={{ padding: 14 }}>
      <Icon size={17} color={C.beaconDeep} />
      <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 2, letterSpacing: -0.3 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{foot}</div>
    </Card>
  );
}

// =======================================================================
//  PASSPORT
// =======================================================================
function PassportScreen() {
  return (
    <div>
      <Header title="Passport & visa" sub="Your right to be here, at a glance" />
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ borderRadius: 18, padding: 18, background: C.ink, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: glow(C.beacon, 200, 0.3) }} />
          <div style={{ position: "relative" }}>
            <div className="flex items-center justify-between">
              <span style={{ color: C.onDark, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>U.S. PASSPORT</span>
              <Plane size={16} color="#fff" />
            </div>
            <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginTop: 14, letterSpacing: -0.5 }}>Valid \u00b7 2 yr 10 mo</div>
            <div style={{ color: C.onDark, fontSize: 13, marginTop: 2 }}>Expires 18 Apr 2029</div>
            <div className="flex items-center" style={{ gap: 8, marginTop: 14, background: "#ffffff22", padding: "8px 12px", borderRadius: 10 }}>
              <Check size={15} color="#fff" />
              <span style={{ color: "#fff", fontSize: 12.5 }}>Meets the 6-month validity rule for Portugal</span>
            </div>
          </div>
        </div>

        <Card style={{ marginTop: 14, padding: 18 }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Schengen 90/180 days</span>
            <Tag color={C.beaconDeep}>sample data</Tag>
          </div>
          <div className="flex items-end" style={{ gap: 6, marginTop: 12 }}>
            <span style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 600, color: C.text, lineHeight: 1 }}>67</span>
            <span style={{ fontSize: 18, color: C.muted, fontWeight: 700, marginBottom: 4 }}>/ 90 days used</span>
          </div>
          <div style={{ height: 9, background: C.bg, borderRadius: 999, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: "74%", height: "100%", background: C.beacon, borderRadius: 999 }} />
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: 10, fontSize: 12, color: C.sub }}>
            <span>23 days remaining in window</span><span>Resets 12 Sep 2026</span>
          </div>
        </Card>

        <Card style={{ marginTop: 14, padding: 16 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: 8 }}>
              <div className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 9, background: C.tealWash }}>
                <ShieldCheck size={16} color={C.teal} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Portugal \u2014 Level 1</span>
            </div>
            <Tag color={C.muted}>sample data</Tag>
          </div>
          <p style={{ fontSize: 13, color: C.sub, marginTop: 10, lineHeight: 1.5 }}>
            Exercise normal precautions. U.S. passport holders enter visa-free for up to 90 days within the Schengen area. Live advisory feed connects at beta.
          </p>
        </Card>
      </div>
    </div>
  );
}

// =======================================================================
//  BUDGET
// =======================================================================
function BudgetScreen({ expenses, spent, remaining, go, onDelete }) {
  const pct = Math.min(100, (spent / TRIP_BUDGET) * 100);
  return (
    <div>
      <Header title="Trip budget" sub="Portugal \u00b7 June 2026" right={<Tag color={C.teal}>EUR \u2192 USD</Tag>} />
      <div style={{ padding: "0 16px 8px" }}>
        <Card style={{ padding: 18 }}>
          <div className="flex items-end justify-between">
            <div>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>Remaining</div>
              <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, color: C.text, lineHeight: 1.1 }}>{usd(remaining)}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: C.muted }}>
              <div>{usd(spent)} spent</div><div>of {usd(TRIP_BUDGET)}</div>
            </div>
          </div>
          <div style={{ height: 10, background: C.bg, borderRadius: 999, marginTop: 14, overflow: "hidden" }}>
            <div style={{ width: pct + "%", height: "100%", background: pct > 85 ? C.bad : C.teal, borderRadius: 999 }} />
          </div>
        </Card>

        <button onClick={() => go("scan")} className="flex items-center justify-center" style={{ width: "100%", gap: 8, marginTop: 14, padding: 15, borderRadius: 16, background: C.beacon, color: "#fff", fontWeight: 800, fontSize: 15, border: "none", boxShadow: "0 6px 16px rgba(226,152,44,0.4)" }}>
          <ScanLine size={19} /> Scan a receipt
        </button>
        <button onClick={() => go("manual")} className="flex items-center justify-center" style={{ width: "100%", gap: 8, marginTop: 10, padding: 13, borderRadius: 14, background: C.card, border: `1px solid ${C.line}`, color: C.text, fontWeight: 700, fontSize: 14 }}>
          <Plus size={17} color={C.inkSoft} /> Record an expense manually
        </button>

        <div className="flex items-center justify-between" style={{ margin: "18px 4px 8px" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Expenses</span>
          <span style={{ fontSize: 11.5, color: C.muted }}>Swipe a row to delete</span>
        </div>
        <Card style={{ overflow: "hidden" }}>
          {expenses.map((e, i) => <SwipeRow key={e.id} e={e} last={i === expenses.length - 1} onDelete={onDelete} />)}
        </Card>
      </div>
    </div>
  );
}
function SwipeRow({ e, last, onDelete }) {
  const [dx, setDx] = useState(0);
  const drag = useRef({ active: false, startX: 0, base: 0, moved: false });
  const REVEAL = 78;
  const Icon = CAT_ICON[e.category] || Sparkles;
  const u = toUSD(e.amountLocal, e.currency);
  const flag = e.source === "scan" ? " \u00b7 scanned" : e.source === "manual" ? " \u00b7 added" : "";

  const onDown = (ev) => {
    drag.current = { active: true, startX: ev.clientX, base: dx, moved: false };
    if (ev.currentTarget.setPointerCapture) ev.currentTarget.setPointerCapture(ev.pointerId);
  };
  const onMove = (ev) => {
    if (!drag.current.active) return;
    const delta = ev.clientX - drag.current.startX;
    if (Math.abs(delta) > 5) drag.current.moved = true;
    let nx = drag.current.base + delta;
    nx = Math.max(-REVEAL, Math.min(0, nx));
    setDx(nx);
  };
  const onUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDx((p) => (p < -REVEAL / 2 ? -REVEAL : 0));
  };
  const onClickRow = () => {
    if (drag.current.moved) { drag.current.moved = false; return; }
    if (dx !== 0) setDx(0);
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", borderBottom: last ? "none" : `1px solid ${C.line}` }}>
      {/* delete action behind */}
      <div style={{ position: "absolute", inset: 0, background: C.bad }} className="flex items-center justify-end">
        <button onClick={() => onDelete(e.id)} className="flex items-center justify-center" style={{ width: REVEAL, height: "100%", background: C.bad, border: "none" }} aria-label="Delete expense">
          <Trash2 size={20} color="#fff" />
        </button>
      </div>
      {/* swipeable foreground */}
      <div
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClick={onClickRow}
        style={{ position: "relative", background: C.card, transform: `translateX(${dx}px)`, transition: drag.current.active ? "none" : "transform 0.18s ease", touchAction: "pan-y", cursor: "grab" }}
      >
        <div className="flex items-center" style={{ gap: 12, padding: "12px 14px" }}>
          <div className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, background: C.bg, flexShrink: 0 }}>
            <Icon size={17} color={C.inkSoft} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.merchant}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{e.category}<span style={{ color: C.beaconDeep, fontWeight: 700 }}>{flag}</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{usd(u)}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{e.currency === "USD" ? "" : eur(e.amountLocal)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =======================================================================
//  MANUAL EXPENSE  (real entry -> recalculates budget)
// =======================================================================
function ManualScreen({ onAdded, go }) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [category, setCategory] = useState("Food & Drink");
  const amt = Number(amount) || 0;
  const valid = merchant.trim().length > 0 && amt > 0;

  function save() {
    if (!valid) return;
    onAdded({ id: Date.now(), merchant: merchant.trim(), category, currency, amountLocal: amt, date: TODAY, addedAt: TODAY, source: "manual" });
  }

  const inputStyle = { width: "100%", fontSize: 15, color: C.text, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", background: C.card, outline: "none", boxSizing: "border-box" };
  const label = { fontSize: 12, color: C.sub, fontWeight: 700, marginBottom: 6, display: "block" };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 6, padding: "6px 14px 14px" }}>
        <button onClick={() => go("budget")} className="flex items-center" style={{ gap: 2, background: "none", border: "none", color: C.sub, fontSize: 14, fontWeight: 600 }}>
          <ChevronLeft size={18} /> Budget
        </button>
      </div>
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 16 }}>Record an expense</div>

        <label style={label}>Where</label>
        <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Time Out Market" style={inputStyle} />

        <div className="flex" style={{ gap: 12, marginTop: 14 }}>
          <div style={{ flex: 2 }}>
            <label style={label}>Amount</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="0.00" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ ...inputStyle, fontWeight: 700 }}>
              {Object.keys(RATES_TO_USD).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <label style={{ ...label, marginTop: 16 }}>Category</label>
        <div className="flex" style={{ flexWrap: "wrap", gap: 8 }}>
          {CATS.map((cat) => {
            const on = cat === category;
            return (
              <button key={cat} onClick={() => setCategory(cat)} style={{ fontSize: 13, fontWeight: 700, padding: "9px 13px", borderRadius: 999, border: `1px solid ${on ? C.beacon : C.line}`, background: on ? C.beacon : C.card, color: on ? "#fff" : C.sub }}>
                {cat}
              </button>
            );
          })}
        </div>

        {/* live USD preview */}
        <Card style={{ marginTop: 18, padding: 16, background: C.beaconWash, border: `1px solid ${C.beacon}40` }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>Adds to your budget as</span>
            <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: C.teal }}>{usd(toUSD(amt, currency))}</span>
          </div>
          {currency !== "USD" && amt > 0 && (
            <div style={{ fontSize: 11.5, color: C.muted, textAlign: "right", marginTop: 2 }}>{eur(amt).replace("\u20AC", "")} {currency} \u00b7 1 {currency} = {usd(RATES_TO_USD[currency]).replace("$", "")}</div>
          )}
        </Card>

        <button onClick={save} disabled={!valid} className="flex items-center justify-center" style={{ width: "100%", gap: 8, marginTop: 16, padding: 15, borderRadius: 16, background: valid ? C.beacon : C.line, color: valid ? "#fff" : C.muted, fontWeight: 800, fontSize: 15, border: "none", boxShadow: valid ? "0 6px 16px rgba(226,152,44,0.4)" : "none" }}>
          <Check size={19} /> Add to budget
        </button>
      </div>
    </div>
  );
}

// =======================================================================
//  SCAN
// =======================================================================
function loadScript(src) {
  return new Promise((res, rej) => {
    if ([...document.scripts].some((s) => s.src === src)) return res();
    const el = document.createElement("script");
    el.src = src; el.onload = () => res(); el.onerror = () => rej(new Error("cdn-blocked"));
    document.head.appendChild(el);
  });
}

// Returns { base64, mediaType } using FileReader only (no canvas / no <img> decode).
async function processImage(file) {
  let working = file;
  const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name || "");
  if (isHeic) {
    try {
      if (!window.heic2any) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js");
      const o = await window.heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
      working = Array.isArray(o) ? o[0] : o;
    } catch (e) { /* fall through; canvas may still handle it on iOS */ }
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(working);
  });
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Couldn't decode the image. If it's an iPhone HEIC photo, upload a JPEG or PNG."));
    i.src = dataUrl;
  });
  const maxDim = 1568;
  let { width, height } = img;
  if (Math.max(width, height) > maxDim) {
    const s = maxDim / Math.max(width, height);
    width = Math.round(width * s); height = Math.round(height * s);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  const out = canvas.toDataURL("image/jpeg", 0.85);
  return { base64: out.split(",")[1], mediaType: "image/jpeg" };
}

function ScanScreen({ onAdded }) {
  const [stage, setStage] = useState("idle");
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rawErr, setRawErr] = useState("");
  const inputRef = useRef(null);

  const PROMPT = `You are the receipt parser for Beacon, a travel budgeting app. Read this receipt image and extract its data. Respond with ONLY a raw JSON object, no markdown fences and no commentary. Schema: {"merchant": string, "date": "YYYY-MM-DD", "currency": "ISO code e.g. EUR/USD/GBP/JPY", "total": number, "category": one of ["Food & Drink","Transport","Lodging","Shopping","Groceries","Other"]}. If a value is not legible, make a sensible best guess. "total" must be a plain number with no currency symbol.`;

  async function handleFile(file) {
    if (!file) return;
    setStage("working"); setRawErr("");
    try {
      const { base64, mediaType } = await processImage(file);
      setPreview("data:" + mediaType + ";base64," + base64);
            const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || ("Server error " + res.status));
      data.total = Number(data.total) || 0;
      setResult(data); setStage("result");
    } catch (err) {
      console.error("Beacon scan error:", err);
      setRawErr(String(err && err.message ? err.message : err));
      setStage("error");
    }
  }

  function reset() { setStage("idle"); setResult(null); setPreview(null); setRawErr(""); if (inputRef.current) inputRef.current.value = ""; }
  function confirm() {
    onAdded({ id: Date.now(), merchant: result.merchant || "Receipt", category: result.category || "Other", currency: result.currency || "USD", amountLocal: result.total, date: result.date || TODAY, addedAt: TODAY, source: "scan" });
    reset();
  }
  const Icon = result ? (CAT_ICON[result.category] || Sparkles) : Sparkles;

  return (
    <div>
      <Header title="Scan receipt" sub="One photo. Done." />
      <div style={{ padding: "0 16px 8px" }}>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

        {stage === "idle" && (
          <div>
            <button onClick={() => inputRef.current?.click()} style={{ width: "100%", border: `2px dashed ${C.beacon}`, background: C.beaconWash, borderRadius: 20, padding: "44px 20px", textAlign: "center" }}>
              <div className="flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: 18, background: C.beacon, margin: "0 auto 14px", boxShadow: "0 8px 20px rgba(226,152,44,0.45)" }}>
                <Camera size={30} color="#fff" />
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>Capture a receipt</div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>Beacon reads the merchant, total, date and category, then converts it to your home currency.</div>
            </button>
            <button onClick={() => inputRef.current?.click()} className="flex items-center justify-center" style={{ width: "100%", gap: 8, marginTop: 12, padding: 14, borderRadius: 14, background: C.card, border: `1px solid ${C.line}`, color: C.text, fontWeight: 700, fontSize: 14 }}>
              <Upload size={17} color={C.inkSoft} /> Upload from library
            </button>
          </div>
        )}

        {stage === "working" && (
          <div style={{ textAlign: "center", padding: "30px 0 10px" }}>
            <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto" }}>
              <div className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.beacon, opacity: 0.25 }} />
              <div className="flex items-center justify-center" style={{ position: "relative", width: 96, height: 96, borderRadius: "50%", background: C.beaconWash }}>
                <Loader2 size={34} color={C.beaconDeep} className="animate-spin" />
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 20 }}>Reading your receipt</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>Pulling merchant, total, date and category</div>
            {preview && <img src={preview} alt="receipt" style={{ width: 90, borderRadius: 12, margin: "18px auto 0", display: "block", opacity: 0.6 }} />}
          </div>
        )}

        {stage === "result" && result && (
          <div>
            <Card style={{ padding: 18 }}>
              <div className="flex items-center" style={{ gap: 12 }}>
                <div className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 13, background: C.beaconWash, flexShrink: 0 }}>
                  <Icon size={22} color={C.beaconDeep} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{result.merchant}</div>
                  <div style={{ fontSize: 12.5, color: C.sub }}>{result.category} \u00b7 {result.date}</div>
                </div>
                <Check size={20} color={C.good} />
              </div>
              <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 16, paddingTop: 16 }}>
                <div className="flex items-end justify-between">
                  <span style={{ fontSize: 13, color: C.sub }}>Total on receipt</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{result.currency === "USD" ? usd(result.total) : `${result.total.toFixed(2)} ${result.currency}`}</span>
                </div>
                <div className="flex items-end justify-between" style={{ marginTop: 10 }}>
                  <span style={{ fontSize: 13, color: C.sub }}>In your home currency</span>
                  <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: C.teal }}>{usd(toUSD(result.total, result.currency))}</span>
                </div>
              </div>
            </Card>
            <button onClick={confirm} className="flex items-center justify-center" style={{ width: "100%", gap: 8, marginTop: 14, padding: 15, borderRadius: 16, background: C.beacon, color: "#fff", fontWeight: 800, fontSize: 15, border: "none", boxShadow: "0 6px 16px rgba(226,152,44,0.4)" }}>
              <Check size={19} /> Add to budget
            </button>
            <button onClick={reset} className="flex items-center justify-center" style={{ width: "100%", gap: 6, marginTop: 10, padding: 12, borderRadius: 14, background: "none", border: "none", color: C.sub, fontWeight: 600, fontSize: 13 }}>
              <RotateCcw size={15} /> Scan another
            </button>
          </div>
        )}

        {stage === "error" && (
          <div>
            <Card style={{ padding: 20, textAlign: "center" }}>
              <div className="flex items-center justify-center" style={{ width: 54, height: 54, borderRadius: 15, background: "#FBEAE9", margin: "0 auto 12px" }}>
                <X size={26} color={C.bad} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Scan didn't go through</div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>Here's exactly what happened, so we can fix it:</div>
              <div style={{ fontSize: 12, color: C.bad, marginTop: 10, background: "#FBEAE9", borderRadius: 10, padding: "10px 12px", fontFamily: "monospace", wordBreak: "break-word" }}>{rawErr}</div>
            </Card>
            <button onClick={reset} className="flex items-center justify-center" style={{ width: "100%", gap: 8, marginTop: 12, padding: 14, borderRadius: 14, background: C.beacon, color: "#fff", fontWeight: 800, fontSize: 14, border: "none" }}>
              <RotateCcw size={17} /> Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =======================================================================
//  CURRENCY
// =======================================================================
function FxScreen() {
  const [amount, setAmount] = useState("50");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const codes = Object.keys(RATES_TO_USD);
  const converted = (Number(amount) || 0) * (RATES_TO_USD[from] / RATES_TO_USD[to]);
  const rate = RATES_TO_USD[from] / RATES_TO_USD[to];
  const swap = () => { setFrom(to); setTo(from); };
  return (
    <div>
      <Header title="Currency" sub="Quick conversions on the road" right={<Tag color={C.beaconDeep}>sample rates</Tag>} />
      <div style={{ padding: "0 16px 8px" }}>
        <Card style={{ padding: 18 }}>
          <label style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>Amount</label>
          <div className="flex items-center" style={{ gap: 10, marginTop: 8 }}>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal"
              style={{ flex: 1, fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: C.text, border: "none", outline: "none", background: "transparent", width: "100%" }} />
            <Picker value={from} onChange={setFrom} codes={codes} />
          </div>
          <div className="flex items-center justify-center" style={{ margin: "8px 0" }}>
            <button onClick={swap} className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 12, background: C.beaconWash, border: "none" }}>
              <ArrowLeftRight size={18} color={C.beaconDeep} style={{ transform: "rotate(90deg)" }} />
            </button>
          </div>
          <div className="flex items-center justify-between" style={{ background: C.bg, borderRadius: 14, padding: "14px 14px" }}>
            <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: C.teal }}>
              {converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <Picker value={to} onChange={setTo} codes={codes} />
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 14 }}>
            1 {from} = {rate.toFixed(4)} {to} \u00b7 live rates connect at beta
          </div>
        </Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "18px 4px 8px" }}>Common while you're here</div>
        <Card>
          {[["Espresso", 1.2], ["Metro ride", 1.85], ["Pastel de nata", 1.4], ["Daily lunch", 12]].map(([label, e], i, a) => (
            <div key={label} className="flex items-center justify-between" style={{ padding: "12px 14px", borderBottom: i === a.length - 1 ? "none" : `1px solid ${C.line}` }}>
              <span style={{ fontSize: 14, color: C.text }}>{label}</span>
              <span style={{ fontSize: 13, color: C.sub }}>{eur(e)} \u2248 {usd(toUSD(e, "EUR"))}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
function Picker({ value, onChange, codes }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ fontSize: 15, fontWeight: 700, color: C.text, border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 10px", background: C.card }}>
      {codes.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}

// =======================================================================
//  NOTIFICATIONS PANEL  (bell -> right-side list, mark as read)
// =======================================================================
function NotificationsPanel({ open, notifs, onRead, close }) {
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, pointerEvents: open ? "auto" : "none" }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(43,32,24,0.45)", opacity: open ? 1 : 0, transition: "opacity 0.22s ease" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "86%", background: C.bg, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.25s ease", boxShadow: "-8px 0 30px rgba(43,32,24,0.25)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: C.ink, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: glow(C.beacon, 160, 0.4) }} />
          <div className="flex items-center justify-between" style={{ position: "relative" }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#fff" }}>Notifications</div>
              <div style={{ fontSize: 12, color: C.onDark, marginTop: 2 }}>{unread > 0 ? `${unread} unread` : "All caught up"}</div>
            </div>
            <button onClick={close} className="flex items-center justify-center" style={{ background: "#ffffff22", border: "none", borderRadius: 999, width: 30, height: 30 }} aria-label="Close notifications">
              <X size={17} color="#fff" />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px" }}>
          {notifs.map((n) => (
            <div key={n.id} style={{ position: "relative", overflow: "hidden", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, marginBottom: 10, opacity: n.read ? 0.62 : 1 }}>
              {!n.read && <span style={{ position: "absolute", top: 14, left: 0, width: 3, height: 30, background: C.beacon, borderRadius: 999 }} />}
              <div className="flex items-start" style={{ gap: 12 }}>
                <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: C.beaconWash, flexShrink: 0 }}>
                  <n.icon size={17} color={n.tone} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-start justify-between">
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: C.muted, flexShrink: 0, marginLeft: 8 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: C.sub, marginTop: 4, lineHeight: 1.45 }}>{n.body}</p>
                  {n.read ? (
                    <div className="flex items-center" style={{ gap: 4, marginTop: 8, fontSize: 12, color: C.muted, fontWeight: 600 }}><Check size={13} /> Read</div>
                  ) : (
                    <button onClick={() => onRead(n.id)} className="flex items-center" style={{ gap: 4, marginTop: 8, fontSize: 12, color: C.beaconDeep, fontWeight: 700, background: "none", border: "none", padding: 0, cursor: "pointer" }}><Check size={13} /> Mark as read</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =======================================================================
//  NAV DRAWER  (hamburger menu)
// =======================================================================
function NavDrawer({ open, view, go, close }) {
  const items = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "trip", label: "Current trip", icon: Map },
    { id: "passport", label: "Passport & visa", icon: ShieldCheck },
    { id: "budget", label: "Trip budget", icon: Wallet },
    { id: "fx", label: "Currency", icon: ArrowLeftRight },
  ];
  const actions = [
    { id: "scan", label: "Scan a receipt", icon: ScanLine },
    { id: "manual", label: "Record an expense", icon: Plus },
  ];
  const Row = ({ item }) => {
    const active = view === item.id;
    return (
      <button onClick={() => go(item.id)} className="flex items-center" style={{ width: "100%", gap: 12, padding: "13px 14px", borderRadius: 12, background: active ? C.beaconWash : "transparent", border: "none", marginBottom: 2 }}>
        <item.icon size={19} color={active ? C.beaconDeep : C.sub} />
        <span style={{ fontSize: 15, fontWeight: active ? 800 : 600, color: active ? C.text : C.sub }}>{item.label}</span>
        {active && <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: 999, background: C.beacon }} />}
      </button>
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, pointerEvents: open ? "auto" : "none" }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(43,32,24,0.45)", opacity: open ? 1 : 0, transition: "opacity 0.22s ease" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "78%", background: C.bg, transform: open ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s ease", boxShadow: "8px 0 30px rgba(43,32,24,0.25)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: C.ink, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: glow(C.beacon, 160, 0.4) }} />
          <div className="flex items-center justify-between" style={{ position: "relative" }}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <Compass size={24} color="#fff" />
              <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#fff" }}>Beacon</span>
            </div>
            <button onClick={close} className="flex items-center justify-center" style={{ background: "#ffffff22", border: "none", borderRadius: 999, width: 30, height: 30 }} aria-label="Close menu">
              <X size={17} color="#fff" />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
          {items.map((it) => <Row key={it.id} item={it} />)}
          <div style={{ height: 1, background: C.line, margin: "12px 8px" }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.muted, textTransform: "uppercase", padding: "0 8px 6px" }}>Quick add</div>
          {actions.map((it) => <Row key={it.id} item={it} />)}
        </div>
        <div style={{ padding: "12px 20px 18px", fontSize: 11, color: C.muted, borderTop: `1px solid ${C.line}` }}>Beacon prototype \u00b7 v0.1</div>
      </div>
    </div>
  );
}

// =======================================================================
//  TAB BAR
// =======================================================================
function TabBar({ view, go }) {
  const tabs = [
    { id: "trip", label: "Trip", icon: Map },
    { id: "passport", label: "Passport", icon: ShieldCheck },
    { id: "home", label: "Home", icon: HomeIcon, center: true },
    { id: "budget", label: "Budget", icon: Wallet },
    { id: "fx", label: "Currency", icon: ArrowLeftRight },
  ];
  return (
    <div className="flex items-center justify-around" style={{ background: C.card, borderTop: `1px solid ${C.line}`, padding: "8px 6px 22px" }}>
      {tabs.map((t) => {
        const active = view === t.id || (t.id === "budget" && (view === "manual" || view === "scan"));
        if (t.center) {
          return (
            <button key={t.id} onClick={() => go(t.id)} className="flex items-center justify-center" style={{ width: 54, height: 54, borderRadius: 18, background: C.beacon, marginTop: -22, border: `4px solid ${C.card}`, boxShadow: "0 6px 16px rgba(226,152,44,0.5)" }}>
              <t.icon size={24} color="#fff" />
            </button>
          );
        }
        return (
          <button key={t.id} onClick={() => go(t.id)} className="flex flex-col items-center" style={{ gap: 3, background: "none", border: "none", padding: "4px 6px", flex: 1 }}>
            <t.icon size={21} color={active ? C.beaconDeep : C.muted} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? C.beaconDeep : C.muted }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function BeaconApp() {
  const [view, setView] = useState("home");
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [notifs, setNotifs] = useState(SEED_NOTIFS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const now = useClock();
  const go = (v) => setView(v);
  const navTo = (v) => { setView(v); setMenuOpen(false); };
  const spent = expenses.reduce((s, e) => s + toUSD(e.amountLocal, e.currency), 0);
  const spentToday = expenses.filter((e) => e.addedAt === TODAY).reduce((s, e) => s + toUSD(e.amountLocal, e.currency), 0);
  const remaining = TRIP_BUDGET - spent;
  const recent = [...expenses].reverse();
  const addExpense = (e) => { setExpenses((p) => [...p, e]); setView("budget"); };
  const removeExpense = (id) => setExpenses((p) => p.filter((x) => x.id !== id));
  const markRead = (id) => setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const unread = notifs.filter((n) => !n.read).length;
  const darkHeader = view === "home";

  return (
    <div className="flex items-center justify-center" style={{ minHeight: "100vh", background: "#E6DDD2", padding: 20, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: 375, height: 812, background: C.bg, borderRadius: 44, overflow: "hidden", boxShadow: "0 30px 70px rgba(43,32,24,0.35)", border: "10px solid #0B1622", display: "flex", flexDirection: "column", position: "relative" }}>
        {!darkHeader && (
          <div>
            <div className="flex items-center justify-between" style={{ background: C.bg, padding: "12px 22px 2px", color: C.text, fontSize: 13, fontWeight: 600 }}>
              <span>{statusTime(now)}</span><StatusDots />
            </div>
            <UtilityBar onMenu={() => setMenuOpen(true)} onBell={() => setNotifOpen(true)} unread={unread} />
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
          {view === "home" && <HomeScreen spent={spent} spentToday={spentToday} go={go} now={now} onMenu={() => setMenuOpen(true)} onBell={() => setNotifOpen(true)} unread={unread} />}
          {view === "trip" && <TripScreen go={go} now={now} />}
          {view === "passport" && <PassportScreen />}
          {view === "budget" && <BudgetScreen expenses={recent} spent={spent} remaining={remaining} go={go} onDelete={removeExpense} />}
          {view === "manual" && <ManualScreen onAdded={addExpense} go={go} />}
          {view === "scan" && <ScanScreen onAdded={addExpense} />}
          {view === "fx" && <FxScreen />}
        </div>
        <TabBar view={view} go={go} />
        <NavDrawer open={menuOpen} view={view} go={navTo} close={() => setMenuOpen(false)} />
        <NotificationsPanel open={notifOpen} notifs={notifs} onRead={markRead} close={() => setNotifOpen(false)} />
      </div>
    </div>
  );
}
