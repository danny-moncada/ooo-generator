export const TONES = [
  { id: "professional", label: "Professional", emoji: "👔" },
  { id: "friendly", label: "Friendly", emoji: "😊" },
  { id: "hilarious", label: "Hilarious", emoji: "🤣" },
  { id: "passive_aggressive", label: "Passive-Aggressive", emoji: "🙃" },
  { id: "mysterious", label: "Mysterious", emoji: "🕵️" },
  { id: "pirate", label: "Pirate", emoji: "🏴‍☠️" },
  { id: "haiku", label: "Haiku", emoji: "🎋" },
  { id: "gen_z", label: "Gen Z", emoji: "💀" },
];

export const REASONS = [
  "Vacation", "Conference", "Parental Leave", "Sick Day",
  "Mental Health Day", "Sabbatical", "Jury Duty",
  "Witness Protection", "Alien Abduction", "Other",
];

export const SPICE_LABELS = [
  "Mild 🌱", "Warm 🌶️", "Medium 🔥", "Hot 🌋", "Unhinged 💥",
];

export const themes = {
  dark: {
    bg: "linear-gradient(135deg, #11111b 0%, #181825 50%, #1e1e2e 100%)",
    card: "rgba(255,255,255,0.03)", cardBorder: "rgba(255,255,255,0.06)",
    input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.1)",
    text: "#cdd6f4", textMuted: "#a6adc8", textDim: "#6c7086",
    accent: "#cba6f7", accentBg: "rgba(203,166,247,0.1)", accentBorder: "rgba(203,166,247,0.4)",
    previewBg: "#1e1e2e", previewHeader: "#181825", previewBorder: "rgba(255,255,255,0.08)",
    btnBg: "rgba(255,255,255,0.05)", btnBorder: "rgba(255,255,255,0.1)",
    red: "#f38ba8", yellow: "#f9e2af", green: "#a6e3a1",
    warnBg: "rgba(249,226,175,0.1)", warnBorder: "rgba(249,226,175,0.2)", warnText: "#f9e2af",
    successBg: "rgba(166,227,161,0.1)", successBorder: "rgba(166,227,161,0.3)", successText: "#a6e3a1",
    genBg: "linear-gradient(135deg, #cba6f7, #89b4fa)", genText: "#11111b",
    headerGrad: "linear-gradient(135deg, #cba6f7, #89b4fa, #a6e3a1)",
    emptyBorder: "rgba(255,255,255,0.1)", colorScheme: "dark",
  },
  light: {
    bg: "linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 50%, #f0f0f5 100%)",
    card: "rgba(255,255,255,0.7)", cardBorder: "rgba(0,0,0,0.08)",
    input: "rgba(255,255,255,0.9)", inputBorder: "rgba(0,0,0,0.12)",
    text: "#1e1e2e", textMuted: "#555", textDim: "#888",
    accent: "#7c3aed", accentBg: "rgba(124,58,237,0.08)", accentBorder: "rgba(124,58,237,0.4)",
    previewBg: "#ffffff", previewHeader: "#f8f8fa", previewBorder: "rgba(0,0,0,0.1)",
    btnBg: "rgba(0,0,0,0.04)", btnBorder: "rgba(0,0,0,0.1)",
    red: "#e54560", yellow: "#d4a017", green: "#2d9c46",
    warnBg: "rgba(212,160,23,0.08)", warnBorder: "rgba(212,160,23,0.2)", warnText: "#a17a00",
    successBg: "rgba(45,156,70,0.08)", successBorder: "rgba(45,156,70,0.2)", successText: "#2d9c46",
    genBg: "linear-gradient(135deg, #7c3aed, #3b82f6)", genText: "#ffffff",
    headerGrad: "linear-gradient(135deg, #7c3aed, #3b82f6, #2d9c46)",
    emptyBorder: "rgba(0,0,0,0.1)", colorScheme: "light",
  },
};

