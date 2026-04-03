import { NextResponse } from "next/server";

/**
 * POST /api/advocacy/letter — generate a hardship letter from a template
 *
 * Body: { templateId: string, clientName?: string, creditor?: string }
 * Returns: { letter: string }
 */

const templates: Record<string, string> = {
  hardship_request: `Dear {creditor} Hardship Team,

I am writing to request a hardship arrangement for my credit card account.

I am currently experiencing financial hardship due to reduced work hours and am unable to maintain my regular repayments. I am requesting a temporary reduction in my repayments to $75 per month while I work to stabilise my financial situation.

I understand my obligations and am committed to resolving this debt. I would appreciate your consideration of this request within 21 days as required under the National Credit Code.

Please contact me to discuss.

Sincerely,
{clientName}`,
  settlement_offer: `Dear {creditor},

I am writing to propose a full and final settlement of my personal loan account.

Due to ongoing financial hardship, I am unable to continue with regular repayments. I am able to offer a lump sum settlement of $6,500 in full satisfaction of this debt (representing approximately 66% of the outstanding balance).

I believe this is a reasonable offer given my financial circumstances and would appreciate your response within 21 days.

Sincerely,
{clientName}`,
  freeze_request: `Dear Creditor Hardship Team,

I am requesting a temporary freeze on my account including all interest charges and fees for a period of 90 days.

I am currently experiencing financial hardship and require this pause to stabilise my situation before recommencing payments.

Sincerely,
{clientName}`,
  reduction_request: `Dear Creditor,

I am requesting a reduction in my current interest rate due to financial hardship. A lower rate would enable me to continue making regular payments and avoid defaulting on my obligations.

Sincerely,
{clientName}`,
  dispute: `Dear Creditor,

I am writing to formally dispute the balance on my account. I believe there are charges that have been incorrectly applied and I request a full review of my account history.

I request a detailed statement of all transactions, fees, and interest charged to this account.

Sincerely,
{clientName}`,
};

export async function POST(request: Request) {
  const body = await request.json();
  const { templateId, clientName = "Alex Demo", creditor = "ANZ Bank" } = body as {
    templateId: string;
    clientName?: string;
    creditor?: string;
  };

  const template = templates[templateId];
  if (!template) {
    return NextResponse.json(
      { error: `Template '${templateId}' not found`, availableTemplates: Object.keys(templates) },
      { status: 400 },
    );
  }

  const letter = template
    .replace(/\{clientName\}/g, clientName)
    .replace(/\{creditor\}/g, creditor);

  return NextResponse.json({ letter }, { status: 200 });
}
