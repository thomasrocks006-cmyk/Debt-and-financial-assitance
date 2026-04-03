import { describe, it, expect } from "vitest";
import {
  detectTriggers,
  generateRecommendations,
  checkStageTransitionEligibility,
  calculateRecoveryScore,
} from "../adaptive";

describe("Adaptive Engine — Trigger Detection", () => {
  it("detects missed payment triggers", () => {
    const triggers = detectTriggers("case1", [
      { type: "payment_failed", data: { amount: 150 }, occurredAt: new Date() },
    ]);
    expect(triggers).toHaveLength(1);
    expect(triggers[0].type).toBe("missed_payment");
    expect(triggers[0].severity).toBe("high");
  });

  it("detects income change triggers with severity scaling", () => {
    const triggers = detectTriggers("case1", [
      { type: "job_loss", data: { changePercent: -100 }, occurredAt: new Date() },
    ]);
    expect(triggers).toHaveLength(1);
    expect(triggers[0].type).toBe("income_change");
    expect(triggers[0].severity).toBe("critical");
  });

  it("detects crisis events", () => {
    const triggers = detectTriggers("case1", [
      { type: "eviction_notice", data: {}, occurredAt: new Date() },
      { type: "safety_concern", data: {}, occurredAt: new Date() },
    ]);
    expect(triggers).toHaveLength(2);
    expect(triggers[0].type).toBe("crisis_event");
    expect(triggers[0].severity).toBe("high");
    expect(triggers[1].severity).toBe("critical");
  });

  it("detects compliance lapses", () => {
    const triggers = detectTriggers("case1", [
      { type: "consent_expired", data: {}, occurredAt: new Date() },
    ]);
    expect(triggers).toHaveLength(1);
    expect(triggers[0].type).toBe("compliance_lapse");
    expect(triggers[0].severity).toBe("high");
  });

  it("detects creditor responses", () => {
    const triggers = detectTriggers("case1", [
      { type: "creditor_rejected", data: { creditor: "ANZ" }, occurredAt: new Date() },
    ]);
    expect(triggers).toHaveLength(1);
    expect(triggers[0].type).toBe("creditor_response");
    expect(triggers[0].severity).toBe("high");
  });

  it("ignores unknown event types", () => {
    const triggers = detectTriggers("case1", [
      { type: "unknown_event", data: {}, occurredAt: new Date() },
    ]);
    expect(triggers).toHaveLength(0);
  });

  it("handles multiple events in sequence", () => {
    const triggers = detectTriggers("case1", [
      { type: "payment_failed", data: {}, occurredAt: new Date() },
      { type: "income_decreased", data: { changePercent: -30 }, occurredAt: new Date() },
      { type: "debt_added", data: {}, occurredAt: new Date() },
    ]);
    expect(triggers).toHaveLength(3);
    expect(triggers.map((t) => t.type)).toEqual(["missed_payment", "income_change", "new_debt"]);
  });
});

describe("Adaptive Engine — Recommendations", () => {
  it("generates recommendations for each trigger", () => {
    const triggers = detectTriggers("case1", [
      { type: "payment_failed", data: {}, occurredAt: new Date() },
      { type: "income_decreased", data: { changePercent: -25 }, occurredAt: new Date() },
    ]);
    const recs = generateRecommendations(triggers);
    expect(recs).toHaveLength(2);
    expect(recs[0].urgency).toBe("high");
    expect(recs[0].escalateToHuman).toBe(true);
  });

  it("flags crisis events for immediate human escalation", () => {
    const triggers = detectTriggers("case1", [
      { type: "safety_concern", data: {}, occurredAt: new Date() },
    ]);
    const recs = generateRecommendations(triggers);
    expect(recs[0].urgency).toBe("critical");
    expect(recs[0].escalateToHuman).toBe(true);
    expect(recs[0].suggestedReferrals).toContain("1800RESPECT");
    expect(recs[0].stageTransition).toBe("survive");
  });

  it("flags compliance lapses as blocking", () => {
    const triggers = detectTriggers("case1", [
      { type: "consent_expired", data: {}, occurredAt: new Date() },
    ]);
    const recs = generateRecommendations(triggers);
    expect(recs[0].complianceBlock).toBe(true);
    expect(recs[0].urgency).toBe("high");
  });
});

describe("Adaptive Engine — Stage Transitions", () => {
  it("allows survive → stabilise when criteria met", () => {
    const result = checkStageTransitionEligibility("survive", {
      missedPayments: 0,
      monthsSinceLastCrisis: 3,
      budgetSurplus: false,
      allDebtsCurrentStatus: false,
      consecutiveOnTimePayments: 2,
      emergencyFundStarted: false,
      allComplianceRequirementsMet: true,
    });
    expect(result.eligible).toBe(true);
    expect(result.nextStage).toBe("stabilise");
  });

  it("blocks survive → stabilise when payments missed", () => {
    const result = checkStageTransitionEligibility("survive", {
      missedPayments: 1,
      monthsSinceLastCrisis: 3,
      budgetSurplus: false,
      allDebtsCurrentStatus: false,
      consecutiveOnTimePayments: 0,
      emergencyFundStarted: false,
      allComplianceRequirementsMet: true,
    });
    expect(result.eligible).toBe(false);
    expect(result.requirements).toBeDefined();
    expect(result.requirements!.length).toBeGreaterThan(0);
  });

  it("allows recover → rebuild when all criteria met", () => {
    const result = checkStageTransitionEligibility("recover", {
      missedPayments: 0,
      monthsSinceLastCrisis: 12,
      budgetSurplus: true,
      allDebtsCurrentStatus: true,
      consecutiveOnTimePayments: 8,
      emergencyFundStarted: true,
      allComplianceRequirementsMet: true,
    });
    expect(result.eligible).toBe(true);
    expect(result.nextStage).toBe("rebuild");
  });

  it("blocks further transition from rebuild", () => {
    const result = checkStageTransitionEligibility("rebuild", {
      missedPayments: 0,
      monthsSinceLastCrisis: 24,
      budgetSurplus: true,
      allDebtsCurrentStatus: true,
      consecutiveOnTimePayments: 12,
      emergencyFundStarted: true,
      allComplianceRequirementsMet: true,
    });
    expect(result.eligible).toBe(false);
  });
});

describe("Adaptive Engine — Recovery Score", () => {
  it("returns a score between 0 and 100", () => {
    const score = calculateRecoveryScore({
      currentStage: "stabilise",
      consecutiveOnTimePayments: 3,
      budgetSurplus: true,
      totalDebt: 12000,
      originalDebt: 17300,
      missedPayments: 0,
      monthsInProgram: 4,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives higher score to later stages", () => {
    const base = {
      consecutiveOnTimePayments: 3,
      budgetSurplus: true,
      totalDebt: 10000,
      originalDebt: 20000,
      missedPayments: 0,
      monthsInProgram: 6,
    };
    const surviveScore = calculateRecoveryScore({ ...base, currentStage: "survive" });
    const recoverScore = calculateRecoveryScore({ ...base, currentStage: "recover" });
    expect(recoverScore).toBeGreaterThan(surviveScore);
  });

  it("penalises missed payments", () => {
    const base = {
      currentStage: "stabilise",
      consecutiveOnTimePayments: 3,
      budgetSurplus: true,
      totalDebt: 10000,
      originalDebt: 20000,
      monthsInProgram: 6,
    };
    const noMissed = calculateRecoveryScore({ ...base, missedPayments: 0 });
    const withMissed = calculateRecoveryScore({ ...base, missedPayments: 2 });
    expect(noMissed).toBeGreaterThan(withMissed);
  });
});
