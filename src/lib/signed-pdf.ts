import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface SignatureData {
  typedName: string;
  signedAt: string;
  ipAddress: string;
  documentHash: string;
}

interface ProposalPdfData {
  clientName: string;
  companyName: string;
  scope: string;
  timeline: string;
  deliverables: string[];
  basePrice: number;
  discounts: Array<{ label: string; amount: number }>;
  finalPrice: number;
  paymentSchedule: Array<{ milestone: string; amount: number; percentage: number }>;
}

export async function generateSignedPdf(
  proposal: ProposalPdfData,
  signature: SignatureData
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([612, 792]); // US Letter
  const { height } = page.getSize();
  let y = height - 50;
  const margin = 50;
  const lineHeight = 16;

  // Helper to draw text
  const drawText = (text: string, options: { bold?: boolean; size?: number; indent?: number } = {}) => {
    const f = options.bold ? boldFont : font;
    const size = options.size || 11;
    const x = margin + (options.indent || 0);
    page.drawText(text, { x, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
    y -= lineHeight;
  };

  // Header
  drawText("OphidianAI -- Project Proposal", { bold: true, size: 18 });
  y -= 10;
  drawText(`Prepared for: ${proposal.clientName} (${proposal.companyName})`, { size: 12 });
  y -= 20;

  // Scope
  drawText("Scope", { bold: true, size: 14 });
  drawText(proposal.scope);
  y -= 10;

  // Timeline
  drawText("Timeline", { bold: true, size: 14 });
  drawText(proposal.timeline);
  y -= 10;

  // Deliverables
  drawText("Deliverables", { bold: true, size: 14 });
  for (const d of proposal.deliverables) {
    drawText(`  - ${d}`, { indent: 10 });
  }
  y -= 10;

  // Pricing
  drawText("Pricing", { bold: true, size: 14 });
  drawText(`Base Price: $${(proposal.basePrice / 100).toLocaleString()}`);
  for (const discount of proposal.discounts) {
    drawText(`${discount.label}: -$${(discount.amount / 100).toLocaleString()}`);
  }
  drawText(`Total: $${(proposal.finalPrice / 100).toLocaleString()}`, { bold: true });
  y -= 10;

  // Payment Schedule
  drawText("Payment Schedule", { bold: true, size: 14 });
  for (const ps of proposal.paymentSchedule) {
    drawText(`${ps.milestone}: $${(ps.amount / 100).toLocaleString()} (${ps.percentage}%)`);
  }
  y -= 30;

  // Signature Block
  page.drawLine({
    start: { x: margin, y },
    end: { x: 612 - margin, y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 20;

  drawText("ELECTRONIC SIGNATURE", { bold: true, size: 12 });
  y -= 5;
  drawText(`Electronically signed by: ${signature.typedName}`, { bold: true });
  drawText(`Date: ${new Date(signature.signedAt).toLocaleString("en-US", { timeZone: "America/New_York" })}`);
  drawText(`IP Address: ${signature.ipAddress}`);
  drawText(`Document Hash: ${signature.documentHash}`);
  y -= 10;
  drawText("This document was electronically signed under the ESIGN Act.", { size: 9 });

  return doc.save();
}
