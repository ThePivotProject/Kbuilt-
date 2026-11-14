import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Pause, Play, Volume2, VolumeX, X, Check, Menu, Camera } from "lucide-react";
import logoImg from "./assets/logo_small.webp";
import wallImg from "./assets/wall_small.webp";
import hatReal from "./assets/hat_real_small.webp";
import hatHold from "./assets/hat_hold_small.webp";
import facilityImg from "./assets/facility_small.webp";
import hatBold from "./assets/hat-bold.webp";
import hatHere from "./assets/hat-here.webp";
import teeBold from "./assets/tee-bold.webp";
import teeKbuilt from "./assets/tee-kbuilt.webp";
import teeHere from "./assets/tee-here.webp";
import heroVideo from "./assets/kbuilt_hero_small.mp4";

type Product = { id: string; name: string; saying: string; kind: string; price: number; image: string; sizes: string[]; category: "Hats" | "Tees"; badge?: string; blurb: string };
type CartValue = { productId: string; size: string; qty: number };
type CartRecord = { id: string; value: CartValue };

const PRODUCTS: Product[] = [
  { id: "hat-original", name: "The Original KBuilt Trucker - Leather Patch", saying: "KBuilt", kind: "Flat Billed Trucker", price: 38, image: hatReal, sizes: ["One Size", "Snapback"], category: "Hats", badge: "Real Product", blurb: "Black / Grey Mesh • Oval Leather Patch — the real hat, photographed as it is." },
  { id: "hat-bold", name: "Built to be Bold. Trucker Hat", saying: "Built to be Bold.", kind: "Flat Billed Trucker", price: 38, image: hatBold, sizes: ["One Size", "Snapback"], category: "Hats", blurb: "Same black trucker + leather patch style as the real photos." },
  { id: "hat-here", name: "I'm Here For It Trucker Hat", saying: "I'm Here For It", kind: "Flat Billed Trucker", price: 38, image: hatHere, sizes: ["One Size", "Snapback"], category: "Hats", blurb: "Same black trucker + leather patch style as the real photos." },
  { id: "tee-bold", name: "Built to be Bold. Tee", saying: "Built to be Bold.", kind: "Tee", price: 32, image: teeBold, sizes: ["S", "M", "L", "XL", "2XL"], category: "Tees", blurb: "A tee for daily work." },
  { id: "tee-kbuilt", name: "Kbuilt Tee", saying: "Kbuilt", kind: "Tee", price: 32, image: teeKbuilt, sizes: ["S", "M", "L", "XL", "2XL"], category: "Tees", blurb: "A tee for daily work." },
  { id: "tee-here", name: "I'm Here For It Tee", saying: "I'm Here For It", kind: "Tee", price: 32, image: teeHere, sizes: ["S", "M", "L", "XL", "2XL"], category: "Tees", blurb: "A tee for daily work." },
];

