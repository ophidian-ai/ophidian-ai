import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Use service role client for webhook operations (bypasses RLS)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const resend = getResend();
  const supabase = getSupabase();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const now = new Date().toISOString();

      // Update payment record if it exists (for existing clients with payment schedules)
      const { data: payment } = await supabase
        .from("payments")
        .update({ status: "paid", paid_at: now })
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .select()
        .maybeSingle();

      // If this is a first payment for a new client (proposal-flow),
      // create their account. Check metadata for new_client flag.
      if (!payment && paymentIntent.metadata?.new_client === "true") {
        const email = paymentIntent.metadata.client_email;
        const companyName = paymentIntent.metadata.company_name;
        const serviceType = paymentIntent.metadata.service_type;

        if (email && companyName && serviceType) {
          // Idempotency: check if client already exists
          const { data: existing } = await supabase
            .from("clients")
            .select("id")
            .eq("contact_email", email)
            .maybeSingle();

          if (!existing) {
            // Create auth user via Supabase Admin API (sends magic link)
            const { data: authUser } = await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: { full_name: companyName },
            });

            if (authUser?.user) {
              // Create client record
              const { data: newClient } = await supabase
                .from("clients")
                .insert({
                  profile_id: authUser.user.id,
                  company_name: companyName,
                  contact_email: email,
                  stripe_customer_id: paymentIntent.customer as string | null,
                })
                .select()
                .single();

              if (newClient) {
                // Create service record
                const { data: newService } = await supabase
                  .from("client_services")
                  .insert({
                    client_id: newClient.id,
                    service_type: serviceType,
                    status: "active",
                  })
                  .select()
                  .single();

                // Create project if web design
                if (serviceType.startsWith("web_") && newService) {
                  await supabase.from("projects").insert({
                    client_id: newClient.id,
                    client_service_id: newService.id,
                    status: "active",
                    phase: "discovery",
                  });
                }

                // Create payment record
                await supabase.from("payments").insert({
                  client_id: newClient.id,
                  client_service_id: newService!.id,
                  stripe_payment_intent_id: paymentIntent.id,
                  amount: paymentIntent.amount,
                  milestone_label: "deposit",
                  status: "paid",
                  paid_at: now,
                });
              }

              // Send magic link welcome email
              await supabase.auth.admin.generateLink({
                type: "magiclink",
                email,
                options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
              });
            }
          }
        }
      }

      // Send receipt email
      const recipientEmail = paymentIntent.receipt_email || paymentIntent.metadata?.client_email;
      if (recipientEmail) {
        await resend.emails.send({
          from: "OphidianAI <billing@ophidianai.com>",
          to: recipientEmail,
          subject: "Payment Received - OphidianAI",
          html: `<p>Thank you for your payment of $${(paymentIntent.amount / 100).toFixed(2)}.</p>`,
        });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscriptionRef === "string"
        ? subscriptionRef
        : subscriptionRef?.id;

      if (subscriptionId) {
        // Find the client_service by subscription ID and log the payment
        const { data: service } = await supabase
          .from("client_services")
          .select("id, client_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (service) {
          await supabase.from("payments").insert({
            client_id: service.client_id,
            client_service_id: service.id,
            amount: invoice.amount_paid,
            milestone_label: "monthly",
            status: "paid",
            paid_at: new Date().toISOString(),
          });
        }
      }
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const serviceType = subscription.metadata?.service_type || "seo_growth";
      const monthlyAmount = subscription.items.data[0]?.price?.unit_amount || 0;

      // Check if client already exists
      let client: { id: string } | null = null;
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      client = existingClient;

      // If no client record, this is a new self-service customer.
      if (!client) {
        const stripeCustomer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = stripeCustomer.email;
        const companyName = stripeCustomer.metadata?.company_name || stripeCustomer.name || "Unknown";
        const websiteUrl = stripeCustomer.metadata?.website_url || null;

        if (email) {
          // Idempotency: check by email
          const { data: existingByEmail } = await supabase
            .from("clients")
            .select("id")
            .eq("contact_email", email)
            .maybeSingle();

          if (existingByEmail) {
            client = existingByEmail;
            // Link Stripe customer ID if missing
            await supabase
              .from("clients")
              .update({ stripe_customer_id: customerId })
              .eq("id", client.id);
          } else {
            // Create auth user (sends magic link)
            const { data: authUser } = await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: { full_name: companyName },
            });

            if (authUser?.user) {
              const { data: newClient } = await supabase
                .from("clients")
                .insert({
                  profile_id: authUser.user.id,
                  company_name: companyName,
                  contact_email: email,
                  website_url: websiteUrl,
                  stripe_customer_id: customerId,
                })
                .select()
                .single();

              client = newClient;

              // Send magic link welcome email
              await supabase.auth.admin.generateLink({
                type: "magiclink",
                email,
                options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
              });
            }
          }
        }
      }

      if (client) {
        await supabase.from("client_services").insert({
          client_id: client.id,
          service_type: serviceType,
          status: "active",
          monthly_amount: monthlyAmount,
          stripe_subscription_id: subscription.id,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("client_services")
        .update({
          status: "cancelled",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "checkout.session.completed": {
      // Store custom field data (company_name, website_url) on the Stripe Customer
      // so the subscription.created handler can use it for account creation.
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer && session.custom_fields?.length) {
        const companyField = session.custom_fields.find((f) => f.key === "company_name");
        const websiteField = session.custom_fields.find((f) => f.key === "website_url");
        await stripe.customers.update(session.customer as string, {
          metadata: {
            company_name: companyField?.text?.value || "",
            website_url: websiteField?.text?.value || "",
          },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", paymentIntent.id);

      // Alert admin
      await resend.emails.send({
        from: "OphidianAI System <billing@ophidianai.com>",
        to: "eric.lefler@ophidianai.com",
        subject: "Payment Failed Alert",
        html: `<p>Payment failed for PaymentIntent ${paymentIntent.id}. Customer: ${paymentIntent.customer || "unknown"}. Amount: $${(paymentIntent.amount / 100).toFixed(2)}.</p>`,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
