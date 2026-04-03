export interface CreditorCategory {
  id: string;
  name: string;
  hardshipTeamExists: boolean;
  ombudsmanScheme?: string;
  hardshipPhone?: string;
  hardshipEmail?: string;
  hardshipUrl?: string;
  responseTimeDays: number;
}

export const MAJOR_CREDITORS: CreditorCategory[] = [
  {
    id: "anz",
    name: "ANZ Bank",
    hardshipTeamExists: true,
    ombudsmanScheme: "AFCA",
    hardshipPhone: "1800 252 845",
    hardshipUrl: "https://www.anz.com.au/support/financial-hardship",
    responseTimeDays: 21,
  },
  {
    id: "cba",
    name: "Commonwealth Bank (CBA)",
    hardshipTeamExists: true,
    ombudsmanScheme: "AFCA",
    hardshipPhone: "1300 720 814",
    hardshipUrl: "https://www.commbank.com.au/support/financial-hardship.html",
    responseTimeDays: 21,
  },
  {
    id: "westpac",
    name: "Westpac",
    hardshipTeamExists: true,
    ombudsmanScheme: "AFCA",
    hardshipPhone: "1800 067 497",
    hardshipUrl: "https://www.westpac.com.au/personal-banking/financial-hardship",
    responseTimeDays: 21,
  },
  {
    id: "nab",
    name: "NAB",
    hardshipTeamExists: true,
    ombudsmanScheme: "AFCA",
    hardshipPhone: "1800 701 599",
    hardshipUrl: "https://www.nab.com.au/personal/financial-hardship",
    responseTimeDays: 21,
  },
  {
    id: "latitude",
    name: "Latitude Finance",
    hardshipTeamExists: true,
    ombudsmanScheme: "AFCA",
    hardshipPhone: "1300 655 505",
    hardshipUrl: "https://www.latitudefinancial.com.au/hardship",
    responseTimeDays: 21,
  },
  {
    id: "afterpay",
    name: "Afterpay",
    hardshipTeamExists: true,
    ombudsmanScheme: "AFCA",
    hardshipUrl: "https://help.afterpay.com/hc/en-au",
    responseTimeDays: 14,
  },
  {
    id: "zip",
    name: "Zip Pay / Zip Money",
    hardshipTeamExists: true,
    ombudsmanScheme: "AFCA",
    hardshipUrl: "https://help.zip.co",
    responseTimeDays: 14,
  },
  {
    id: "energy_aus",
    name: "AGL Energy",
    hardshipTeamExists: true,
    ombudsmanScheme: "Energy Ombudsman (state-based)",
    hardshipPhone: "131 245",
    hardshipUrl: "https://www.agl.com.au/residential/help-and-support/financial-hardship",
    responseTimeDays: 10,
  },
  {
    id: "origin",
    name: "Origin Energy",
    hardshipTeamExists: true,
    ombudsmanScheme: "Energy Ombudsman (state-based)",
    hardshipPhone: "132 461",
    hardshipUrl: "https://www.originenergy.com.au/bill/payment-difficulties",
    responseTimeDays: 10,
  },
  {
    id: "telstra",
    name: "Telstra",
    hardshipTeamExists: true,
    ombudsmanScheme: "TIO",
    hardshipPhone: "1800 211 961",
    hardshipUrl: "https://www.telstra.com.au/consumer-advice/payment-options",
    responseTimeDays: 14,
  },
];

export const CREDITOR_CATEGORIES = [
  "bank",
  "credit_union",
  "bnpl",
  "energy_utility",
  "telco",
  "government",
  "debt_collector",
  "mortgage_broker",
  "insurer",
  "other",
] as const;

export type CreditorCategoryType = (typeof CREDITOR_CATEGORIES)[number];
