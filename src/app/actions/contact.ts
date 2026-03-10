"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ContactFormState = {
  success: boolean;
  message: string;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const company = formData.get("company")?.toString().trim() ?? "";
  const budget = formData.get("budget")?.toString().trim() ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";

  // --- Server-side validation ---
  if (!name) {
    return { success: false, message: "Name is required." };
  }
  if (!email) {
    return { success: false, message: "Email is required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid email address." };
  }
  if (!message) {
    return { success: false, message: "Message is required." };
  }

  // --- Send email via Resend ---
  try {
    await resend.emails.send({
      from: "OphidianAI Contact Form <contact@ophidianai.com>",
      to: "eric.lefler@ophidianai.com",
      subject: `New contact form submission from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || "Not provided"}`,
        `Budget: ${budget || "Not provided"}`,
        "",
        `Message:`,
        message,
      ].join("\n"),
    });
  } catch (error) {
    console.error("Failed to send contact form email:", error);
    return {
      success: false,
      message: "Something went wrong sending your message. Please try again.",
    };
  }

  return { success: true, message: "Message sent. We'll be in touch shortly." };
}
