export type UserRole =
  | "CLIENT"
  | "CASE_MANAGER"
  | "ADVOCACY_SPECIALIST"
  | "COMPLIANCE_OFFICER"
  | "ADMIN";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientProfile {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  preferredContact?: string;
  safeToContact: boolean;
  safeContactTimes?: string;
  hiddenNotifications: boolean;
  vulnerabilityFlags: string[];
  riskScore?: number;
  complexityScore?: number;
  createdAt: Date;
  updatedAt: Date;
}
