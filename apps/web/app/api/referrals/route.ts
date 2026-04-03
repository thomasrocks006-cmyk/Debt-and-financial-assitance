import { NextResponse } from "next/server";

/**
 * GET /api/referrals — returns the referrals list
 * POST /api/referrals — creates a new referral
 */

const mockReferrals = [
  { id: "r1", client: "Sarah Wilson", service: "FAMILY_VIOLENCE", provider: "1800RESPECT", status: "SENT", consentGiven: true, sentAt: "1 day ago" },
  { id: "r2", client: "Alex Demo", service: "DEBT_MANAGEMENT", provider: "National Debt Helpline", status: "PENDING", consentGiven: false, sentAt: null },
  { id: "r3", client: "James Chen", service: "GAMBLING_SUPPORT", provider: "Gamblers Help", status: "ACCEPTED", consentGiven: true, sentAt: "3 days ago" },
];

export async function GET() {
  return NextResponse.json({ referrals: mockReferrals });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { client, service, provider } = body as { client: string; service: string; provider: string };

  if (!client || !provider) {
    return NextResponse.json({ error: "client and provider are required" }, { status: 400 });
  }

  const referral = {
    id: crypto.randomUUID(),
    client,
    service: service ?? "",
    provider,
    status: "PENDING",
    consentGiven: false,
    sentAt: null,
  };

  return NextResponse.json({ referral }, { status: 201 });
}
