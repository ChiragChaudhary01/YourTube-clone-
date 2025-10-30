import axios from "axios";

export function getEmailProvider() {
  if (process.env.BREVO_API_KEY) return "brevo";
  return "none";
}

export async function sendInvoiceEmail({ user, update, razorpayPaymentId, pdfBuffer }) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.BREVO_FROM_EMAIL;
    const fromName = process.env.BREVO_FROM_NAME || "YourTube";

    if (!apiKey || !fromEmail) {
      throw new Error("Missing Brevo environment variables");
    }

    const htmlContent = `
      <h2>YourTube Plan Purchase Confirmation</h2>
      <p>Hi ${user.name || "User"},</p>
      <p>Thank you for upgrading your plan. Here are your details:</p>
      <ul>
        <li><strong>Plan:</strong> ${update.planType}</li>
        <li><strong>Amount:</strong> ₹${(update.planAmount / 100).toFixed(2)}</li>
        <li><strong>Duration:</strong> ${
          update.planType === "Gold" ? "Unlimited" : update.planDurationLimit + " minutes"
        }</li>
        <li><strong>Payment ID:</strong> ${razorpayPaymentId}</li>
        <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>Enjoy watching!</p>
    `;

    const payload = {
      sender: { name: fromName, email: fromEmail },
      to: [{ email: user.email, name: user.name || "User" }],
      subject: `YourTube: ${update.planType} Plan Activated`,
      htmlContent,
      attachment: pdfBuffer
        ? [
            {
              name: `invoice-${razorpayPaymentId}.pdf`,
              content: pdfBuffer.toString("base64"),
            },
          ]
        : [],
    };

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    return { ok: true, provider: "brevo", id: response.data.messageId };
  } catch (error) {
    console.error("sendInvoiceEmail failed:", error.response?.data || error.message);
    return {
      ok: false,
      provider: "brevo",
      error: error.response?.data?.message || error.message,
    };
  }
}


