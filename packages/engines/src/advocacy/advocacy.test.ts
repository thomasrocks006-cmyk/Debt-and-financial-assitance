import { describe, it, expect } from "vitest";
import { generateHardshipLetter, getCreditorPlaybook } from "./index";

const baseContext = {
  clientName: "Alex Demo",
  creditorName: "ANZ Bank",
  accountReference: "ACC-12345",
  hardshipReason: "job loss",
  proposedPayment: 100,
  proposedFrequency: "monthly",
};

describe("Advocacy Engine — generateHardshipLetter", () => {
  it("returns a non-empty string for hardship_request", () => {
    const letter = generateHardshipLetter("hardship_request", baseContext);
    expect(letter).toBeTruthy();
    expect(typeof letter).toBe("string");
  });

  it("letter contains clientName", () => {
    const letter = generateHardshipLetter("hardship_request", baseContext);
    expect(letter).toContain("Alex Demo");
  });

  it("letter contains creditorName", () => {
    const letter = generateHardshipLetter("hardship_request", baseContext);
    expect(letter).toContain("ANZ Bank");
  });

  it("letter contains hardshipReason", () => {
    const letter = generateHardshipLetter("hardship_request", baseContext);
    expect(letter).toContain("job loss");
  });

  it("letter contains proposed payment when provided", () => {
    const letter = generateHardshipLetter("hardship_request", baseContext);
    expect(letter).toContain("100");
  });

  it("settlement_offer letter includes settlement amount", () => {
    const letter = generateHardshipLetter("settlement_offer", {
      ...baseContext,
      settlementAmount: 3500,
    });
    expect(letter).toContain("3500");
  });

  it("freeze_request letter mentions freeze or pause", () => {
    const letter = generateHardshipLetter("freeze_request", baseContext);
    const lower = letter.toLowerCase();
    expect(lower.includes("freeze") || lower.includes("pause") || lower.includes("temporary")).toBe(true);
  });

  it("dispute letter mentions dispute", () => {
    const letter = generateHardshipLetter("dispute", baseContext);
    const lower = letter.toLowerCase();
    expect(lower.includes("dispute") || lower.includes("review") || lower.includes("formal")).toBe(true);
  });

  it("reduction_request letter is non-empty", () => {
    const letter = generateHardshipLetter("reduction_request", baseContext);
    expect(letter.length).toBeGreaterThan(50);
  });
});

describe("Advocacy Engine — getCreditorPlaybook", () => {
  it("returns ANZ playbook", () => {
    const playbook = getCreditorPlaybook("anz");
    expect(playbook).not.toBeNull();
    expect(playbook!.creditorName).toContain("ANZ");
  });

  it("ANZ playbook has hardshipProcess steps", () => {
    const playbook = getCreditorPlaybook("anz");
    expect(Array.isArray(playbook!.hardshipProcess)).toBe(true);
    expect(playbook!.hardshipProcess.length).toBeGreaterThan(0);
  });

  it("ANZ playbook has ombudsmanScheme AFCA", () => {
    const playbook = getCreditorPlaybook("anz");
    expect(playbook!.ombudsmanScheme).toBe("AFCA");
  });

  it("returns CBA playbook", () => {
    const playbook = getCreditorPlaybook("cba");
    expect(playbook).not.toBeNull();
    expect(playbook!.creditorName).toContain("Commonwealth");
  });

  it("playbook typicalResponseDays is positive", () => {
    const playbook = getCreditorPlaybook("anz");
    expect(playbook!.typicalResponseDays).toBeGreaterThan(0);
  });

  it("returns null for unknown creditor", () => {
    const playbook = getCreditorPlaybook("unknown-creditor-xyz");
    expect(playbook).toBeNull();
  });

  it("playbook has escalationPath array", () => {
    const playbook = getCreditorPlaybook("anz");
    expect(Array.isArray(playbook!.escalationPath)).toBe(true);
    expect(playbook!.escalationPath.length).toBeGreaterThan(0);
  });
});
