import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Du bist Mr. Investor, ein freundlicher aber direkter KI-Finanzberater für Deutsche. Du hilfst bei:
- Persönlicher Finanzplanung und Budgetierung
- Investing-Fragen (ETFs, S&P 500, Aktien, Trade Republic etc.)
- Sparstrategien und Zinseszins-Berechnungen
- Finanzielle Ziele erreichen

Antworte immer auf Deutsch. Sei präzise, hilfreich und motivierend. Nutze gelegentlich Zahlen und konkrete Beispiele. 
Wenn jemand nach einem Investmentplan fragt, erstelle einen strukturierten Plan mit Phasen.
Halte Antworten kompakt aber informativ. Maximal 200 Wörter pro Antwort.
Du bist kein lizenzierter Finanzberater - weise bei komplexen Fragen darauf hin einen Profi zu konsultieren.`;

const FREE_LIMIT = 5;

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    if (!isPremium && freeQuestions <= 0) {
      setShowUpgrade(true);
      return;
    }
    setShowWelcome(false);
    setInput("");
    setLoading(true);
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    if (!isPremium) setFreeQuestions((q) => q - 1);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Fehler beim Laden.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Verbindungsfehler." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Georgia', serif", color: "#e8e0d0", display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid #2a2a3a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #f0d080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold", color: "#0a0a0f" }}>M</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "1px", color: "#f0d080" }}>MR. INVESTOR</div>
            <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px" }}>KI FINANZBERATER</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!isPremium && <div style={{ fontSize: "12px", color: freeQuestions <= 2 ? "#e07050" : "#888", background: "#1a1a25", padding: "4px 10px", borderRadius: "20px", border: `1px solid ${freeQuestions <= 2 ? "#e07050" : "#2a2a3a"}` }}>{freeQuestions} / {FREE_LIMIT} gratis</div>}
          {isPremium ? <div style={{ fontSize: "12px", color: "#c9a84c", background: "rgba(201,168,76,0.1)", padding: "4px 12px", borderRadius: "20px", border: "1px solid #c9a84c" }}>✦ PREMIUM</div> : <button onClick={() => setShowUpgrade(true)} style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)", color: "#0a0a0f", border: "none", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>UPGRADE</button>}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: "720px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {showWelcome && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #f0d080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "bold", color: "#0a0a0f", margin: "0 auto 24px" }}>M</div>
            <h2 style={{ fontSize: "22px", color: "#f0d080", marginBottom: "8px", letterSpacing: "2px" }}>WILLKOMMEN BEI MR. INVESTOR</h2>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>Dein persönlicher KI-Finanzberater.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "500px", margin: "0 auto" }}>
              {suggestedQuestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{ background: "#12121a", border: "1px solid #2a2a3a", color: "#c8c0b0", padding: "12px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textAlign: "left" }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "16px" }}>
            {msg.role === "assistant" && <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #f0d080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", color: "#0a0a0f", marginRight: "10px", flexShrink: 0 }}>M</div>}
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
            <button onClick={() => setShowUpgrade(true)} style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)", color: "#0a0a0f", border: "none", padding: "10px 24px", borderRadius: "24px", cursor: "pointer", fontWeight: "bold" }}>JETZT UPGRADEN – 9,99€/Monat</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Frage Mr. Investor..." style={{ flex: 1, background: "#14141e", border: "1px solid #2a2a3a", borderRadius: "24px", padding: "12px 18px", color: "#e0d8c8", fontSize: "14px", outline: "none" }} />
            <button onClick={() => sendMessage()} style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)", color: "#0a0a0f", border: "none", borderRadius: "50%", width: "46px", height: "46px", cursor: "pointer", fontSize: "18px" }}>→</button>
          </div>
        )}
      </div>
      {showUpgrade && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowUpgrade(false)}>
          <div style={{ background: "#12121a", border: "1px solid #c9a84c44", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h3 style={{ color: "#f0d080", fontSize: "20px", letterSpacing: "2px" }}>MR. INVESTOR PREMIUM</h3>
            </div>
            {["✦ Unbegrenzte Fragen", "✦ Persönliche Investmentpläne", "✦ Zinseszins-Rechner", "✦ Prioritäts-Support"].map((f, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #1e1e2a", color: "#c8c0b0", fontSize: "14px" }}>{f}</div>
            ))}
            <div style={{ textAlign: "center", margin: "24px 0 16px" }}>
              <div style={{ fontSize: "32px", color: "#f0d080", fontWeight: "bold" }}>9,99€</div>
              <div style={{ color: "#888", fontSize: "12px" }}>pro Monat</div>
            </div>
            <button onClick={() => { setIsPremium(true); setShowUpgrade(false); }} style={{ width: "100%", background: "linear-gradient(135deg, #c9a84c, #f0d080)", color: "#0a0a0f", border: "none", padding: "14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>JETZT UPGRADEN</button>
            <button onClick={() => setShowUpgrade(false)} style={{ width: "100%", background: "transparent", border: "none", color: "#666", cursor: "pointer", marginTop: "10px" }}>Schließen</button>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
    </div>
  );
            }
