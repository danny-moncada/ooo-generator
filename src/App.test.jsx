import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe("Initial render", () => {
  it("renders the page title", () => {
    render(<App />);
    expect(screen.getByText("OOO Generator")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<App />);
    expect(
      screen.getByText(/deserves better than.*out of office/i)
    ).toBeInTheDocument();
  });

  it("shows empty state prompt before generation", () => {
    render(<App />);
    expect(
      screen.getByText(/fill in the details/i)
    ).toBeInTheDocument();
  });

  it("renders all 8 tone buttons", () => {
    render(<App />);
    const toneLabels = [
      "Professional", "Friendly", "Hilarious", "Passive-Aggressive",
      "Mysterious", "Pirate", "Haiku", "Gen Z",
    ];
    toneLabels.forEach((label) => {
      expect(screen.getByLabelText(`Tone: ${label}`)).toBeInTheDocument();
    });
  });

  it("renders the generate button", () => {
    render(<App />);
    expect(screen.getByTestId("generate-btn")).toBeInTheDocument();
    expect(screen.getByTestId("generate-btn")).toHaveTextContent(/generate message/i);
  });

  it("renders mode toggle buttons", () => {
    render(<App />);
    expect(screen.getByLabelText("Mode: Template")).toBeInTheDocument();
    expect(screen.getByLabelText("Mode: AI ✨")).toBeInTheDocument();
  });
});

describe("Form inputs", () => {
  it("accepts name input", async () => {
    render(<App />);
    const input = screen.getByPlaceholderText("Danny");
    await userEvent.type(input, "Alex");
    expect(input).toHaveValue("Alex");
  });

  it("accepts backup contact input", async () => {
    render(<App />);
    const input = screen.getByPlaceholderText("Alex from Engineering");
    await userEvent.type(input, "Jordan");
    expect(input).toHaveValue("Jordan");
  });

  it("accepts date inputs", () => {
    render(<App />);
    const start = screen.getByLabelText("Start date");
    const end = screen.getByLabelText("End date");
    fireEvent.change(start, { target: { value: "2025-08-01" } });
    fireEvent.change(end, { target: { value: "2025-08-15" } });
    expect(start).toHaveValue("2025-08-01");
    expect(end).toHaveValue("2025-08-15");
  });

  it("shows custom reason input when 'Other' is selected", async () => {
    render(<App />);
    const select = screen.getByLabelText("Reason");
    await userEvent.selectOptions(select, "Other");
    expect(
      screen.getByPlaceholderText("Your custom reason...")
    ).toBeInTheDocument();
  });

  it("does not show custom reason input for standard reasons", () => {
    render(<App />);
    expect(
      screen.queryByPlaceholderText("Your custom reason...")
    ).not.toBeInTheDocument();
  });
});

describe("Template generation", () => {
  it("generates a message when the generate button is clicked", async () => {
    render(<App />);
    const nameInput = screen.getByPlaceholderText("Danny");
    await userEvent.type(nameInput, "TestUser");
    fireEvent.click(screen.getByTestId("generate-btn"));
    expect(screen.getByTestId("message-body")).toBeInTheDocument();
    expect(screen.getByTestId("message-body").textContent).toContain("TestUser");
  });

  it("generates a subject line alongside the message", async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("generate-btn"));
    expect(screen.getByTestId("subject-line")).toBeInTheDocument();
    expect(screen.getByTestId("subject-line").textContent.length).toBeGreaterThan(0);
  });

  it("shows word and character count after generation", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("generate-btn"));
    expect(screen.getByText(/words/)).toBeInTheDocument();
    expect(screen.getByText(/chars/)).toBeInTheDocument();
  });

  it("button text changes to 'Regenerate' after first generation", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("generate-btn"));
    expect(screen.getByTestId("generate-btn")).toHaveTextContent(/regenerate/i);
  });

  it("includes backup contact in generated message", async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText("Alex from Engineering"), "Jordan");
    fireEvent.click(screen.getByTestId("generate-btn"));
    expect(screen.getByTestId("message-body").textContent).toContain("Jordan");
  });

  it("changes output when tone changes", async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("generate-btn"));
    const proMsg = screen.getByTestId("message-body").textContent;

    fireEvent.click(screen.getByLabelText("Tone: Pirate"));
    fireEvent.click(screen.getByTestId("generate-btn"));
    const pirateMsg = screen.getByTestId("message-body").textContent;

    expect(proMsg).not.toBe(pirateMsg);
  });

  it("works with completely empty form", () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("generate-btn"));
    const body = screen.getByTestId("message-body").textContent;
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("[Your Name]");
  });
});

describe("Theme toggle", () => {
  it("renders the theme toggle button", () => {
    render(<App />);
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("toggles between Light and Dark labels", async () => {
    render(<App />);
    const btn = screen.getByLabelText("Toggle theme");
    expect(btn).toHaveTextContent("Light");
    await userEvent.click(btn);
    expect(btn).toHaveTextContent("Dark");
    await userEvent.click(btn);
    expect(btn).toHaveTextContent("Light");
  });
});

describe("Copy functionality", () => {
  it("copies message to clipboard and shows confirmation", async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("generate-btn"));
    const copyBtn = screen.getByTestId("copy-btn");
    await userEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(copyBtn).toHaveTextContent(/copied/i);
  });

  it("includes subject line in copied text", async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("generate-btn"));
    await userEvent.click(screen.getByTestId("copy-btn"));
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain("Subject:");
  });
});

describe("Random tone", () => {
  it("changes the active tone when 'Surprise me' is clicked", async () => {
    render(<App />);
    const proBtn = screen.getByLabelText("Tone: Professional");
    expect(proBtn).toHaveAttribute("aria-pressed", "true");

    for (let i = 0; i < 10; i++) {
      await userEvent.click(screen.getByLabelText("Random tone"));
    }
    const anyOtherPressed = [
      "Friendly", "Hilarious", "Passive-Aggressive",
      "Mysterious", "Pirate", "Haiku", "Gen Z",
    ].some((label) => {
      const btn = screen.getByLabelText(`Tone: ${label}`);
      return btn.getAttribute("aria-pressed") === "true";
    });
    expect(anyOtherPressed).toBe(true);
  });
});

describe("AI mode", () => {
  it("shows spice level slider when AI mode is selected", async () => {
    render(<App />);
    expect(screen.queryByLabelText("Spice level")).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Mode: AI ✨"));
    expect(screen.getByLabelText("Spice level")).toBeInTheDocument();
  });

  it("hides spice level slider when switching back to template", async () => {
    render(<App />);
    await userEvent.click(screen.getByLabelText("Mode: AI ✨"));
    expect(screen.getByLabelText("Spice level")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Mode: Template"));
    expect(screen.queryByLabelText("Spice level")).not.toBeInTheDocument();
  });
});

describe("Subject reroll", () => {
  it("changes the subject line when reroll is clicked", async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("generate-btn"));
    for (let i = 0; i < 10; i++) {
      await userEvent.click(screen.getByLabelText("Reroll subject"));
    }
    expect(screen.getByTestId("subject-line").textContent.length).toBeGreaterThan(0);
  });
});
