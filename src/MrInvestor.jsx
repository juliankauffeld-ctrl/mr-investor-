import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const STRIPE_LINK = "https://buy.stripe.com/cNi6oAaZt7YK6Br6pr38401";
const STRIPE_PORTAL = "https://billing.stripe.com/p/login/9B67sEebF2Eq9NDcNP38400";
const FREE_LIMIT = 5;

const translations = {
  de: {
    title: "MR. INVESTOR",
    subtitle: "KI FINANZASSISTENT",
    welcome: "WILLKOMMEN BEI MR. INVESTOR",
    welcomeSub: "Dein persönlicher KI-Finanzassistent.",
    login: "EINLOGGEN",
    register: "REGISTRIEREN",
    logout: "Logout",
    upgrade: "UPGRADE",
    premium: "✦ PREMIUM",
    manageAbo: "Abo verwalten",
    deleteHistory: "Chat löschen",
    freeOf: "heute",
    limitReached: "Tageslimit erreicht. Morgen wieder 5 Fragen gratis!",
    upgradeNow: "JETZT UPGRADEN – 9,99€/Monat",
    placeholder: "Frage Mr. Investor...",
    disclaimer: "Kein lizenzierter Finanzberater.",
    impressum: "Impressum",
    agb: "AGB",
    datenschutz: "Datenschutz",
    freeRegister: "Kostenlos registrieren",
    freeInfo: "5 kostenlose Fragen täglich · Premium ab 9,99€/Monat",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Passwort",
    loginError: "Ein Fehler ist aufgetreten.",
    confirmEmail: "✅ Bestätigungs-Email gesendet! Bitte prüfe dein Postfach.",
    noAccount: "Noch kein Konto? Registrieren",
    hasAccount: "Schon ein Konto? Einloggen",
    premiumTitle: "MR. INVESTOR PREMIUM",
    feature1: "✦ Unbegrenzte Fragen",
    feature2: "✦ Mehrere Chats + Bilder",
    feature3: "✦ Depot Screenshots analysieren",
    feature4: "✦ Prioritäts-Support",
    perMonth: "pro Monat",
    close: "Schließen",
    back: "← Zurück",
    newChat: "Neuer Chat",
    chats: "Chats",
    uploadImage: "Bild hochladen",
    suggested: ["Wie fange ich mit ETF Investing an?", "Was ist der S&P 500?", "Wie spare ich 10.000€ in 2 Jahren?", "Trade Republic oder andere Broker?"],
    system: `Du bist Mr. Investor, ein empathischer KI-Finanzassistent für Deutsche. Hilf bei ETFs, S&P 500, Sparstrategien und Finanzplanung. Antworte auf Deutsch, präzise und warm. Frage am Ende ob alles klar war. Max 200 Wörter. Kein lizenzierter Finanzberater. Analysiere Bilder/Screenshots detailliert wenn gesendet.`,
  },
  en: {
    title: "MR. INVESTOR",
    subtitle: "AI FINANCE ASSISTANT",
    welcome: "WELCOME TO MR. INVESTOR",
    welcomeSub: "Your personal AI finance assistant.",
    login: "LOGIN",
    register: "REGISTER",
    logout: "Logout",
    upgrade: "UPGRADE",
    premium: "✦ PREMIUM",
    manageAbo: "Manage subscription",
    deleteHistory: "Delete chat",
    freeOf: "today",
    limitReached: "Daily limit reached. Come back tomorrow for 5 more free questions!",
    upgradeNow: "UPGRADE NOW – €9.99/month",
    placeholder: "Ask Mr. Investor...",
    disclaimer: "Not a licensed financial advisor.",
    impressum: "Imprint",
    agb: "Terms",
    datenschutz: "Privacy",
    freeRegister: "Register for free",
    freeInfo: "5 free questions daily · Premium from €9.99/month",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    loginError: "An error occurred.",
    confirmEmail: "✅ Confirmation email sent! Please check your inbox.",
    noAccount: "No account yet? Register",
    hasAccount: "Already have an account? Login",
    premiumTitle: "MR. INVESTOR PREMIUM",
    feature1: "✦ Unlimited questions",
    feature2: "✦ Multiple chats + Images",
    feature3: "✦ Analyze portfolio screenshots",
    feature4: "✦ Priority support",
    perMonth: "per month",
    close: "Close",
    back: "← Back",
    newChat: "New Chat",
    chats: "Chats",
    uploadImage: "Upload image",
    suggested: ["How do I start investing in ETFs?", "What is the S&P 500?", "How do I save €10,000 in 2 years?", "Best brokers for beginners?"],
    system: `You are Mr. Investor, an empathetic AI finance assistant. Help with ETFs, S&P 500, saving strategies and financial planning. Respond in English, precise and warm. Ask at the end if everything was clear. Max 200 words. Not a licensed financial advisor. Analyze images/screenshots in detail when sent.`,
  }
};

