import { describe, it, expect } from "vitest";
import {
  TONES, REASONS, SPICE_LABELS, themes,
  fmt, generateSubjectTemplate, generateTemplate,
} from "./utils";

describe("Constants", () => {
  it("TONES has 8 unique entries with required fields", () => {
    expect(TONES).toHaveLength(8);
    const ids = TONES.map((t) => t.id);
    expect(new Set(ids).size).toBe(8);
    TONES.forEach((t) => {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("label");
      expect(t).toHaveProperty("emoji");
    });
  });

  it("REASONS includes standard and fun options", () => {
    expect(REASONS).toContain("Vacation");
    expect(REASONS).toContain("Parental Leave");
    expect(REASONS).toContain("Alien Abduction");
    expect(REASONS).toContain("Other");
  });

  it("SPICE_LABELS has 5 levels", () => {
    expect(SPICE_LABELS).toHaveLength(5);
  });

  it("themes has dark and light with matching keys", () => {
    const darkKeys = Object.keys(themes.dark).sort();
    const lightKeys = Object.keys(themes.light).sort();
    expect(darkKeys).toEqual(lightKeys);
    expect(themes.dark.colorScheme).toBe("dark");
    expect(themes.light.colorScheme).toBe("light");
  });
});

describe("fmt", () => {
  it("formats a valid YYYY-MM-DD date", () => {
    const result = fmt("2025-07-04");
    expect(result).toContain("Jul");
    expect(result).toContain("4");
    expect(result).toContain("2025");
  });

  it("returns empty string for empty input", () => {
    expect(fmt("")).toBe("");
    expect(fmt(null)).toBe("");
    expect(fmt(undefined)).toBe("");
  });

  it("handles single-digit days correctly", () => {
    const result = fmt("2025-01-03");
    expect(result).toContain("Jan");
    expect(result).toContain("3");
  });

  it("handles end-of-year dates", () => {
    const result = fmt("2025-12-31");
    expect(result).toContain("Dec");
    expect(result).toContain("31");
  });
});

describe("generateSubjectTemplate", () => {
  it("returns a non-empty string for every tone", () => {
    TONES.forEach((t) => {
      const subject = generateSubjectTemplate(t.id, "Vacation");
      expect(subject).toBeTruthy();
      expect(typeof subject).toBe("string");
      expect(subject.length).toBeGreaterThan(0);
    });
  });

  it("falls back to professional subjects for unknown tone", () => {
    const subject = generateSubjectTemplate("nonexistent_tone", "Vacation");
    expect(subject).toBeTruthy();
  });

  it("uses fallback reason when none provided", () => {
    const subject = generateSubjectTemplate("friendly", "");
    expect(subject).toBeTruthy();
  });

  it("incorporates the reason into subject when applicable", () => {
    const results = Array.from({ length: 20 }, () =>
      generateSubjectTemplate("professional", "Sabbatical")
    );
    const hasReason = results.some(
      (s) => s.includes("Sabbatical") || s.includes("sabbatical")
    );
    expect(hasReason).toBe(true);
  });

  it("pirate subjects contain nautical flair", () => {
    const results = Array.from({ length: 20 }, () =>
      generateSubjectTemplate("pirate", "Vacation")
    );
    const nautical = results.some(
      (s) => /sea|ahoy|sail|⚓|🏴/i.test(s)
    );
    expect(nautical).toBe(true);
  });
});

describe("generateTemplate", () => {
  const fullInputs = {
    name: "Alex",
    startDate: "2025-08-01",
    endDate: "2025-08-15",
    reason: "Vacation",
    backup: "Jordan",
  };

  const minimalInputs = {
    name: "",
    startDate: "",
    endDate: "",
    reason: "",
    backup: "",
  };

  it("generates a non-empty message for every tone", () => {
    TONES.forEach((t) => {
      const msg = generateTemplate(fullInputs, t.id);
      expect(msg.length).toBeGreaterThan(30);
    });
  });

  it("includes the user's name in the output", () => {
    const msg = generateTemplate(fullInputs, "professional");
    expect(msg).toContain("Alex");
  });

  it("includes the backup contact", () => {
    const msg = generateTemplate(fullInputs, "professional");
    expect(msg).toContain("Jordan");
  });

  it("includes formatted dates", () => {
    const msg = generateTemplate(fullInputs, "professional");
    expect(msg).toContain("Aug");
    expect(msg).toContain("2025");
  });

  it("includes the reason for absence", () => {
    const msg = generateTemplate(fullInputs, "professional");
    expect(msg.toLowerCase()).toContain("vacation");
  });

  it("uses placeholder defaults for minimal inputs", () => {
    const msg = generateTemplate(minimalInputs, "professional");
    expect(msg).toContain("[Your Name]");
    expect(msg).toContain("[backup contact]");
    expect(msg).toContain("personal reasons");
  });

  it("falls back to professional for unknown tone", () => {
    const msg = generateTemplate(fullInputs, "completely_fake_tone");
    expect(msg).toContain("Thank you for your email");
  });

  it("pirate tone uses pirate language", () => {
    const msg = generateTemplate(fullInputs, "pirate");
    expect(msg).toMatch(/ahoy|scallywag|sail|captain|⚓/i);
  });

  it("haiku tone is noticeably shorter", () => {
    const pro = generateTemplate(fullInputs, "professional");
    const haiku = generateTemplate(fullInputs, "haiku");
    expect(haiku.length).toBeLessThan(pro.length);
  });

  it("gen_z tone uses slang", () => {
    const msg = generateTemplate(fullInputs, "gen_z");
    expect(msg).toMatch(/bestie|slay|no cap|GOAT|DMs/i);
  });

  it("handles only a start date (no end date)", () => {
    const msg = generateTemplate(
      { ...fullInputs, endDate: "" }, "friendly"
    );
    expect(msg).toContain("starting");
    expect(msg).toContain("Aug");
  });

  it("handles no dates at all", () => {
    const msg = generateTemplate(minimalInputs, "friendly");
    expect(msg).toContain("for a while");
  });

  it("passive-aggressive tone includes attitude", () => {
    const msg = generateTemplate(fullInputs, "passive_aggressive");
    expect(msg).toMatch(/therapist|urgent|couldn't possibly/i);
  });

  it("mysterious tone is cryptic", () => {
    const msg = generateTemplate(fullInputs, "mysterious");
    expect(msg).toMatch(/unattended|not important|do not reply/i);
  });
});
