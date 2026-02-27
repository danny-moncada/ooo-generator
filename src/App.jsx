import { useState, createContext, useContext } from "react";
import { Copy, Check, Sparkles, Wand2, RefreshCw, Loader2, Shuffle, ChevronDown, Sun, Moon, Mail } from "lucide-react";
import { TONES, REASONS, SPICE_LABELS, fmt, generateSubjectTemplate, generateTemplate, themes } from "./utils";

const ThemeCtx = createContext();

function EmailPreview({ subject, message, name }) {
  const th = useContext(ThemeCtx);
  if (!message) return null;
  return (
    <div style={{ background: th.previewBg, borderRadius: 12, overflow: "hidden", border: `1px solid ${th.previewBorder}` }}>
      <div style={{ background: th.previewHeader, padding: "12px 16px", borderBottom: `1px solid ${th.cardBorder}`, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: th.red }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: th.yellow }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: th.green }} />
        <span style={{ marginLeft: 12, color: th.textDim, fontSize: 13, fontWeight: 500 }}>Mail Preview</span>
      </div>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${th.cardBorder}` }}>
        {[["From:", `${name || "you"}@company.com`], ["To:", "sender@example.com"], ["Subject:", subject || "Re: Your message — Out of Office"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
            <span style={{ color: th.textDim, minWidth: 52 }}>{l}</span>
            <span style={{ color: th.text, fontWeight: l === "Subject:" ? 600 : 400 }}>{v}</span>
          </div>
        ))}
      </div>
      <div data-testid="message-body" style={{ padding: "20px 20px 24px", color: th.text, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "'Georgia', serif" }}>
        {message}
      </div>
    </div>
  );
}

function SubjectBadge({ subject, onReroll }) {
  const th = useContext(ThemeCtx);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(subject); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  if (!subject) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "10px 14px",
      borderRadius: 10, background: th.accentBg, border: `1px solid ${th.accentBorder}`,
    }}>
      <Mail size={14} style={{ color: th.accent, flexShrink: 0 }} />
      <span data-testid="subject-line" style={{ fontSize: 13, color: th.accent, fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {subject}
      </span>
      <button onClick={onReroll} aria-label="Reroll subject" style={{ background: "none", border: "none", cursor: "pointer", color: th.textDim, padding: 4, display: "flex" }}>
        <Shuffle size={13} />
      </button>
      <button onClick={copy} aria-label="Copy subject" style={{ background: "none", border: "none", cursor: "pointer", color: copied ? th.successText : th.textDim, padding: 4, display: "flex" }}>
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}

export default function OOOGenerator() {
  const [dark, setDark] = useState(true);
  const th = dark ? themes.dark : themes.light;

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("Vacation");
  const [customReason, setCustomReason] = useState("");
  const [backup, setBackup] = useState("");
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState("professional");
  const [mode, setMode] = useState("template");
  const [spice, setSpice] = useState(3);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  const activeReason = reason === "Other" ? customReason : reason;
  const inputs = { name, startDate, endDate, reason: activeReason, backup, notes };

  function rerollSubject() {
    setSubject(generateSubjectTemplate(tone, activeReason));
  }

  async function generateAI() {
    setLoading(true); setError("");
    try {
      const sp = SPICE_LABELS[spice - 1];
      const toneLabel = TONES.find(t => t.id === tone).label;
      const prompt = `Generate an out-of-office auto-reply email.\n\nDetails:\n- Name: ${name || "not provided"}\n- Away: ${fmt(startDate) || "?"} to ${fmt(endDate) || "?"}\n- Reason: ${activeReason || "not specified"}\n- Backup contact: ${backup || "none"}\n- Additional notes: ${notes || "none"}\n- Tone: ${toneLabel}\n- Spice/intensity level: ${spice}/5 (${sp})\n\nRespond with ONLY valid JSON in this exact format, no other text:\n{"subject": "the email subject line", "body": "the full message body"}\n\nMake it creative, memorable, and perfectly match the tone. ${spice >= 4 ? "Go bold. Push boundaries. Be unforgettable." : ""} ${spice <= 2 ? "Keep it restrained and corporate-appropriate." : ""} Use the name in the sign-off if provided.`;

      const res = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed.body) {
        setMessage(parsed.body);
        setSubject(parsed.subject || generateSubjectTemplate(tone, activeReason));
      } else throw new Error("Bad response");
    } catch (e) {
      setError("AI generation failed — here's a template instead!");
      setMessage(generateTemplate(inputs, tone));
      setSubject(generateSubjectTemplate(tone, activeReason));
    } finally { setLoading(false); setGenerated(true); }
  }

  function generate() {
    if (mode === "ai") { generateAI(); }
    else {
      setMessage(generateTemplate(inputs, tone));
      setSubject(generateSubjectTemplate(tone, activeReason));
      setGenerated(true);
    }
  }

  function randomTone() {
    const others = TONES.filter(t => t.id !== tone);
    setTone(others[Math.floor(Math.random() * others.length)].id);
  }

  function copyAll() {
    const full = subject ? `Subject: ${subject}\n\n${message}` : message;
    navigator.clipboard.writeText(full).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${th.inputBorder}`, background: th.input,
    color: th.text, fontSize: 14, outline: "none", transition: "border 0.2s",
    boxSizing: "border-box"
  };
  const labelStyle = { display: "block", marginBottom: 6, color: th.textMuted, fontSize: 13, fontWeight: 500 };

  return (
    <ThemeCtx.Provider value={th}>
      <div style={{ minHeight: "100vh", background: th.bg, color: th.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", transition: "background 0.4s, color 0.3s" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 60px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40, position: "relative" }}>
            <button onClick={() => setDark(!dark)} aria-label="Toggle theme" style={{
              position: "absolute", right: 0, top: 0, background: th.btnBg,
              border: `1px solid ${th.btnBorder}`, borderRadius: 10, padding: "8px 12px",
              cursor: "pointer", color: th.textMuted, display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, transition: "all 0.3s"
            }}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
              {dark ? "Light" : "Dark"}
            </button>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏖️</div>
            <h1 style={{
              fontSize: 32, fontWeight: 700, margin: "0 0 8px",
              background: th.headerGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              OOO Generator
            </h1>
            <p style={{ color: th.textDim, fontSize: 15, margin: 0 }}>
              Because "I'm out of office" deserves better than "I'm out of office"
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
            {/* Left: Form */}
            <div style={{ background: th.card, borderRadius: 16, border: `1px solid ${th.cardBorder}`, padding: 24, transition: "background 0.3s, border 0.3s" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Your Name</label>
                  <input style={inputStyle} placeholder="Danny" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Backup Contact</label>
                  <input style={inputStyle} placeholder="Alex from Engineering" value={backup} onChange={e => setBackup(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" aria-label="Start date" style={{ ...inputStyle, colorScheme: th.colorScheme }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" aria-label="End date" style={{ ...inputStyle, colorScheme: th.colorScheme }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Reason</label>
                <div style={{ position: "relative" }}>
                  <select aria-label="Reason" style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }} value={reason} onChange={e => setReason(e.target.value)}>
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: th.textDim, pointerEvents: "none" }} />
                </div>
                {reason === "Other" && (
                  <input style={{ ...inputStyle, marginTop: 8 }} placeholder="Your custom reason..." value={customReason} onChange={e => setCustomReason(e.target.value)} />
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Additional Notes (optional)</label>
                <textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} placeholder="e.g. No laptop, checking email sporadically..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              {/* Tone Selector */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={{ ...labelStyle, margin: 0 }}>Tone</label>
                  <button onClick={randomTone} aria-label="Random tone" style={{
                    background: "none", border: "none", color: th.textDim, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 8px", borderRadius: 6
                  }}>
                    <Shuffle size={12} /> Surprise me
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {TONES.map(t => (
                    <button key={t.id} onClick={() => setTone(t.id)} aria-label={`Tone: ${t.label}`} aria-pressed={tone === t.id} style={{
                      padding: "10px 8px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                      border: tone === t.id ? `1.5px solid ${th.accent}` : `1px solid ${th.btnBorder}`,
                      background: tone === t.id ? th.accentBg : th.btnBg,
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 2 }}>{t.emoji}</div>
                      <div style={{ fontSize: 11, color: tone === t.id ? th.accent : th.textMuted, fontWeight: tone === t.id ? 600 : 400 }}>
                        {t.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode + Spice */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 24 }}>
                <div style={{ flex: "0 0 auto" }}>
                  <label style={labelStyle}>Mode</label>
                  <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${th.inputBorder}` }}>
                    {[["template", "Template", Wand2], ["ai", "AI ✨", Sparkles]].map(([m, label, Icon]) => (
                      <button key={m} onClick={() => setMode(m)} aria-label={`Mode: ${label}`} aria-pressed={mode === m} style={{
                        padding: "8px 16px", cursor: "pointer", border: "none",
                        background: mode === m ? th.accentBg : "transparent",
                        color: mode === m ? th.accent : th.textDim,
                        fontSize: 13, fontWeight: mode === m ? 600 : 400,
                        display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
                      }}>
                        <Icon size={14} /> {label}
                      </button>
                    ))}
                  </div>
                </div>
                {mode === "ai" && (
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Spice Level: {SPICE_LABELS[spice - 1]}</label>
                    <input type="range" min={1} max={5} value={spice} aria-label="Spice level" onChange={e => setSpice(+e.target.value)} style={{ width: "100%", accentColor: th.accent, cursor: "pointer" }} />
                  </div>
                )}
              </div>

              {/* Generate */}
              <button onClick={generate} disabled={loading} data-testid="generate-btn" style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: loading ? "wait" : "pointer",
                background: loading ? th.accentBg : th.genBg,
                color: th.genText, fontSize: 15, fontWeight: 700, transition: "all 0.3s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.7 : 1,
                boxShadow: loading ? "none" : `0 4px 20px ${th.accentBg}`
              }}>
                {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Generating...</>
                  : generated ? <><RefreshCw size={18} /> Regenerate</> : <><Sparkles size={18} /> Generate Message</>}
              </button>
            </div>

            {/* Right: Preview */}
            <div>
              {!message && !loading ? (
                <div style={{
                  background: th.card, borderRadius: 16,
                  border: `1px dashed ${th.emptyBorder}`, padding: "80px 40px", textAlign: "center",
                  transition: "all 0.3s"
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📬</div>
                  <p style={{ color: th.textDim, fontSize: 15, margin: 0 }}>
                    Fill in the details and hit Generate to preview your OOO message
                  </p>
                </div>
              ) : loading ? (
                <div style={{
                  background: th.card, borderRadius: 16,
                  border: `1px solid ${th.cardBorder}`, padding: "80px 40px", textAlign: "center"
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 2s linear infinite" }}>✨</div>
                  <p style={{ color: th.textMuted, fontSize: 15, margin: 0 }}>
                    Claude is crafting your perfect OOO message...
                  </p>
                </div>
              ) : (
                <div>
                  {error && (
                    <div role="alert" style={{
                      padding: "10px 14px", borderRadius: 8, marginBottom: 12,
                      background: th.warnBg, border: `1px solid ${th.warnBorder}`, color: th.warnText, fontSize: 13
                    }}>{error}</div>
                  )}
                  <SubjectBadge subject={subject} onReroll={rerollSubject} />
                  <EmailPreview subject={subject} message={message} name={name} />
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button onClick={copyAll} data-testid="copy-btn" style={{
                      flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                      border: `1px solid ${copied ? th.successBorder : th.btnBorder}`,
                      background: copied ? th.successBg : th.btnBg,
                      color: copied ? th.successText : th.text,
                      fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s"
                    }}>
                      {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy All</>}
                    </button>
                    <button onClick={generate} disabled={loading} aria-label="Remix" style={{
                      padding: "12px 20px", borderRadius: 10, cursor: "pointer",
                      border: `1px solid ${th.btnBorder}`, background: th.btnBg,
                      color: th.text, fontSize: 14, display: "flex", alignItems: "center", gap: 6
                    }}>
                      <RefreshCw size={14} /> Remix
                    </button>
                  </div>
                  <div style={{ marginTop: 10, textAlign: "right", color: th.textDim, fontSize: 12 }}>
                    {message.split(/\s+/).length} words · {message.length} chars
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          input:focus, textarea:focus, select:focus { border-color: ${th.accentBorder} !important; }
          button:hover { filter: brightness(1.1); }
          ::selection { background: ${th.accentBg}; }
          @media (max-width: 768px) {
            div[style*="gridTemplateColumns: 1fr 1fr"][style*="gap: 28"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </ThemeCtx.Provider>
  );
}