// GitHub Pages / static hosting: no server. Cart + inquiries persist in localStorage.
async function api(action: string, args: Record<string, unknown>) {
  const key = `kbuilt-${String(args.collection || "items")}`;
  const readAll = (): any[] => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
  const writeAll = (rows: any[]) => localStorage.setItem(key, JSON.stringify(rows));
  if (action === "records.list") return { records: readAll() };
  if (action === "records.create") {
    const rows = readAll();
    const id = String((args as any).id || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const row = { id, value: args.value };
    rows.push(row); writeAll(rows); return row;
  }
  if (action === "records.replace") {
    const rows = readAll().map((r: any) => (r.id === args.id ? { ...r, value: args.value } : r));
    writeAll(rows); return { ok: true };
  }
  if (action === "records.delete") {
    writeAll(readAll().filter((r: any) => r.id !== args.id)); return { ok: true };
  }
  return {};
}


export default function App() {
  const [page, setPage] = useState<"home" | "shop" | "rentals">("home");
  const [inquiry, setInquiry] = useState({ name: "", team: "", dateNeeded: "", message: "" });
  const [inquiryBusy, setInquiryBusy] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [sizes, setSizes] = useState<Record<string, string>>({ "hat-original": "One Size", "hat-bold": "One Size", "hat-here": "One Size", "tee-bold": "M", "tee-kbuilt": "M", "tee-here": "M" });
  const [cart, setCart] = useState<CartRecord[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const storyRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const toastTimer = useRef<number | null>(null);

  // Link preview + viewport-fit + video preload (video only).
  useEffect(() => {
    document.title = "KBuilt - Wear what you Built.";
    const setMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); document.head.appendChild(el); }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) { el = document.createElement("link"); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };
    setMeta('meta[name="viewport"]', { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" });
    setMeta('meta[name="description"]', { name: "description", content: "Wear what you Built." });
    setMeta('meta[property="og:title"]', { property: "og:title", content: "KBuilt - Wear what you Built." });
    setMeta('meta[property="og:description"]', { property: "og:description", content: "Wear what you Built." });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    setMeta('meta[property="og:image"]', { property: "og:image", content: logoImg });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setLink("icon", logoImg);
    setLink("apple-touch-icon", logoImg);
    if (!document.querySelector('link[rel="preload"][as="video"]')) {
      const l = document.createElement("link"); l.rel = "preload"; l.setAttribute("as", "video"); l.href = heroVideo; document.head.appendChild(l);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  async function reloadRecords() {
    const data = await api("records.list", { collection: "kbuilt-cart" });
    const records = (data?.records ?? []) as CartRecord[];
    setCart(records.filter((r) => r.value && PRODUCTS.some((p) => p.id === r.value.productId)));
    return records;
  }

  async function createRow(row: CartValue) {
    return api("records.create", { collection: "kbuilt-cart", value: row, idempotency_key: `kbuilt-${row.productId}-${row.size}-${Date.now()}` });
  }

  useEffect(() => {
    reloadRecords().catch(() => setCartNotice("Cart saving is unavailable right now. Your cart will stay on this page only."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const videos = [videoRef.current, storyVideoRef.current].filter((v): v is HTMLVideoElement => Boolean(v));
    if (videos.length === 0) return;
    videos.forEach((v) => { v.muted = muted; });
    if (paused) {
      videos.forEach((v) => v.pause());
    } else {
      videos.forEach((v) => { void v.play().catch(() => {}); });
    }
  }, [paused, muted, page]);

  const cartCount = cart.reduce((n, r) => n + r.value.qty, 0);
  const cartTotal = cart.reduce((sum, r) => {
    const p = PRODUCTS.find((x) => x.id === r.value.productId);
    return sum + (p ? p.price * r.value.qty : 0);
  }, 0);

  const go = (p: "home" | "shop" | "rentals") => { setPage(p); setMobileMenu(false); window.scrollTo({ top: 0 }); };
  const goStory = () => {
    setMobileMenu(false);
    if (page !== "home") {
      setPage("home");
      window.setTimeout(() => storyRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    } else {
      storyRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const submitInquiry = async (e: FormEvent) => {
    e.preventDefault();
    if (!inquiry.name.trim() || !inquiry.team.trim() || !inquiry.message.trim()) {
      setInquiryResult({ ok: false, text: "Please add your name, team, and message." });
      return;
    }
    setInquiryBusy(true);
    setInquiryResult(null);
    const idempotency_key = `kbuilt-inquiry-${Date.now()}-${inquiry.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    try {
      await api("records.create", { collection: "kbuilt-rentals-inquiries", value: { name: inquiry.name.trim(), team: inquiry.team.trim(), dateNeeded: inquiry.dateNeeded, message: inquiry.message.trim(), createdAt: new Date().toISOString() }, idempotency_key });
      setInquiryResult({ ok: true, text: "Thanks - we'll be in touch." });
      setInquiry({ name: "", team: "", dateNeeded: "", message: "" });
    } catch {
      setInquiryResult({ ok: false, text: "Your inquiry could not be saved. Please try again." });
    } finally { setInquiryBusy(false); }
  };

  const addToCart = async (product: Product) => {
    const size = sizes[product.id];
    setBusy(true);
    try {
      const existing = cart.find((r) => r.value.productId === product.id && r.value.size === size);
      if (existing) {
        await api("records.replace", { collection: "kbuilt-cart", id: existing.id, value: { ...existing.value, qty: existing.value.qty + 1 } });
      } else {
        await createRow({ productId: product.id, size, qty: 1 });
      }
      await reloadRecords();
      setCartNotice(null);
      showToast("Added to cart");
    } catch {
      setCart((prev) => {
        const found = prev.find((r) => r.value.productId === product.id && r.value.size === size);
        if (found) return prev.map((r) => r.id === found.id ? { ...r, value: { ...r.value, qty: r.value.qty + 1 } } : r);
        return [...prev, { id: `preview-${product.id}-${size}`, value: { productId: product.id, size, qty: 1 } }];
      });
      setCartNotice("Cart saving is unavailable right now. Your cart will stay on this page only.");
      showToast("Added to cart");
    } finally { setBusy(false); }
  };

  const changeQty = async (record: CartRecord, next: number) => {
    if (next <= 0) {
      try { await api("records.delete", { collection: "kbuilt-cart", id: record.id }); await reloadRecords(); } catch { setCart((p) => p.filter((r) => r.id !== record.id)); }
      return;
    }
    try { await api("records.replace", { collection: "kbuilt-cart", id: record.id, value: { ...record.value, qty: next } }); await reloadRecords(); } catch { setCart((p) => p.map((r) => r.id === record.id ? { ...r, value: { ...r.value, qty: next } } : r)); }
  };

  const removeItem = async (record: CartRecord) => {
    try { await api("records.delete", { collection: "kbuilt-cart", id: record.id }); await reloadRecords(); } catch { setCart((p) => p.filter((r) => r.id !== record.id)); }
  };

  const productById = (id: string) => PRODUCTS.find((p) => p.id === id);

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }} className="overflow-x-clip">
      <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-40 border-b border-black bg-[#0a0a0a] text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button onClick={() => go("home")} className="shrink-0 bg-white p-1.5 leading-none" aria-label="KBuilt home">
            <img src={logoImg} alt="KBuilt logo — red K with BUILT in black" className="h-9 w-auto object-contain sm:h-11" loading="eager" decoding="async" />
          </button>
          <nav className="hidden flex-wrap items-center gap-x-5 gap-y-2 lg:flex" aria-label="Main">
            <button onClick={() => go("home")} className={`font-display text-[13px] font-semibold uppercase tracking-[0.16em] ${page === "home" ? "text-[var(--accent)]" : "text-white"}`}>Home</button>
            <button onClick={goStory} className={`font-display text-[13px] font-semibold uppercase tracking-[0.16em] ${page === "home" ? "text-white" : "text-white"}`}>Our Story</button>
            <button onClick={() => go("shop")} className={`font-display text-[13px] font-semibold uppercase tracking-[0.16em] ${page === "shop" ? "text-[var(--accent)]" : "text-white"}`}>The Drop</button>
            <button onClick={() => go("rentals")} className={`font-display text-[13px] font-semibold uppercase tracking-[0.16em] ${page === "rentals" ? "text-[var(--accent)]" : "text-white"}`}>Team Rentals &amp; Services</button>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 border border-white/30 px-3 py-2 font-display text-sm font-semibold uppercase tracking-wider hover:border-[var(--accent)]" aria-label={`Open cart, ${cartCount} items`}>
              <ShoppingBag size={17} /> <span className="hidden sm:inline">Cart</span> <span className="grid h-5 min-w-[20px] place-items-center bg-[var(--accent)] px-1 text-xs font-bold text-white">{cartCount}</span>
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="border border-white/30 p-2 text-white lg:hidden" aria-label="Toggle menu"><Menu size={18} /></button>
          </div>
        </div>
        {mobileMenu && <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-white/15 px-4 py-3 lg:hidden"><button onClick={() => go("home")} className="font-display text-sm font-semibold uppercase tracking-widest">Home</button><button onClick={goStory} className="font-display text-sm font-semibold uppercase tracking-widest">Our Story</button><button onClick={() => go("shop")} className="font-display text-sm font-semibold uppercase tracking-widest">The Drop</button><button onClick={() => go("rentals")} className="font-display text-sm font-semibold uppercase tracking-widest">Team Rentals &amp; Services</button></div>}
      </header>

      {page === "rentals" ? (
        <main className="relative overflow-x-clip">
          <img src={facilityImg} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center" }} loading="lazy" decoding="async" />
          <div aria-hidden="true" className="absolute inset-0 bg-black/60" />
          <div className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="max-w-[900px] font-display text-[clamp(44px,7vw,84px)] font-bold uppercase leading-[0.9] text-white">Team Rentals &amp; Services</h1>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="border border-[var(--line)] bg-white p-6"><h2 className="font-display text-2xl font-bold uppercase text-[#0a0a0a]">Team Rentals</h2><p className="mt-2 text-base leading-relaxed text-black/70">Space for your team.</p></article>
              <article className="border border-[var(--line)] bg-white p-6"><h2 className="font-display text-2xl font-bold uppercase text-[#0a0a0a]">Training</h2><p className="mt-2 text-base leading-relaxed text-black/70">Room to work.</p></article>
              <article className="border border-[var(--line)] bg-white p-6"><h2 className="font-display text-2xl font-bold uppercase text-[#0a0a0a]">Services</h2><p className="mt-2 text-base leading-relaxed text-black/70">Ask about availability.</p></article>
            </div>
            <section aria-label="Inquiry form" className="mt-4 border border-[var(--line)] bg-white p-5 text-[#0a0a0a] sm:p-7">
              <h2 className="font-display text-2xl font-bold uppercase">Inquiry</h2>
              <form onSubmit={submitInquiry} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-black/60">Name</span><input required value={inquiry.name} onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })} className="w-full border border-black/25 bg-white px-3 py-3 text-base text-[#0a0a0a]" autoComplete="name" /></label>
                <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-black/60">Team</span><input required value={inquiry.team} onChange={(e) => setInquiry({ ...inquiry, team: e.target.value })} className="w-full border border-black/25 bg-white px-3 py-3 text-base text-[#0a0a0a]" autoComplete="organization" /></label>
                <label className="block sm:col-span-2"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-black/60">Date Needed</span><input type="date" value={inquiry.dateNeeded} onChange={(e) => setInquiry({ ...inquiry, dateNeeded: e.target.value })} className="w-full border border-black/25 bg-white px-3 py-3 text-base text-[#0a0a0a]" /></label>
                <label className="block sm:col-span-2"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-black/60">Message</span><textarea required rows={5} value={inquiry.message} onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })} className="w-full resize-y border border-black/25 bg-white px-3 py-3 text-base text-[#0a0a0a]" /></label>
                {inquiryResult && <p role="status" className={`sm:col-span-2 border px-4 py-3 text-sm font-semibold ${inquiryResult.ok ? "border-green-700/30 bg-green-50 text-green-900" : "border-[var(--accent)]/30 bg-red-50 text-red-900"}`}>{inquiryResult.text}</p>}
                <button type="submit" disabled={inquiryBusy} className="bg-[var(--accent)] px-6 py-4 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-[#0a0a0a] disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{inquiryBusy ? "Sending…" : "Submit"}</button>
              </form>
            </section>
          </div>
        </main>
      ) : page === "home" ? (
        <main>
          {/* HERO — full-screen, cover, faces at 50% 18% */}
          <section className="hero-motion grain relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0a0a0a] text-white">
            <video ref={videoRef} className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 18%" }} autoPlay muted={muted} loop playsInline preload="auto" poster={hatReal} aria-hidden="true" tabIndex={-1}>
              <source src={heroVideo} type="video/mp4" />
            </video>
            <div aria-hidden="true" className="absolute inset-0 bg-black/55 bg-gradient-to-b from-black/60 via-black/35 to-black/75" />
            <div className="pointer-events-none absolute right-[-2%] top-[10%] hidden select-none font-display text-[220px] font-bold leading-none text-white/[0.04] lg:block">BOLD</div>
            <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
              <p className="mb-5 inline-flex items-center gap-2 border border-white/25 bg-black/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em]"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> KBuilt</p>
              <h1 className="font-display text-[clamp(44px,9vw,104px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">We Are <span className="text-[var(--accent)]">Bold</span><br />and We are <span className="text-[var(--accent)]">Built.</span></h1>
              <p className="mt-6 max-w-[560px] text-base leading-relaxed text-white/75 sm:text-lg">Show up. Build something that lasts. Wear it like you mean it.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => go("shop")} className="flex items-center justify-center gap-2 bg-[var(--accent)] px-7 py-4 font-display text-base font-bold uppercase tracking-wider text-white hover:bg-white hover:text-black">Shop the Drop <ArrowRight size={18} /></button>
                <button onClick={() => storyRef.current?.scrollIntoView({ behavior: "smooth" })} className="border border-white/40 px-7 py-4 font-display text-base font-bold uppercase tracking-wider hover:border-[var(--accent)] hover:text-[var(--accent)]">Our Story</button>
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between px-4 pb-5 text-xs uppercase tracking-widest text-white/60 sm:px-6">
              <span>Flat billed truckers / Tees</span>
              <div className="flex gap-2">
                <button onClick={() => setPaused(!paused)} className="flex items-center gap-2 border border-white/25 bg-black/40 px-3 py-2" aria-label={paused ? "Play background motion" : "Pause background motion"}>{paused ? <Play size={14} /> : <Pause size={14} />} {paused ? "Play" : "Pause"}</button>
                <button onClick={() => setMuted(!muted)} className="flex items-center gap-2 border border-white/25 bg-black/40 px-3 py-2" aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={14} /> : <Volume2 size={14} />} {muted ? "Muted" : "Sound on"}</button>
              </div>
            </div>
            <div className="relative z-10 overflow-hidden border-t border-white/15 bg-black/35 py-3"><div className="marquee-track flex w-max whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.28em]"><span className="pr-8">Built to be Bold &nbsp;•&nbsp; KBuilt &nbsp;•&nbsp; I&apos;m Here For It &nbsp;•&nbsp; Show Up Bold &nbsp;•&nbsp;</span><span className="pr-8">Built to be Bold &nbsp;•&nbsp; KBuilt &nbsp;•&nbsp; I&apos;m Here For It &nbsp;•&nbsp; Show Up Bold &nbsp;•&nbsp;</span></div></div>
          </section>

          {/* STORY */}
          <section ref={storyRef} className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-24">
            <div className="mb-10 bg-white p-4 sm:p-6">
              <img src={logoImg} alt="KBuilt logo — big red stylized K with BUILT in bold black" className="mx-auto h-auto w-full max-w-[620px] object-contain" loading="lazy" decoding="async" />
              <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-black/50">The mark — red, black, and built to be seen</p>
            </div>
            <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr]">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">01 — The Beginning</p>
                <h2 className="font-display text-[clamp(44px,6vw,76px)] font-bold uppercase leading-[0.9] text-[#0a0a0a]">Our<br /><span className="outline-accent">Story</span></h2>
                <div className="mt-6 h-1 w-16 bg-[var(--accent)]" />
                <p className="mt-6 max-w-[360px] text-sm uppercase tracking-[0.18em] text-black/60">Not about perfection.<br />About showing up.</p>
                <figure className="mt-8 border border-[var(--line)] bg-white p-3">
                  <img src={hatHold} alt="Real black KBuilt trucker hat with oval brown leather patch, held up" className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
                  <figcaption className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-black/70"><span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--leather)]" /> The first drop, for real — black trucker, leather oval patch. This is the hat the story is built around.</figcaption>
                </figure>
                <figure className="mt-4 border border-[var(--line)] bg-white p-3">
                  <video ref={storyVideoRef} className="pointer-events-none aspect-[4/3] w-full object-cover" style={{ objectPosition: "50% 18%" }} autoPlay muted={muted} loop playsInline preload="auto" poster={hatHold} aria-label="KBuilt story video">
                    <source src={heroVideo} type="video/mp4" />
                  </video>
                </figure>
              </div>
              <div>
                <p className="text-xl leading-relaxed text-[#0a0a0a] sm:text-2xl">KBuilt started with a simple idea — show up bold every day, build something that lasts, and wear it like you mean it.</p>
                <div className="mt-8 grid gap-6 text-base leading-relaxed text-black/70 sm:grid-cols-2">
                  <p>It wasn&apos;t about having it all figured out. It was about the work: the early mornings, the second chances, the reps nobody sees. The kind of courage that doesn&apos;t need a stage — just a decision to keep going.</p>
                  <p>Bold courage. Bold community. The people who show up for their families, their work, their goals, and each other — even when it&apos;s hard. That&apos;s who KBuilt is made for. The leather-patch trucker is where that idea first took shape — made to be worn on the days you show up anyway.</p>
                </div>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[["Show Up Bold", "Be present. Be loud about what matters."], ["Built to Last", "Made with intention. Worn with pride."], ["Here For It", "For the journey, the grind, and the joy."]].map(([t, d]) => (
                    <div key={t} className="border border-[var(--line)] bg-white p-5"><p className="font-display text-lg font-bold uppercase leading-tight text-[#0a0a0a]">{t}</p><p className="mt-2 text-sm leading-relaxed text-black/65">{d}</p></div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="bg-[var(--leather)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">Leather Patch</span>
                  <span className="bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">Black Trucker</span>
                  <span className="bg-[var(--accent)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">First Drop</span>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-[#0a0a0a] bg-[var(--accent)] px-4 py-10 text-center text-white sm:py-12">
            <p className="font-display text-[clamp(34px,6vw,64px)] font-bold uppercase leading-none">“Built to be Bold.”</p>
          </section>

          <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"><h2 className="font-display text-4xl font-bold uppercase text-[#0a0a0a] sm:text-5xl">The Drop</h2><button onClick={() => go("shop")} className="flex items-center gap-2 border border-black/30 bg-white px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-[#0a0a0a] hover:border-[var(--accent)] hover:text-[var(--accent)]">Shop all 6 pieces <ArrowRight size={16} /></button></div>
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PRODUCTS.slice(0, 3).map((p) => (<button key={p.id} onClick={() => go("shop")} className="group border border-[var(--line)] bg-white p-3 text-left"><div className="relative overflow-hidden bg-[#e8e4dc]"><img src={p.image} alt={p.name} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]" loading="lazy" decoding="async" />{p.badge && <span className="absolute left-3 top-3 bg-[var(--leather)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{p.badge}</span>}</div><p className="mt-3 font-display text-lg font-bold uppercase text-[#0a0a0a]">{p.name}</p><p className="text-sm text-black/60">${p.price} — {p.kind}</p></button>))}
            </div>
          </section>
        </main>
      ) : (
        <main>
          {/* SHOP — wall background, full-bleed cover + dark scrim, white cards on top */}
          <section className="relative overflow-x-clip">
            <img src={wallImg} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
            <div aria-hidden="true" className="absolute inset-0 bg-black/55" />
            <div className="relative mx-auto max-w-[1400px] px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-white">KBuilt — 6 Pieces</p>
              <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><h1 className="font-display text-[clamp(48px,7vw,84px)] font-bold uppercase leading-[0.9] text-white">The Shop</h1><p className="max-w-[360px] text-sm uppercase leading-relaxed tracking-[0.14em] text-white/70">Hats on the left, Tees on the right.</p></div>
              {cartNotice && <p className="mt-5 border border-white/40 bg-white px-4 py-3 text-sm text-[#0a0a0a]">{cartNotice}</p>}

              <section aria-label="Real product photos" className="mt-10 border border-[var(--line)] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><Camera size={18} className="text-[var(--accent)]" /><h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#0a0a0a] sm:text-2xl">Real Product Photos</h2></div>
                  <span className="bg-[var(--leather)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">No mockups — the real hat</span>
                </div>
                <p className="mt-2 text-sm text-black/65">The real thing - black trucker, leather oval patch.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <figure>
                    <img src={hatReal} alt="Real black KBuilt trucker hat with oval brown leather patch" className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
                    <figcaption className="mt-2 text-sm text-black/65">Black flat-billed trucker with the oval leather patch — up close.</figcaption>
                  </figure>
                  <figure>
                    <img src={hatHold} alt="Real black KBuilt trucker hat with oval brown leather patch being held up" className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
                    <figcaption className="mt-2 text-sm text-black/65">Held up in real life — black crown, grey mesh, leather patch front and center.</figcaption>
                  </figure>
                </div>
              </section>

              <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
                {(["Hats", "Tees"] as const).map((cat) => (
                  <section key={cat} aria-label={cat}>
                    <div className="flex items-baseline justify-between border-b-2 border-white pb-3"><h2 className="font-display text-3xl font-bold uppercase text-white sm:text-4xl">{cat === "Hats" ? "Hats — Flat Billed Trucker" : "Tees"}</h2><span className="font-display text-sm font-semibold uppercase tracking-widest text-white">3 pieces</span></div>
                    <div className="mt-6 grid grid-cols-1 gap-6">
                      {PRODUCTS.filter((p) => p.category === cat).map((p) => (
                        <article key={p.id} className="border border-[var(--line)] bg-white">
                          <div className="relative overflow-hidden bg-[#e8e4dc]"><img src={p.image} alt={p.name} className="aspect-square w-full object-cover" loading="lazy" decoding="async" />{p.badge && <span className="absolute left-3 top-3 bg-[var(--leather)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{p.badge}</span>}</div>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3"><h3 className="font-display text-xl font-bold uppercase leading-tight text-[#0a0a0a]">{p.name}</h3><span className="font-display text-xl font-bold text-[var(--accent)]">${p.price}</span></div>
                            <p className="mt-1 text-sm text-black/60">{p.kind} • “{p.saying}”</p>
                            <p className="mt-2 text-sm leading-relaxed text-black/70">{p.blurb}</p>
                            <div className="mt-4"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/55">Size — {sizes[p.id]}</p><div className="flex flex-wrap gap-2">{p.sizes.map((s) => (<button key={s} onClick={() => setSizes((prev) => ({ ...prev, [p.id]: s }))} aria-pressed={sizes[p.id] === s} className={`min-h-[36px] border px-3 py-1.5 text-sm font-semibold ${sizes[p.id] === s ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-black/25 text-[#0a0a0a] hover:border-black"}`}>{s}</button>))}</div></div>
                            <button disabled={busy} onClick={() => addToCart(p)} className="mt-4 flex w-full items-center justify-center gap-2 bg-[#0a0a0a] px-4 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-[var(--accent)] disabled:opacity-60">{busy ? "Adding…" : "Add to Cart"}</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      <footer className="border-t border-black bg-[#080808] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="bg-white p-2"><img src={logoImg} alt="KBuilt logo — red K with BUILT in black" className="h-11 w-auto object-contain" loading="lazy" decoding="async" /></div><div className="flex flex-wrap gap-x-6 gap-y-3"><button onClick={() => go("home")} className="text-sm font-semibold uppercase tracking-widest">Home</button><button onClick={goStory} className="text-sm font-semibold uppercase tracking-widest">Our Story</button><button onClick={() => go("shop")} className="text-sm font-semibold uppercase tracking-widest">The Drop</button><button onClick={() => go("rentals")} className="text-sm font-semibold uppercase tracking-widest">Team Rentals &amp; Services</button><button onClick={() => setCartOpen(true)} className="text-sm font-semibold uppercase tracking-widest">Cart ({cartCount})</button></div><p className="text-xs uppercase tracking-[0.22em] text-white/55">We are bold. We are built.</p></div>
        <div className="mx-auto mt-6 max-w-[1400px] border-t border-white/10 pt-4"><p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Black trucker • <span className="text-[#c98a4b]">Leather patch</span> • Logo red</p></div>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <button aria-label="Close cart" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/70" />
          <aside className="relative flex h-full w-full max-w-[420px] flex-col bg-white text-[#0a0a0a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><h2 className="font-display text-2xl font-bold uppercase">Your Cart <span className="text-[var(--accent)]">({cartCount})</span></h2><button onClick={() => setCartOpen(false)} aria-label="Close cart" className="border border-black/25 p-2"><X size={18} /></button></div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? <div className="py-10 text-center"><ShoppingBag className="mx-auto text-black/30" size={36} /><p className="mt-4 font-display text-xl font-bold uppercase">Your cart is empty</p><p className="mt-1 text-sm text-black/60">Add a hat or tee to get started.</p><button onClick={() => { setCartOpen(false); go("shop"); }} className="mt-5 bg-[var(--accent)] px-5 py-3 font-display text-sm font-bold uppercase text-white">Shop the Drop</button></div> : (
                <ul className="space-y-4">{cart.map((r) => { const p = productById(r.value.productId); if (!p) return null; return (<li key={r.id} className="flex gap-3 border border-[var(--line)] p-3"><img src={p.image} alt={p.name} className="h-20 w-20 shrink-0 object-cover" loading="lazy" decoding="async" /><div className="min-w-0 flex-1"><p className="font-display font-bold uppercase leading-tight">{p.name}</p><p className="mt-1 text-sm text-black/60">Size {r.value.size} • ${p.price}</p><div className="mt-2 flex items-center justify-between"><div className="flex items-center border border-black/25"><button onClick={() => changeQty(r, r.value.qty - 1)} aria-label="Decrease quantity" className="p-2"><Minus size={14} /></button><span className="w-8 text-center text-sm font-bold">{r.value.qty}</span><button onClick={() => changeQty(r, r.value.qty + 1)} aria-label="Increase quantity" className="p-2"><Plus size={14} /></button></div><span className="font-bold">${p.price * r.value.qty}</span></div><button onClick={() => removeItem(r)} className="mt-2 text-xs font-semibold uppercase tracking-widest text-black/55 underline">Remove</button></div></li>); })}</ul>
              )}
            </div>
            <div className="border-t border-[var(--line)] px-5 py-4"><div className="flex justify-between font-display text-xl font-bold uppercase"><span>Total</span><span>${cartTotal}</span></div><p className="mt-1 text-xs text-black/55">Simple demo checkout — no payment is processed.</p><button onClick={() => showToast("Checkout is a demo in this version")} className="mt-3 flex w-full items-center justify-center gap-2 bg-[var(--accent)] px-4 py-3.5 font-display text-sm font-bold uppercase text-white"><Check size={16} /> Checkout</button></div>
          </aside>
        </div>
      )}

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap bg-[#0a0a0a] px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-white shadow-xl"><Check size={16} className="text-[var(--accent)]" /> {toast}</div>}
    </div>
  );
}
