import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      templateId, 
      name, 
      filters, 
      tier, 
      columns, 
      data,
      teamEmails,
      orgAccess,
      certificationReason,
      certificationChecked
    } = body;

    if (!templateId || !name) {
      return NextResponse.json(
        { error: "templateId and name are required" },
        { status: 400 },
      );
    }

    // Validate tier-specific requirements
    if (tier === "TEAM" && !teamEmails) {
      return NextResponse.json(
        { error: "Team emails are required for TEAM tier" },
        { status: 400 },
      );
    }

    if (tier === "CERTIFIED" && (!certificationReason || !certificationChecked)) {
      return NextResponse.json(
        { error: "Certification details are required for CERTIFIED tier" },
        { status: 400 },
      );
    }

    // Verify the template exists
    const template = await prisma.reportTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}` },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const cookieCustomerId = cookieStore.get("activeCustomerId")?.value;

    let customerId = cookieCustomerId;
    if (!customerId) {
      const first = await prisma.customer.findFirst({
        orderBy: { createdAt: "asc" },
      });
      customerId = first?.id;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "No customer found" },
        { status: 404 },
      );
    }

    // Build notes object with tier-specific data
    const notesData: Record<string, unknown> = {};
    if (tier === "TEAM" && teamEmails) {
      notesData.teamEmails = teamEmails;
    }
    if (tier === "PUBLISHED" && orgAccess) {
      notesData.orgAccess = orgAccess;
    }
    if (tier === "CERTIFIED") {
      notesData.certificationReason = certificationReason;
      notesData.certifiedAt = new Date().toISOString();
    }

    const report = await prisma.customerReport.create({
      data: {
        customerId,
        templateId,
        name,
        filters: JSON.stringify(filters || {}),
        layoutOverrides: JSON.stringify({ columns: columns || [], data: data || [] }),
        tier: tier || "PERSONAL",
        notes: Object.keys(notesData).length > 0 ? JSON.stringify(notesData) : null,
      },
    });

    // Send email for TEAM tier
    if (tier === "TEAM" && teamEmails) {
      try {
        // Send notification emails to team members
        const emails = teamEmails.split(',').map((e: string) => e.trim()).filter(Boolean);
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: emails,
            subject: `New Team Report: ${name}`,
            body: `A new report "${name}" has been shared with your team. You can view and edit it in your workspace.`,
            reportId: report.id,
          }),
        });
        if (!emailResponse.ok) {
          console.error("Failed to send team notification emails");
        }
      } catch (error) {
        console.error("Email sending error:", error);
      }
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Save report error:", error);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 },
    );
  }
}
