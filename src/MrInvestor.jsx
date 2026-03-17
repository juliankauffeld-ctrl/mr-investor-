import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const SYSTEM_PROMPT = `Du bist Mr. Investor, ein freundlicher aber direkter KI-Finanzassistent für Deutsche. Du hilfst bei:
- Persönlicher Finanzplanung und Budgetierung
- Investing-Fragen (ETFs, S&P 500, Aktien, Trade Republic etc.)
- Sparstrategien und Zinseszins-Berechnungen
- Finanzielle Ziele erreichen

Antworte immer auf Deutsch. Sei präzise, hilfreich und motivierend. Nutze gelegentlich Zahlen und konkrete Beispiele. 
Wenn jemand nach einem Investmentplan fragt, erstelle einen strukturierten Plan mit Phasen.
Halte Antworten kompakt aber informativ. Maximal 200 Wörter pro Antwort.
Du bist kein lizenzierter Finanzberater - weise bei komplexen Fragen darauf hin einen Profi zu konsultieren.`;

const FREE_LIMIT = 3;
const STRIPE_LINK = "https://buy.stripe.com/cNi6oAaZt7YK6Br6pr38401";
const STRIPE_PORTAL = "https://billing.stripe.com/p/login/9B67sEebF2Eq9NDcNP38400";

const suggestedQuestions = [
  "Wie fange ich mit ETF Investing an?",
  "Was ist der S&P 500?",
  "Wie spare ich 10.000€ in 2 Jahren?",
  "Trade Republic oder andere Broker?",
];

