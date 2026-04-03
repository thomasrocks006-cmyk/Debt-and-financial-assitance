import type { HardshipFlag } from "../types/enums";

export interface HardshipFlagInfo {
  code: HardshipFlag;
  label: string;
  description: string;
  requiresSafetyProtocol: boolean;
  suggestedStreams: string[];
}

export const HARDSHIP_FLAGS: Record<HardshipFlag, HardshipFlagInfo> = {
  job_loss: {
    code: "job_loss",
    label: "Job Loss",
    description: "Recently lost employment",
    requiresSafetyProtocol: false,
    suggestedStreams: ["DEBT_MANAGEMENT", "INCOME_SUPPORT"],
  },
  reduced_hours: {
    code: "reduced_hours",
    label: "Reduced Hours / Income",
    description: "Working fewer hours or reduced pay",
    requiresSafetyProtocol: false,
    suggestedStreams: ["DEBT_MANAGEMENT", "INCOME_SUPPORT"],
  },
  illness_injury: {
    code: "illness_injury",
    label: "Illness or Injury",
    description: "Unable to work due to health issues",
    requiresSafetyProtocol: false,
    suggestedStreams: ["DEBT_MANAGEMENT", "INCOME_SUPPORT", "EMERGENCY_RELIEF"],
  },
  mental_health: {
    code: "mental_health",
    label: "Mental Health",
    description: "Mental health challenges affecting finances",
    requiresSafetyProtocol: true,
    suggestedStreams: ["DEBT_MANAGEMENT", "EMERGENCY_RELIEF"],
  },
  family_violence: {
    code: "family_violence",
    label: "Family Violence",
    description: "Experiencing or escaping family/domestic violence",
    requiresSafetyProtocol: true,
    suggestedStreams: ["FAMILY_VIOLENCE", "LEGAL_REFERRAL", "EMERGENCY_RELIEF"],
  },
  financial_abuse: {
    code: "financial_abuse",
    label: "Financial Abuse",
    description: "Coerced debt or financial control by another person",
    requiresSafetyProtocol: true,
    suggestedStreams: ["FAMILY_VIOLENCE", "LEGAL_REFERRAL", "DEBT_MANAGEMENT"],
  },
  gambling: {
    code: "gambling",
    label: "Gambling",
    description: "Gambling contributing to financial hardship",
    requiresSafetyProtocol: true,
    suggestedStreams: ["GAMBLING_SUPPORT", "DEBT_MANAGEMENT"],
  },
  separation_divorce: {
    code: "separation_divorce",
    label: "Separation / Divorce",
    description: "Relationship breakdown affecting finances",
    requiresSafetyProtocol: false,
    suggestedStreams: ["DEBT_MANAGEMENT", "LEGAL_REFERRAL"],
  },
  caring_responsibilities: {
    code: "caring_responsibilities",
    label: "Caring Responsibilities",
    description: "Unpaid caring for family member or child",
    requiresSafetyProtocol: false,
    suggestedStreams: ["INCOME_SUPPORT", "EMERGENCY_RELIEF"],
  },
  natural_disaster: {
    code: "natural_disaster",
    label: "Natural Disaster",
    description: "Flood, fire, drought or other natural disaster",
    requiresSafetyProtocol: false,
    suggestedStreams: ["EMERGENCY_RELIEF", "DEBT_MANAGEMENT", "INCOME_SUPPORT"],
  },
  covid_impact: {
    code: "covid_impact",
    label: "COVID-19 Impact (Legacy)",
    description: "Ongoing financial impacts from COVID-19",
    requiresSafetyProtocol: false,
    suggestedStreams: ["DEBT_MANAGEMENT", "INCOME_SUPPORT"],
  },
};

export const HARDSHIP_FLAG_OPTIONS = Object.values(HARDSHIP_FLAGS);