const ImpressumDE = () => (
  <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}>
    <h2 style={{ color: "#f0d080", letterSpacing: "2px", marginBottom: "24px" }}>IMPRESSUM</h2>
    <h3 style={{ color: "#c9a84c", marginBottom: "8px" }}>Angaben gemäß § 5 TMG</h3>
    <p>Julian Kauffeld<br />Menteweg 3<br />31675 Bückeburg<br />Deutschland</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>Kontakt</h3>
    <p>E-Mail: julian.kauffeld@gmx.de</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>Haftungsausschluss</h3>
    <p>Mr. Investor ist ein KI-gestützter Finanzassistent und ersetzt keine professionelle Finanzberatung.</p>
  </div>
);

const AGBDE = () => (
  <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}>
    <h2 style={{ color: "#f0d080", letterSpacing: "2px", marginBottom: "24px" }}>AGB</h2>
    <h3 style={{ color: "#c9a84c", marginBottom: "8px" }}>§ 1 Geltungsbereich</h3>
    <p>Diese AGB gelten für die Nutzung von Mr. Investor (mr-investor.com), betrieben von Julian Kauffeld.</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>§ 2 Leistungsbeschreibung</h3>
    <p>Kostenlos: 5 Fragen täglich. Premium (9,99€/Monat): unbegrenzt, Bilder, mehrere Chats.</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>§ 3 Kein Finanzrat</h3>
    <p>Kein lizenzierter Finanzberater. Nur zu Informationszwecken.</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>§ 4 Kündigung</h3>
    <p>Monatlich kündbar per E-Mail: julian.kauffeld@gmx.de</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>§ 5 Widerrufsrecht</h3>
    <p>14 Tage Widerrufsrecht. Kontakt: julian.kauffeld@gmx.de</p>
  </div>
);

const DatenschutzDE = () => (
  <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}>
    <h2 style={{ color: "#f0d080", letterSpacing: "2px", marginBottom: "24px" }}>DATENSCHUTZERKLÄRUNG</h2>
    <h3 style={{ color: "#c9a84c", marginBottom: "8px" }}>1. Verantwortlicher</h3>
    <p>Julian Kauffeld, Menteweg 3, 31675 Bückeburg<br />E-Mail: julian.kauffeld@gmx.de</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>2. Erhobene Daten</h3>
    <p>E-Mail, Chat-Nachrichten, hochgeladene Bilder zur KI-Verarbeitung, Zahlungsdaten über Stripe.</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>3. Drittanbieter</h3>
    <p>Supabase (EU), Anthropic (USA), Stripe, Vercel (USA).</p>
    <h3 style={{ color: "#c9a84c", margin: "20px 0 8px" }}>4. Ihre Rechte</h3>
    <p>Auskunft, Berichtigung und Löschung: julian.kauffeld@gmx.de</p>
  </div>
);

const LegalEN = ({ page }) => (
  <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}>
    {page === "impressum" && <><h2 style={{ color: "#f0d080", marginBottom: "24px" }}>IMPRINT</h2><p>Julian Kauffeld, Menteweg 3, 31675 Bückeburg, Germany<br />Email: julian.kauffeld@gmx.de</p></>}
    {page === "agb" && <><h2 style={{ color: "#f0d080", marginBottom: "24px" }}>TERMS</h2><p>Free: 5 questions/day. Premium €9.99/month: unlimited, images, multiple chats. Cancel anytime: julian.kauffeld@gmx.de. 14-day withdrawal right.</p></>}
    {page === "datenschutz" && <><h2 style={{ color: "#f0d080", marginBottom: "24px" }}>PRIVACY</h2><p>Controller: Julian Kauffeld, julian.kauffeld@gmx.de<br />Data: Email, chat messages, uploaded images. Third parties: Supabase (EU), Anthropic, Stripe, Vercel.</p></>}
  </div>
);

const getTodayKey = () => new Date().toISOString().split('T')[0];