export default function MrInvestor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeQuestions, setFreeQuestions] = useState(FREE_LIMIT);
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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (session?.user) {
        checkPremium(session.user.id);
        loadMessages(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPremium(session.user.id);
        loadMessages(session.user.id);
      } else {
        setMessages([]);
        setShowWelcome(true);
        setIsPremium(false);
        setFreeQuestions(FREE_LIMIT);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadMessages = async (userId) => {
    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);
    if (data && data.length > 0) {
      setMessages(data);
      setShowWelcome(false);
    }
  };

  const saveMessage = async (userId, role, content) => {
    await supabase.from("messages").insert({ user_id: userId, role, content });
  };

  const checkPremium = async (userId) => {
    const { data } = await supabase.from("profiles").select("is_premium, free_questions_used").eq("id", userId).single();
    if (data) {
      setIsPremium(data.is_premium || false);
      setFreeQuestions(data.is_premium ? 999 : Math.max(0, FREE_LIMIT - (data.free_questions_used || 0)));
    }
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setAuthError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setAuthError(error.message);
        else setAuthError("✅ Bestätigungs-Email gesendet! Bitte prüfe dein Postfach.");
      }
    } catch { setAuthError("Ein Fehler ist aufgetreten."); }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from("messages").delete().eq("user_id", user.id);
    setMessages([]);
    setShowWelcome(true);
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || !user) return;
    if (!isPremium && freeQuestions <= 0) { setShowUpgrade(true); return; }
    setShowWelcome(false);
    setInput("");
    setLoading(true);
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    saveMessage(user.id, "user", userText);

    if (!isPremium) {
      setFreeQuestions((q) => q - 1);
      const { data: profile } = await supabase.from("profiles").select("free_questions_used").eq("id", user.id).single();
      await supabase.from("profiles").upsert({ id: user.id, free_questions_used: (profile?.free_questions_used || 0) + 1 });
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: newMessages }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Fehler beim Laden.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
      saveMessage(user.id, "assistant", reply);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Verbindungsfehler." }]);
    }
    setLoading(false);
  };

  const gold = "linear-gradient(135deg, #c9a84c, #f0d080)";

  // Loading screen
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: gold }} />
    </div>
  );

  // Login/Register screen - shown when not logged in
  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "bold", color: "#0a0a0f", margin: "0 auto 20px" }}>M</div>
          <h1 style={{ color: "#f0d080", fontSize: "24px", letterSpacing: "2px", marginBottom: "8px" }}>MR. INVESTOR</h1>
          <p style={{ color: "#888", fontSize: "14px" }}>Dein persönlicher KI-Finanzassistent</p>
        </div>

        <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "16px", padding: "32px" }}>
          <div style={{ display: "flex", marginBottom: "24px", background: "#0a0a0f", borderRadius: "8px", padding: "4px" }}>
            <button onClick={() => { setAuthMode("login"); setAuthError(""); }} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", background: authMode === "login" ? gold : "transparent", color: authMode === "login" ? "#0a0a0f" : "#888", fontWeight: "bold", fontSize: "13px" }}>Einloggen</button>
            <button onClick={() => { setAuthMode("register"); setAuthError(""); }} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", background: authMode === "register" ? gold : "transparent", color: authMode === "register" ? "#0a0a0f" : "#888", fontWeight: "bold", fontSize: "13px" }}>Registrieren</button>
          </div>

          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: "8px", padding: "12px", color: "#e0d8c8", fontSize: "14px", outline: "none", marginBottom: "12px", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
          <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} placeholder="Passwort" type="password" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: "8px", padding: "12px", color: "#e0d8c8", fontSize: "14px", outline: "none", marginBottom: "16px", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />

          {authError && <p style={{ color: authError.includes("✅") ? "#4CAF50" : "#e07050", fontSize: "13px", marginBottom: "12px" }}>{authError}</p>}

          <button onClick={handleAuth} disabled={authLoading} style={{ width: "100%", background: gold, color: "#0a0a0f", border: "none", padding: "14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
            {authLoading ? "..." : authMode === "login" ? "Einloggen" : "Kostenlos registrieren"}
          </button>

          {authMode === "register" && <p style={{ color: "#666", fontSize: "12px", textAlign: "center", marginTop: "12px" }}>3 kostenlose Fragen · Premium ab 9,99€/Monat</p>}
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "#444" }}>
          <span onClick={() => setPage("impressum")} style={{ cursor: "pointer", color: "#555" }}>Impressum</span> &nbsp;|&nbsp;
          <span onClick={() => setPage("agb")} style={{ cursor: "pointer", color: "#555" }}>AGB</span> &nbsp;|&nbsp;
          <span onClick={() => setPage("datenschutz")} style={{ cursor: "pointer", color: "#555" }}>Datenschutz</span>
        </div>
      </div>

      {page !== "home" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px", overflowY: "auto" }} onClick={() => setPage("home")}>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "16px", padding: "32px", maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPage("home")} style={{ background: "transparent", border: "none", color: "#c9a84c", cursor: "pointer", marginBottom: "16px" }}>← Zurück</button>
            {page === "impressum" && <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}><h2 style={{ color: "#f0d080" }}>IMPRESSUM</h2><p>Julian Kauffeld<br />Menteweg 3<br />31675 Bückeburg<br />E-Mail: julian.kauffeld@gmx.de</p></div>}
            {page === "agb" && <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}><h2 style={{ color: "#f0d080" }}>AGB</h2><p>Betreiber: Julian Kauffeld. Premium 9,99€/Monat, monatlich kündbar. Kein lizenzierter Finanzberater. 14 Tage Widerrufsrecht. Kontakt: julian.kauffeld@gmx.de</p></div>}
            {page === "datenschutz" && <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}><h2 style={{ color: "#f0d080" }}>DATENSCHUTZ</h2><p>Verantwortlich: Julian Kauffeld, julian.kauffeld@gmx.de. Daten: Email, Chat-Nachrichten. Drittanbieter: Supabase (EU), Anthropic, Stripe, Vercel.</p></div>}
          </div>
        </div>
      )}
    </div>
  );

  // Main app - only shown when logged in
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Georgia', serif", color: "#e8e0d0", display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid #2a2a3a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold", color: "#0a0a0f" }}>M</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "1px", color: "#f0d080" }}>MR. INVESTOR</div>
            <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px" }}>KI FINANZASSISTENT</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!isPremium && <div style={{ fontSize: "12px", color: freeQuestions <= 1 ? "#e07050" : "#888", background: "#1a1a25", padding: "4px 10px", borderRadius: "20px", border: `1px solid ${freeQuestions <= 1 ? "#e07050" : "#2a2a3a"}` }}>{freeQuestions} / {FREE_LIMIT} gratis</div>}
          {isPremium && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ fontSize: "12px", color: "#c9a84c", background: "rgba(201,168,76,0.1)", padding: "4px 12px", borderRadius: "20px", border: "1px solid #c9a84c" }}>✦ PREMIUM</div><button onClick={() => window.open(STRIPE_PORTAL, '_blank')} style={{ fontSize: "11px", color: "#666", background: "transparent", border: "1px solid #2a2a3a", padding: "4px 10px", borderRadius: "20px", cursor: "pointer" }}>Abo verwalten</button></div>}
          {messages.length > 0 && <button onClick={clearHistory} style={{ background: "transparent", color: "#555", border: "1px solid #2a2a3a", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "11px" }}>Verlauf löschen</button>}
          {!isPremium && <button onClick={() => setShowUpgrade(true)} style={{ background: gold, color: "#0a0a0f", border: "none", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>UPGRADE</button>}
          <button onClick={handleLogout} style={{ background: "transparent", color: "#666", border: "1px solid #2a2a3a", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px" }}>Logout</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: "720px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {showWelcome && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "bold", color: "#0a0a0f", margin: "0 auto 24px" }}>M</div>
            <h2 style={{ fontSize: "22px", color: "#f0d080", marginBottom: "8px", letterSpacing: "2px" }}>WILLKOMMEN BEI MR. INVESTOR</h2>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>Dein persönlicher KI-Finanzassistent.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "500px", margin: "0 auto" }}>
              {suggestedQuestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{ background: "#12121a", border: "1px solid #2a2a3a", color: "#c8c0b0", padding: "12px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textAlign: "left" }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "16px" }}>
            {msg.role === "assistant" && <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", color: "#0a0a0f", marginRight: "10px", flexShrink: 0 }}>M</div>}
            <div style={{ maxWidth: "80%", background: msg.role === "user" ? "linear-gradient(135deg, #c9a84c22, #c9a84c11)" : "#14141e", border: msg.role === "user" ? "1px solid #c9a84c44" : "1px solid #2a2a3a", padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", gap: "4px", padding: "12px 16px", background: "#14141e", border: "1px solid #2a2a3a", borderRadius: "4px 16px 16px 16px", width: "fit-content" }}>{[0,1,2].map(j => <div key={j} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c9a84c", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j*0.2}s` }} />)}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ borderTop: "1px solid #2a2a3a", padding: "16px 24px", background: "#0a0a0f", maxWidth: "720px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {!isPremium && freeQuestions <= 0 ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#e07050", fontSize: "13px", marginBottom: "10px" }}>Gratis-Limit erreicht.</p>
            <button onClick={() => setShowUpgrade(true)} style={{ background: gold, color: "#0a0a0f", border: "none", padding: "10px 24px", borderRadius: "24px", cursor: "pointer", fontWeight: "bold" }}>JETZT UPGRADEN – 9,99€/Monat</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Frage Mr. Investor..." style={{ flex: 1, background: "#14141e", border: "1px solid #2a2a3a", borderRadius: "24px", padding: "12px 18px", color: "#e0d8c8", fontSize: "14px", outline: "none" }} />
            <button onClick={() => sendMessage()} style={{ background: gold, color: "#0a0a0f", border: "none", borderRadius: "50%", width: "46px", height: "46px", cursor: "pointer", fontSize: "18px" }}>→</button>
          </div>
        )}
        <div style={{ textAlign: "center", fontSize: "11px", color: "#444", marginTop: "8px" }}>
          Kein lizenzierter Finanzberater. &nbsp;|&nbsp;
          <span onClick={() => setPage("impressum")} style={{ cursor: "pointer", color: "#666" }}>Impressum</span> &nbsp;|&nbsp;
          <span onClick={() => setPage("agb")} style={{ cursor: "pointer", color: "#666" }}>AGB</span> &nbsp;|&nbsp;
          <span onClick={() => setPage("datenschutz")} style={{ cursor: "pointer", color: "#666" }}>Datenschutz</span>
        </div>
      </div>

      {showUpgrade && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }} onClick={() => setShowUpgrade(false)}>
          <div style={{ background: "#12121a", border: "1px solid #c9a84c44", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h3 style={{ color: "#f0d080", fontSize: "20px", letterSpacing: "2px" }}>MR. INVESTOR PREMIUM</h3>
            </div>
            {["✦ Unbegrenzte Fragen", "✦ Chat-Verlauf gespeichert", "✦ Persönliche Investmentpläne", "✦ Prioritäts-Support"].map((f, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #1e1e2a", color: "#c8c0b0", fontSize: "14px" }}>{f}</div>
            ))}
            <div style={{ textAlign: "center", margin: "24px 0 16px" }}>
              <div style={{ fontSize: "32px", color: "#f0d080", fontWeight: "bold" }}>9,99€</div>
              <div style={{ color: "#888", fontSize: "12px" }}>pro Monat</div>
            </div>
            <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: "100%", background: gold, color: "#0a0a0f", border: "none", padding: "14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>JETZT UPGRADEN – 9,99€/Monat</button>
            <button onClick={() => setShowUpgrade(false)} style={{ width: "100%", background: "transparent", border: "none", color: "#666", cursor: "pointer", marginTop: "10px" }}>Schließen</button>
          </div>
        </div>
      )}

      {page !== "home" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }} onClick={() => setPage("home")}>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "16px", padding: "32px", maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPage("home")} style={{ background: "transparent", border: "none", color: "#c9a84c", cursor: "pointer", marginBottom: "16px" }}>← Zurück</button>
            {page === "impressum" && <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}><h2 style={{ color: "#f0d080" }}>IMPRESSUM</h2><p>Julian Kauffeld<br />Menteweg 3<br />31675 Bückeburg<br />E-Mail: julian.kauffeld@gmx.de</p></div>}
            {page === "agb" && <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}><h2 style={{ color: "#f0d080" }}>AGB</h2><p>Betreiber: Julian Kauffeld. Premium 9,99€/Monat, monatlich kündbar. Kein lizenzierter Finanzberater. 14 Tage Widerrufsrecht. Kontakt: julian.kauffeld@gmx.de</p></div>}
            {page === "datenschutz" && <div style={{ color: "#e8e0d0", lineHeight: "1.8" }}><h2 style={{ color: "#f0d080" }}>DATENSCHUTZ</h2><p>Verantwortlich: Julian Kauffeld, julian.kauffeld@gmx.de. Daten: Email, Chat-Nachrichten. Drittanbieter: Supabase (EU), Anthropic, Stripe, Vercel.</p></div>}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}
