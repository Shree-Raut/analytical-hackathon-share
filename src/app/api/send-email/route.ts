import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody, reportId } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "to, subject, and body are required" },
        { status: 400 },
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️  RESEND_API_KEY not configured. Email not sent.");
      console.log("=== Email Would Be Sent (Demo Mode) ===");
      console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${emailBody}`);
      if (reportId) {
        console.log(`Report ID: ${reportId}`);
      }
      console.log("========================================");
      
      return NextResponse.json(
        { 
          success: true, 
          message: "Email logged (demo mode - no API key configured)",
          recipients: Array.isArray(to) ? to.length : 1,
          demo: true
        }, 
        { status: 200 }
      );
    }

    // Send actual email with Resend
    const emailAddresses = Array.isArray(to) ? to : [to];
    
    try {
      const data = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: emailAddresses,
        subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7d654e;">${subject}</h2>
            <p style="color: #1a1510; line-height: 1.6;">${emailBody}</p>
            ${reportId ? `<p style="color: #7d654e; font-size: 12px; margin-top: 20px;">Report ID: ${reportId}</p>` : ''}
          </div>
        `,
      });

      console.log("✅ Email sent successfully:", data);
      
      return NextResponse.json(
        { 
          success: true, 
          message: "Email sent successfully",
          recipients: emailAddresses.length,
          emailId: data.id
        }, 
        { status: 200 }
      );
    } catch (emailError: unknown) {
      console.error("Resend email error:", emailError);
      throw new Error(`Failed to send email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    );
  }
}
