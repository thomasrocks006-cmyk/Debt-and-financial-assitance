import { describe, it, expect } from "vitest";
import { checkCompliance } from "./index";

const compliantInput = {
  caseId: "case-123",
  hasAffordabilityAssessment: true,
  hasConsentRecord: true,
  hasFeeDisclosure: true,
  hasServiceTermsDisclosure: true,
  hasComplaintProcessDisclosure: true,
  hasPrivacyDisclosure: true,
  consentIsValid: true,
  consentIsRecent: true,
};

describe("Compliance Engine", () => {
  it("returns compliant when all requirements are met", () => {
    const result = checkCompliance(compliantInput);
    expect(result.isCompliant).toBe(true);
    expect(result.blockingIssues).toHaveLength(0);
  });

  it("returns blocking issue when affordability assessment is missing", () => {
    const result = checkCompliance({
      ...compliantInput,
      hasAffordabilityAssessment: false,
    });
    expect(result.isCompliant).toBe(false);
    expect(result.blockingIssues.some((i) => i.code === "MISSING_AFFORDABILITY")).toBe(true);
  });

  it("returns blocking issue when consent is missing", () => {
    const result = checkCompliance({
      ...compliantInput,
      hasConsentRecord: false,
    });
    expect(result.isCompliant).toBe(false);
    expect(result.blockingIssues.some((i) => i.code === "MISSING_CONSENT")).toBe(true);
  });

  it("returns blocking issue when consent is invalid", () => {
    const result = checkCompliance({
      ...compliantInput,
      consentIsValid: false,
    });
    expect(result.isCompliant).toBe(false);
    expect(result.blockingIssues.some((i) => i.code === "INVALID_CONSENT")).toBe(true);
  });

  it("returns blocking issue when fee disclosure is missing", () => {
    const result = checkCompliance({
      ...compliantInput,
      hasFeeDisclosure: false,
    });
    expect(result.isCompliant).toBe(false);
    expect(result.blockingIssues.some((i) => i.code === "MISSING_FEE_DISCLOSURE")).toBe(true);
  });

  it("returns warning (not blocking) when complaint process not disclosed", () => {
    const result = checkCompliance({
      ...compliantInput,
      hasComplaintProcessDisclosure: false,
    });
    expect(result.isCompliant).toBe(true);
    expect(result.warnings.some((w) => w.code === "MISSING_COMPLAINT_PROCESS")).toBe(true);
    expect(result.blockingIssues).toHaveLength(0);
  });

  it("returns warning for stale consent", () => {
    const result = checkCompliance({
      ...compliantInput,
      consentIsRecent: false,
    });
    expect(result.warnings.some((w) => w.code === "STALE_CONSENT")).toBe(true);
  });

  it("includes checkedAt timestamp", () => {
    const result = checkCompliance(compliantInput);
    expect(result.checkedAt).toBeInstanceOf(Date);
    expect(result.caseId).toBe("case-123");
  });
});
