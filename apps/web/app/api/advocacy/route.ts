import { NextResponse } from "next/server";

/**
 * GET /api/advocacy — returns the creditor negotiations list
 */

const mockNegotiations = [
  { id: "n1", client: "Alex Demo", creditor: "ANZ Bank", type: "Hardship Request", status: "PENDING", sent: null, deadline: "3 days" },
  { id: "n2", client: "Sarah Wilson", creditor: "Origin Energy", type: "Utility Hardship", status: "SENT", sent: "2 days ago", deadline: "8 days" },
  { id: "n3", client: "James Chen", creditor: "Latitude Finance", type: "Settlement Offer", status: "RESPONSE_RECEIVED", sent: "5 days ago", deadline: null },
];

export async function GET() {
  return NextResponse.json({ negotiations: mockNegotiations });
}
