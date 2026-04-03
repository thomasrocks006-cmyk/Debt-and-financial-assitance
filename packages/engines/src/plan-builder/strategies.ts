import { addMonths, monthsToPayoff } from "@recoveryos/shared";
import type { DebtAccountInput, DebtAllocation } from "./types";

/**
 * Pro-rata allocation: distribute payments proportional to balance
 */
export function proRataAllocations(
  totalMonthly: number,
  debts: DebtAccountInput[]
): DebtAllocation[] {
  const totalBalance = debts.reduce((s, d) => s + d.currentBalance, 0);
  if (totalBalance === 0) return [];

  return debts.map((debt) => {
    const allocationPercent = debt.currentBalance / totalBalance;
    const monthlyPayment = totalMonthly * allocationPercent;
    const months = monthsToPayoff(
      debt.currentBalance,
      monthlyPayment,
      debt.interestRate ?? 0
    );
    return {
      debtId: debt.debtId,
      creditorName: debt.creditorName,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      allocationPercent: Math.round(allocationPercent * 1000) / 10,
      monthsToPayoff: isFinite(months) ? months : 999,
    };
  });
}

/**
 * Priority-based allocation: pay highest priority debts first
 */
export function priorityAllocations(
  totalMonthly: number,
  debts: DebtAccountInput[]
): DebtAllocation[] {
  // Sort by priority (lower number = higher priority), then by balance
  const sorted = [...debts].sort((a, b) => {
    const pa = a.priority ?? 99;
    const pb = b.priority ?? 99;
    return pa - pb;
  });

  let remaining = totalMonthly;
  return sorted.map((debt) => {
    const minPayment = debt.minimumPayment;
    const monthlyPayment = Math.min(remaining, Math.max(minPayment, remaining / sorted.length));
    remaining = Math.max(0, remaining - monthlyPayment);
    const allocationPercent = totalMonthly > 0 ? (monthlyPayment / totalMonthly) * 100 : 0;
    const months = monthsToPayoff(debt.currentBalance, monthlyPayment, debt.interestRate ?? 0);
    return {
      debtId: debt.debtId,
      creditorName: debt.creditorName,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      allocationPercent: Math.round(allocationPercent * 10) / 10,
      monthsToPayoff: isFinite(months) ? months : 999,
    };
  });
}

/**
 * High-interest-first (avalanche): pay highest interest rate first
 */
export function highInterestFirstAllocations(
  totalMonthly: number,
  debts: DebtAccountInput[]
): DebtAllocation[] {
  const sorted = [...debts].sort((a, b) => (b.interestRate ?? 0) - (a.interestRate ?? 0));
  let remaining = totalMonthly;

  return sorted.map((debt, index) => {
    const isLast = index === sorted.length - 1;
    const basePayment = debt.minimumPayment;
    const monthlyPayment = isLast
      ? Math.max(basePayment, remaining)
      : Math.min(remaining, basePayment);
    remaining = Math.max(0, remaining - monthlyPayment);
    const allocationPercent = totalMonthly > 0 ? (monthlyPayment / totalMonthly) * 100 : 0;
    const months = monthsToPayoff(debt.currentBalance, monthlyPayment, debt.interestRate ?? 0);
    return {
      debtId: debt.debtId,
      creditorName: debt.creditorName,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      allocationPercent: Math.round(allocationPercent * 10) / 10,
      monthsToPayoff: isFinite(months) ? months : 999,
    };
  });
}

export function maxMonthsToPayoff(allocations: DebtAllocation[]): number {
  return allocations.reduce((max, a) => Math.max(max, a.monthsToPayoff), 0);
}

export function estimatedCompletion(months: number): Date {
  return addMonths(new Date(), months);
}

/**
 * Failure probability model: higher payment = lower risk
 */
export function calculateFailureProbability(
  monthlyPayment: number,
  disposableIncome: number
): number {
  if (disposableIncome <= 0) return 0.95;
  const ratio = monthlyPayment / disposableIncome;
  if (ratio >= 1) return 0.9;
  if (ratio >= 0.8) return 0.6;
  if (ratio >= 0.6) return 0.35;
  if (ratio >= 0.4) return 0.2;
  return 0.1;
}
