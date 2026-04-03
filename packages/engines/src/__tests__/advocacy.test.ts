import { describe, it, expect } from "vitest";
import {
  generateHardshipLetter,
  getCreditorPlaybook,
  getAllCreditorPlaybooks,
  recommendLetterType,
} from "../advocacy";

describe("Advocacy Engine — Letter Generation", () => {
  it("generates a hardship request letter", () => {
    const letter = generateHardshipLetter("hardship_request", {
      clientName: "Alex Demo",
      creditorName: "ANZ Bank",
      accountReference: "4111-XXXX-1234",
      hardshipReason: "reduced work hours",
      proposedPayment: 75,
      proposedFrequency: "per month",
    });

    expect(letter).toContain("Alex Demo");
    expect(letter).toContain("ANZ Bank");
    expect(letter).toContain("reduced work hours");
    expect(letter).toContain("$75");
    expect(letter).toContain("National Credit Code");
  });

  it("generates a settlement offer letter", () => {
    const letter = generateHardshipLetter("settlement_offer", {
      clientName: "James Chen",
      creditorName: "Latitude Finance",
      hardshipReason: "ongoing unemployment",
      settlementAmount: 6500,
      settlementPercent: 66,
    });

    expect(letter).toContain("$6500");
    expect(letter).toContain("66%");
    expect(letter).toContain("full and final settlement");
  });

  it("generates a freeze request letter", () => {
    const letter = generateHardshipLetter("freeze_request", {
      clientName: "Sarah Wilson",
      creditorName: "Westpac",
      hardshipReason: "family violence situation",
    });

    expect(letter).toContain("temporary freeze");
    expect(letter).toContain("90 days");
    expect(letter).toContain("family violence situation");
  });

  it("generates a dispute letter with AFCA reference", () => {
    const letter = generateHardshipLetter("dispute", {
      clientName: "Test Client",
      creditorName: "Test Creditor",
      hardshipReason: "incorrect charges on account",
    });

    expect(letter).toContain("formally dispute");
    expect(letter).toContain("AFCA");
    expect(letter).toContain("21 days");
  });
});

describe("Advocacy Engine — Creditor Playbooks", () => {
  it("returns playbook for all 10 major creditors", () => {
    const allPlaybooks = getAllCreditorPlaybooks();
    expect(allPlaybooks).toHaveLength(10);
  });

  it("returns playbook with correct structure", () => {
    const anz = getCreditorPlaybook("anz");
    expect(anz).not.toBeNull();
    expect(anz!.creditorName).toBe("ANZ Bank");
    expect(anz!.hardshipProcess.length).toBeGreaterThan(0);
    expect(anz!.escalationPath.length).toBeGreaterThan(0);
    expect(anz!.ombudsmanScheme).toBe("AFCA");
    expect(anz!.category).toBe("bank");
  });

  it("returns null for unknown creditor", () => {
    const unknown = getCreditorPlaybook("unknown_bank");
    expect(unknown).toBeNull();
  });

  it("energy creditors use Energy Ombudsman not AFCA", () => {
    const agl = getCreditorPlaybook("energy_aus");
    expect(agl).not.toBeNull();
    expect(agl!.ombudsmanScheme).toContain("Energy Ombudsman");
  });

  it("Telstra uses TIO not AFCA", () => {
    const telstra = getCreditorPlaybook("telstra");
    expect(telstra).not.toBeNull();
    expect(telstra!.ombudsmanScheme).toBe("TIO");
  });
});

describe("Advocacy Engine — Letter Recommendations", () => {
  it("recommends settlement for old debts with funds", () => {
    const result = recommendLetterType({
      arrears: 5000,
      balance: 10000,
      monthsSinceDefault: 12,
      hasSettlementFunds: true,
      creditorCategory: "bank",
    });
    expect(result.type).toBe("settlement_offer");
  });

  it("recommends hardship request when not in arrears", () => {
    const result = recommendLetterType({
      arrears: 0,
      balance: 10000,
      monthsSinceDefault: 0,
      hasSettlementFunds: false,
      creditorCategory: "bank",
    });
    expect(result.type).toBe("hardship_request");
  });

  it("recommends freeze for utility debts", () => {
    const result = recommendLetterType({
      arrears: 200,
      balance: 500,
      monthsSinceDefault: 2,
      hasSettlementFunds: false,
      creditorCategory: "energy_utility",
    });
    expect(result.type).toBe("freeze_request");
  });

  it("recommends freeze for significant arrears", () => {
    const result = recommendLetterType({
      arrears: 4000,
      balance: 10000,
      monthsSinceDefault: 3,
      hasSettlementFunds: false,
      creditorCategory: "bank",
    });
    expect(result.type).toBe("freeze_request");
  });
});