export function fmt(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function generateSubjectTemplate(toneId, reason) {
  const r = (reason || "time off").toLowerCase();
  const subjects = {
    professional: [
      `Out of Office: ${reason || "Away"}`,
      `Away from office — returning soon`,
      `Automatic Reply: Currently out for ${r}`,
    ],
    friendly: [
      `I'm on ${r}! 🌴 Back soon!`,
      `Hey! I'm away for a bit ✌️`,
      `Taking some ${r} — be back soon!`,
    ],
    hilarious: [
      `Gone fishin' 🎣 (not really, it's ${r})`,
      `Plot twist: I'm not here`,
      `This inbox has trust issues — I left it for ${r}`,
    ],
    passive_aggressive: [
      `Out of office. Yes, again.`,
      `Away. Please plan accordingly.`,
      `Auto-reply: Not available (as my calendar clearly shows)`,
    ],
    mysterious: [
      `[REDACTED]`,
      `Do not reply.`,
      `This inbox is... temporarily elsewhere.`,
    ],
    pirate: [
      `⚓ Gone to Sea — Return Date TBD`,
      `Ahoy! Captain is off ship`,
      `Sailed away for ${r} 🏴‍☠️`,
    ],
    haiku: [
      `Away. Returning.`,
      `Out of office now.`,
      `Gone, then back again.`,
    ],
    gen_z: [
      `im literally not here rn 💀`,
      `out of office era ✨`,
      `on ${r} and it's giving GONE 💅`,
    ],
  };
  const opts = subjects[toneId] || subjects.professional;
  return opts[Math.floor(Math.random() * opts.length)];
}

export function generateTemplate({ name, startDate, endDate, reason, backup }, toneId) {
  const n = name || "[Your Name]";
  const sd = fmt(startDate), ed = fmt(endDate);
  const dates = sd && ed ? `${sd} through ${ed}` : sd ? `starting ${sd}` : "for a while";
  const back = ed || "soon";
  const r = reason || "personal reasons";
  const b = backup || "[backup contact]";

  const templates = {
    professional: `Thank you for your email. I am currently out of the office from ${dates} for ${r.toLowerCase()}.\n\nDuring my absence, please reach out to ${b} for any urgent matters. I will have limited access to email and will respond to your message upon my return.\n\nThank you for your patience and understanding.\n\nBest regards,\n${n}`,
    friendly: `Hey there! 👋\n\nThanks for reaching out! I'm currently away from ${dates} — ${r.toLowerCase()}.\n\nIf you need something before I'm back, ${b} is your go-to and they're awesome. Otherwise, I'll get back to you when I return on ${back}!\n\nHope you're having a great day!\n${n}`,
    hilarious: `I'm currently out of the office from ${dates} for ${r.toLowerCase()}. I know, I know — how will the company survive without me? Somehow, it will.\n\nIf your email is urgent, please contact ${b}, who heroically volunteered (they didn't) to handle things in my absence. If it's not urgent, I'll pretend I didn't see this and respond when I'm back on ${back}.\n\nIn the meantime, please enjoy this fun fact: a group of flamingos is called a "flamboyance."\n\nYou're welcome,\n${n}`,
    passive_aggressive: `Thank you for your email, which I'm sure couldn't possibly wait.\n\nUnfortunately, I'm out of the office from ${dates} for ${r.toLowerCase()}. I would say I'll miss the constant flow of emails, but my therapist says I need to be more honest.\n\nFor truly urgent matters (and please, really ask yourself if it's urgent), you can reach ${b}. For everything else, I'll circle back on ${back}. Or maybe the day after. We'll see how I feel.\n\nWarmly (ish),\n${n}`,
    mysterious: `This inbox is currently... unattended.\n\nWhere am I? That's not important. When will I return? ${back}. Why am I gone? ${r}. Or so they say.\n\nUntil then, ${b} holds the keys. They can help you. Probably.\n\nDo not reply to this message. It won't help.\n\n— ${n}`,
    pirate: `Ahoy, ye scallywag! 🏴‍☠️\n\nYe've reached the desk of ${n}, but I've set sail from ${dates}! I be away for ${r.toLowerCase()} and won't be checkin' me messages in a bottle.\n\nIf yer matter be urgent, send word to ${b} — they be holdin' down the ship while I'm gone. Otherwise, I'll respond when I return to port on ${back}.\n\nMay the wind be at yer back! ⚓\nCaptain ${n}`,
    haiku: `Out of office now.\n${r} calls me away.\nBack ${back}.\n\nFor urgent matters:\n${b} stands ready to help.\nPatience is a gift.\n\n— ${n}`,
    gen_z: `bestie i am NOT here rn 😭\n\ni'm out ${dates} for ${r.toLowerCase()} and it's giving ✨unavailable✨\n\nfor anything urgent slide into ${b}'s DMs — they're lowkey the GOAT 🐐 otherwise i'll get back to u when i'm back no cap\n\nslay 💅\n${n}`,
  };
  return templates[toneId] || templates.professional;
}
