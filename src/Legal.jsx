// Legal pages component for Mr. Investor
// Add this as src/Legal.jsx

export function Impressum() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px", color: "#e8e0d0", fontFamily: "Georgia, serif", lineHeight: "1.8" }}>
      <h1 style={{ color: "#f0d080", letterSpacing: "2px", marginBottom: "32px" }}>IMPRESSUM</h1>
      
      <h2 style={{ color: "#c9a84c", marginBottom: "8px" }}>Angaben gemäß § 5 TMG</h2>
      <p>Julian Kauffeld<br />
      Menteweg 3<br />
      31675 Bückeburg<br />
      Deutschland</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>Kontakt</h2>
      <p>E-Mail: julian.kauffeld@gmx.de</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>Hinweis gemäß § 36 VSBG</h2>
      <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>Haftungsausschluss</h2>
      <p>Mr. Investor ist ein KI-gestützter Finanzassistent und ersetzt keine professionelle Finanzberatung. Alle Informationen dienen nur zu Informationszwecken.</p>
    </div>
  );
}

export function AGB() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px", color: "#e8e0d0", fontFamily: "Georgia, serif", lineHeight: "1.8" }}>
      <h1 style={{ color: "#f0d080", letterSpacing: "2px", marginBottom: "32px" }}>ALLGEMEINE GESCHÄFTSBEDINGUNGEN</h1>

      <h2 style={{ color: "#c9a84c", marginBottom: "8px" }}>§ 1 Geltungsbereich</h2>
      <p>Diese AGB gelten für die Nutzung von Mr. Investor (mr-investor.vercel.app), betrieben von Julian Kauffeld.</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>§ 2 Leistungsbeschreibung</h2>
      <p>Mr. Investor bietet einen KI-gestützten Finanzassistenten. Das Premium-Abonnement (9,99€/Monat) bietet unbegrenzte Nutzung. Die kostenlose Version ist auf 3 Fragen begrenzt.</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>§ 3 Kein Finanzrat</h2>
      <p>Mr. Investor ist kein lizenzierter Finanzberater. Alle Inhalte dienen nur zu Informationszwecken und stellen keine Anlageberatung dar.</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>§ 4 Abonnement & Kündigung</h2>
      <p>Das Premium-Abonnement verlängert sich monatlich automatisch. Eine Kündigung ist jederzeit möglich und wird zum Ende des bezahlten Zeitraums wirksam.</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>§ 5 Widerrufsrecht</h2>
      <p>Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Kontakt: julian.kauffeld@gmx.de</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>§ 6 Haftung</h2>
      <p>Eine Haftung für finanzielle Verluste aufgrund der Nutzung von Mr. Investor wird ausgeschlossen.</p>
    </div>
  );
}

export function Datenschutz() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px", color: "#e8e0d0", fontFamily: "Georgia, serif", lineHeight: "1.8" }}>
      <h1 style={{ color: "#f0d080", letterSpacing: "2px", marginBottom: "32px" }}>DATENSCHUTZERKLÄRUNG</h1>

      <h2 style={{ color: "#c9a84c", marginBottom: "8px" }}>1. Verantwortlicher</h2>
      <p>Julian Kauffeld, Menteweg 3, 31675 Bückeburg<br />
      E-Mail: julian.kauffeld@gmx.de</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>2. Erhobene Daten</h2>
      <p>Wir erheben: E-Mail-Adresse bei Registrierung, Chat-Nachrichten zur KI-Verarbeitung, Zahlungsdaten über Stripe (werden nicht bei uns gespeichert).</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>3. Zweck der Datenverarbeitung</h2>
      <p>Ihre Daten werden ausschließlich zur Bereitstellung des Dienstes verwendet. Chat-Nachrichten werden an die Anthropic API zur KI-Verarbeitung weitergeleitet.</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>4. Drittanbieter</h2>
      <p>Wir nutzen: Supabase (Datenspeicherung, EU), Anthropic (KI-Verarbeitung, USA), Stripe (Zahlungsabwicklung), Vercel (Hosting, USA).</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>5. Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Kontakt: julian.kauffeld@gmx.de</p>

      <h2 style={{ color: "#c9a84c", margin: "24px 0 8px" }}>6. Cookies</h2>
      <p>Wir verwenden technisch notwendige Cookies für die Anmeldung. Es werden keine Tracking-Cookies verwendet.</p>
    </div>
  );
}
