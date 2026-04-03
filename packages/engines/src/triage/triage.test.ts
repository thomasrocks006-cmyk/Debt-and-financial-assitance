import { describe, it, expect } from "vitest";
import { runTriage } from "./index";

describe("Triage Engine", () => {
  it("returns NONE crisis level with all zero inputs", () => {
    const result = runTriage({
      debtStress: 0,
      rentalStress: 0,
      utilityStress: 0,
      incomeShock: false,
      safetyRisk: false,
      gamblingRisk: false,
      foodInsecurity: false,
    });
    expect(result.crisisLevel).toBe("NONE");
    expect(result.score).toBe(0);
    expect(result.humanRequired).toBe(false);
    expect(result.selfServeEligible).toBe(true);
  });

  it("returns CRITICAL crisis level when safety risk is present", () => {
    const result = runTriage({
      debtStress: 5,
      rentalStress: 5,
      utilityStress: 5,
      incomeShock: true,
      safetyRisk: true,
      gamblingRisk: false,
      foodInsecurity: true,
    });
    expect(result.crisisLevel).toBe("CRITICAL");
    expect(result.humanRequired).toBe(true);
    expect(result.selfServeEligible).toBe(false);
  });

  it("returns FAMILY_VIOLENCE stream when safety risk flagged", () => {
    const result = runTriage({
      debtStress: 3,
      rentalStress: 3,
      utilityStress: 0,
      incomeShock: false,
      safetyRisk: true,
      gamblingRisk: false,
      foodInsecurity: false,
    });
    expect(result.serviceStreams).toContain("FAMILY_VIOLENCE");
    expect(result.humanRequired).toBe(true);
  });

  it("returns GAMBLING_SUPPORT stream when gambling risk flagged", () => {
    const result = runTriage({
      debtStress: 7,
      rentalStress: 2,
      utilityStress: 0,
      incomeShock: false,
      safetyRisk: false,
      gamblingRisk: true,
      foodInsecurity: false,
    });
    expect(result.serviceStreams).toContain("GAMBLING_SUPPORT");
    expect(result.humanRequired).toBe(true);
  });

  it("includes DEBT_MANAGEMENT stream when debt stress > 0", () => {
    const result = runTriage({
      debtStress: 3,
      rentalStress: 0,
      utilityStress: 0,
      incomeShock: false,
      safetyRisk: false,
      gamblingRisk: false,
      foodInsecurity: false,
    });
    expect(result.serviceStreams).toContain("DEBT_MANAGEMENT");
  });

  it("returns HIGH crisis level for high debt+rental stress with income shock", () => {
    const result = runTriage({
      debtStress: 8,
      rentalStress: 8,
      utilityStress: 5,
      incomeShock: true,
      safetyRisk: false,
      gamblingRisk: false,
      foodInsecurity: false,
    });
    expect(["HIGH", "CRITICAL"]).toContain(result.crisisLevel);
    expect(result.humanRequired).toBe(true);
  });

  it("uses daysUntilCriticalEvent as urgencyDays when provided", () => {
    const result = runTriage({
      debtStress: 5,
      rentalStress: 0,
      utilityStress: 0,
      incomeShock: false,
      safetyRisk: false,
      gamblingRisk: false,
      foodInsecurity: false,
      daysUntilCriticalEvent: 3,
    });
    expect(result.urgencyDays).toBe(3);
  });
});