export default function MrInvestor() {
  const detectLang = () => {
    const saved = localStorage.getItem('lang');
    if (saved) return saved;
    const browser = navigator.language || navigator.userLanguage || 'en';
    return browser.startsWith('de') ? 'de' : 'en';
  };

  const getDailyQuestions = () => {
    const today = getTodayKey();
    const stored = JSON.parse(localStorage.getItem('daily') || '{}');
    if (stored.date === today) return Math.max(0, FREE_LIMIT - (stored.used || 0));
    return FREE_LIMIT;
  };

  const [lang, setLang] = useState(detectLang);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeQuestions, setFreeQuestions] = useState(getDailyQuestions);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [page, setPage] = useState("home");
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const t = translations[lang];

  const switchLang = (l) => { setLang(l); localStorage.setItem('lang', l); };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (session?.user) checkPremium(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkPremium(session.user.id);
      else { setMessages([]); setChats([]); setCurrentChatId(null); setShowWelcome(true); setIsPremium(false); setFreeQuestions(getDailyQuestions()); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadChats = async (userId) => {
    const { data } = await supabase.from("chats").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data && data.length > 0) { setChats(data); loadChatMessages(data[0].id); setCurrentChatId(data[0].id); }
  };

  const loadChatMessages = async (chatId) => {
    const { data } = await supabase.from("messages").select("role, content").eq("chat_id", chatId).order("created_at", { ascending: true }).limit(50);
    if (data && data.length > 0) { setMessages(data); setShowWelcome(false); }
    else { setMessages([]); setShowWelcome(true); }
  };

  const createNewChat = async () => {
    if (!user) return;
    const { data } = await supabase.from("chats").insert({ user_id: user.id, title: t.newChat }).select().single();
    if (data) { setChats(prev => [data, ...prev]); setCurrentChatId(data.id); setMessages([]); setShowWelcome(true); setShowSidebar(false); }
  };

  const switchChat = (chatId) => { setCurrentChatId(chatId); loadChatMessages(chatId); setShowSidebar(false); };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    await supabase.from("chats").delete().eq("id", chatId);
    const remaining = chats.filter(c => c.id !== chatId);
    setChats(remaining);
    if (currentChatId === chatId) {
      if (remaining.length > 0) { setCurrentChatId(remaining[0].id); loadChatMessages(remaining[0].id); }
      else { setCurrentChatId(null); setMessages([]); setShowWelcome(true); }
    }
  };

  const checkPremium = async (userId) => {
    const { data } = await supabase.from("profiles").select("is_premium, free_questions_used").eq("id", userId).single();
    if (data) {
      const premium = data.is_premium || false;
      setIsPremium(premium);
      if (!premium) setFreeQuestions(getDailyQuestions());
      else { setFreeQuestions(999); loadChats(userId); }
    }
  };

  const handleAuth = async () => {
    setAuthLoading(true); setAuthError("");
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setAuthError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setAuthError(error.message);
        else setAuthError(t.confirmEmail);
      }
    } catch { setAuthError(t.loginError); }
    setAuthLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const incrementDailyUsage = () => {
    const today = getTodayKey();
    const stored = JSON.parse(localStorage.getItem('daily') || '{}');
    const used = stored.date === today ? (stored.used || 0) + 1 : 1;
    localStorage.setItem('daily', JSON.stringify({ date: today, used }));
    setFreeQuestions(Math.max(0, FREE_LIMIT - used));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage({ data: ev.target.result.split(',')[1], type: file.type });
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText && !selectedImage) return;
    if (!user) return;
    if (!isPremium && freeQuestions <= 0) { setShowUpgrade(true); return; }

    let chatId = currentChatId;
    if (isPremium) {
      if (!chatId) {
        const title = userText ? userText.slice(0, 30) : t.uploadImage;
        const { data } = await supabase.from("chats").insert({ user_id: user.id, title }).select().single();
        if (data) { chatId = data.id; setCurrentChatId(data.id); setChats(prev => [data, ...prev]); }
      } else if (messages.length === 0 && userText) {
        await supabase.from("chats").update({ title: userText.slice(0, 30) }).eq("id", chatId);
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: userText.slice(0, 30) } : c));
      }
    }

    setShowWelcome(false);
    setInput("");
    setLoading(true);

    const userContent = [];
    if (selectedImage) userContent.push({ type: "image", source: { type: "base64", media_type: selectedImage.type, data: selectedImage.data } });
    if (userText) userContent.push({ type: "text", text: userText });

    const displayMsg = { role: "user", content: userText || "📷 " + t.uploadImage, hasImage: !!selectedImage, imagePreview };
    const newMessages = [...messages, displayMsg];
    setMessages(newMessages);
    setSelectedImage(null);
    setImagePreview(null);

    if (isPremium && chatId) await supabase.from("messages").insert({ user_id: user.id, chat_id: chatId, role: "user", content: userText || t.uploadImage });

    if (!isPremium) {
      incrementDailyUsage();
      const { data: profile } = await supabase.from("profiles").select("free_questions_used").eq("id", user.id).single();
      await supabase.from("profiles").upsert({ id: user.id, free_questions_used: (profile?.free_questions_used || 0) + 1 });
    }

    const apiMessages = newMessages.map((msg, idx) => {
      if (idx === newMessages.length - 1 && userContent.length > 0) {
        return { role: "user", content: userContent };
      }
      return { role: msg.role, content: msg.content };
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: t.system, messages: apiMessages }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Error.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
      if (isPremium && chatId) await supabase.from("messages").insert({ user_id: user.id, chat_id: chatId, role: "assistant", content: reply });
    } catch { setMessages([...newMessages, { role: "assistant", content: "Connection error." }]); }
    setLoading(false);
  };

  const gold = "linear-gradient(135deg, #c9a84c, #f0d080)";

  const LangSwitch = () => (
    <div style={{ display: "flex", gap: "4px" }}>
      <button onClick={() => switchLang('de')} style={{ background: lang === 'de' ? gold : "transparent", border: "1px solid #2a2a3a", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "14px" }}>🇩🇪</button>
      <button onClick={() => switchLang('en')} style={{ background: lang === 'en' ? gold : "transparent", border: "1px solid #2a2a3a", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "14px" }}>🇬🇧</button>
    </div>
  );

  const LegalModal = () => page !== "home" ? (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }} onClick={() => setPage("home")}>
      <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "16px", padding: "32px", maxWidth: "650px", width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setPage("home")} style={{ background: "transparent", border: "none", color: "#c9a84c", cursor: "pointer", marginBottom: "20px", fontSize: "14px" }}>{t.back}</button>
        {lang === 'de' ? <>{page === "impressum" && <ImpressumDE />}{page === "agb" && <AGBDE />}{page === "datenschutz" && <DatenschutzDE />}</> : <LegalEN page={page} />}
      </div>
    </div>
  ) : null;

  const FooterLinks = () => (
    <div style={{ textAlign: "center", fontSize: "11px", color: "#444", marginTop: "8px" }}>
      {t.disclaimer} &nbsp;|&nbsp;
      <span onClick={() => setPage("impressum")} style={{ cursor: "pointer", color: "#666" }}>{t.impressum}</span> &nbsp;|&nbsp;
      <span onClick={() => setPage("agb")} style={{ cursor: "pointer", color: "#666" }}>{t.agb}</span> &nbsp;|&nbsp;
      <span onClick={() => setPage("datenschutz")} style={{ cursor: "pointer", color: "#666" }}>{t.datenschutz}</span>
    </div>
  );

  if (!authChecked) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: gold }} />
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}><LangSwitch /></div>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "bold", color: "#0a0a0f", margin: "0 auto 20px" }}>M</div>
          <h1 style={{ color: "#f0d080", fontSize: "24px", letterSpacing: "2px", marginBottom: "8px" }}>{t.title}</h1>
          <p style={{ color: "#888", fontSize: "14px" }}>{t.welcomeSub}</p>
        </div>
        <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "16px", padding: "32px" }}>
          <div style={{ display: "flex", marginBottom: "24px", background: "#0a0a0f", borderRadius: "8px", padding: "4px" }}>
            <button onClick={() => { setAuthMode("login"); setAuthError(""); }} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", background: authMode === "login" ? gold : "transparent", color: authMode === "login" ? "#0a0a0f" : "#888", fontWeight: "bold", fontSize: "13px" }}>{t.login}</button>
            <button onClick={() => { setAuthMode("register"); setAuthError(""); }} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", background: authMode === "register" ? gold : "transparent", color: authMode === "register" ? "#0a0a0f" : "#888", fontWeight: "bold", fontSize: "13px" }}>{t.register}</button>
          </div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder={t.emailPlaceholder} type="email" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: "8px", padding: "12px", color: "#e0d8c8", fontSize: "14px", outline: "none", marginBottom: "12px", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
          <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} placeholder={t.passwordPlaceholder} type="password" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: "8px", padding: "12px", color: "#e0d8c8", fontSize: "14px", outline: "none", marginBottom: "16px", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
          {authError && <p style={{ color: authError.includes("✅") ? "#4CAF50" : "#e07050", fontSize: "13px", marginBottom: "12px" }}>{authError}</p>}
          <button onClick={handleAuth} disabled={authLoading} style={{ width: "100%", background: gold, color: "#0a0a0f", border: "none", padding: "14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
            {authLoading ? "..." : authMode === "login" ? t.login : t.freeRegister}
          </button>
          {authMode === "register" && <p style={{ color: "#666", fontSize: "12px", textAlign: "center", marginTop: "12px" }}>{t.freeInfo}</p>}
          <p style={{ textAlign: "center", color: "#888", fontSize: "13px", cursor: "pointer", marginTop: "12px" }} onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>{authMode === "login" ? t.noAccount : t.hasAccount}</p>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "#444" }}>
          <span onClick={() => setPage("impressum")} style={{ cursor: "pointer", color: "#555" }}>{t.impressum}</span> &nbsp;|&nbsp;
          <span onClick={() => setPage("agb")} style={{ cursor: "pointer", color: "#555" }}>{t.agb}</span> &nbsp;|&nbsp;
          <span onClick={() => setPage("datenschutz")} style={{ cursor: "pointer", color: "#555" }}>{t.datenschutz}</span>
        </div>
      </div>
      <LegalModal />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Georgia', serif", color: "#e8e0d0", display: "flex", flexDirection: "column" }}>

      {showSidebar && isPremium && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div style={{ width: "280px", background: "#0d0d15", borderRight: "1px solid #2a2a3a", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #2a2a3a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#f0d080", fontWeight: "bold", letterSpacing: "1px" }}>{t.chats}</div>
              <button onClick={() => setShowSidebar(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ padding: "12px" }}>
              <button onClick={createNewChat} style={{ width: "100%", background: gold, color: "#0a0a0f", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>+ {t.newChat}</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
              {chats.map(chat => (
                <div key={chat.id} onClick={() => switchChat(chat.id)} style={{ padding: "10px 12px", borderRadius: "8px", cursor: "pointer", marginBottom: "4px", background: currentChatId === chat.id ? "#1a1a2a" : "transparent", border: currentChatId === chat.id ? "1px solid #2a2a3a" : "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#c8c0b0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>💬 {chat.title}</div>
                  <button onClick={(e) => deleteChat(chat.id, e)} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setShowSidebar(false)} />
        </div>
      )}

      <div style={{ borderBottom: "1px solid #2a2a3a", padding: "12px 16px", background: "linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isPremium && <button onClick={() => setShowSidebar(true)} style={{ background: "transparent", border: "1px solid #2a2a3a", borderRadius: "6px", padding: "6px 8px", cursor: "pointer", color: "#888", fontSize: "16px" }}>☰</button>}
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", color: "#0a0a0f" }}>M</div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "bold", letterSpacing: "1px", color: "#f0d080" }}>{t.title}</div>
              <div style={{ fontSize: "10px", color: "#888", letterSpacing: "2px" }}>{t.subtitle}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LangSwitch />
            <button onClick={handleLogout} style={{ background: "transparent", color: "#666", border: "1px solid #2a2a3a", padding: "5px 10px", borderRadius: "20px", cursor: "pointer", fontSize: "12px" }}>{t.logout}</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {!isPremium && <div style={{ fontSize: "11px", color: freeQuestions <= 1 ? "#e07050" : "#888", background: "#1a1a25", padding: "3px 8px", borderRadius: "20px", border: `1px solid ${freeQuestions <= 1 ? "#e07050" : "#2a2a3a"}` }}>{freeQuestions}/{FREE_LIMIT} {t.freeOf}</div>}
          {isPremium && <div style={{ fontSize: "11px", color: "#c9a84c", background: "rgba(201,168,76,0.1)", padding: "3px 10px", borderRadius: "20px", border: "1px solid #c9a84c" }}>{t.premium}</div>}
          {isPremium && <button onClick={() => window.open(STRIPE_PORTAL, '_blank')} style={{ fontSize: "11px", color: "#666", background: "transparent", border: "1px solid #2a2a3a", padding: "3px 8px", borderRadius: "20px", cursor: "pointer" }}>{t.manageAbo}</button>}
          {!isPremium && <button onClick={() => setShowUpgrade(true)} style={{ background: gold, color: "#0a0a0f", border: "none", padding: "5px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>{t.upgrade}</button>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: "720px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {showWelcome && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "bold", color: "#0a0a0f", margin: "0 auto 24px" }}>M</div>
            <h2 style={{ fontSize: "22px", color: "#f0d080", marginBottom: "8px", letterSpacing: "2px" }}>{t.welcome}</h2>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>{t.welcomeSub}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "500px", margin: "0 auto" }}>
              {t.suggested.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{ background: "#12121a", border: "1px solid #2a2a3a", color: "#c8c0b0", padding: "12px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textAlign: "left" }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "16px" }}>
            {msg.role === "assistant" && <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", color: "#0a0a0f", marginRight: "10px", flexShrink: 0 }}>M</div>}
            <div style={{ maxWidth: "80%", background: msg.role === "user" ? "linear-gradient(135deg, #c9a84c22, #c9a84c11)" : "#14141e", border: msg.role === "user" ? "1px solid #c9a84c44" : "1px solid #2a2a3a", padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontSize: "14px", lineHeight: "1.7" }}>
              {msg.imagePreview && <img src={msg.imagePreview} alt="uploaded" style={{ maxWidth: "200px", borderRadius: "8px", marginBottom: "8px", display: "block" }} />}
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", gap: "4px", padding: "12px 16px", background: "#14141e", border: "1px solid #2a2a3a", borderRadius: "4px 16px 16px 16px", width: "fit-content" }}>{[0,1,2].map(j => <div key={j} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c9a84c", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j*0.2}s` }} />)}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ borderTop: "1px solid #2a2a3a", padding: "16px 24px", background: "#0a0a0f", maxWidth: "720px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {imagePreview && (
          <div style={{ marginBottom: "8px", position: "relative", display: "inline-block" }}>
            <img src={imagePreview} alt="preview" style={{ height: "60px", borderRadius: "8px", border: "1px solid #c9a84c44" }} />
            <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} style={{ position: "absolute", top: "-8px", right: "-8px", background: "#e07050", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", color: "white", fontSize: "12px" }}>✕</button>
          </div>
        )}
        {!isPremium && freeQuestions <= 0 ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#e07050", fontSize: "13px", marginBottom: "10px" }}>{t.limitReached}</p>
            <button onClick={() => setShowUpgrade(true)} style={{ background: gold, color: "#0a0a0f", border: "none", padding: "10px 24px", borderRadius: "24px", cursor: "pointer", fontWeight: "bold" }}>{t.upgradeNow}</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {isPremium && (
              <>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" style={{ display: "none" }} />
                <button onClick={() => fileInputRef.current?.click()} style={{ background: "transparent", border: "1px solid #2a2a3a", borderRadius: "50%", width: "46px", height: "46px", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>📷</button>
              </>
            )}
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder={t.placeholder} style={{ flex: 1, background: "#14141e", border: "1px solid #2a2a3a", borderRadius: "24px", padding: "12px 18px", color: "#e0d8c8", fontSize: "14px", outline: "none" }} />
            <button onClick={() => sendMessage()} style={{ background: gold, color: "#0a0a0f", border: "none", borderRadius: "50%", width: "46px", height: "46px", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>→</button>
          </div>
        )}
        <FooterLinks />
      </div>

      {showUpgrade && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: "20px" }} onClick={() => setShowUpgrade(false)}>
          <div style={{ background: "#12121a", border: "1px solid #c9a84c44", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h3 style={{ color: "#f0d080", fontSize: "20px", letterSpacing: "2px" }}>{t.premiumTitle}</h3>
            </div>
            {[t.feature1, t.feature2, t.feature3, t.feature4].map((f, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #1e1e2a", color: "#c8c0b0", fontSize: "14px" }}>{f}</div>
            ))}
            <div style={{ textAlign: "center", margin: "24px 0 16px" }}>
              <div style={{ fontSize: "32px", color: "#f0d080", fontWeight: "bold" }}>9,99€</div>
              <div style={{ color: "#888", fontSize: "12px" }}>{t.perMonth}</div>
            </div>
            <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: "100%", background: gold, color: "#0a0a0f", border: "none", padding: "14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>{t.upgradeNow}</button>
            <button onClick={() => setShowUpgrade(false)} style={{ width: "100%", background: "transparent", border: "none", color: "#666", cursor: "pointer", marginTop: "10px" }}>{t.close}</button>
          </div>
        </div>
      )}

      <LegalModal />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } } * { margin: 0; padding: 0; box-sizing: border-box; } body { background: #0a0a0f; margin: 0; padding: 0; }`}</style>
    </div>
  );
}
