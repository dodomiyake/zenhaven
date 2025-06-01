import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sendOrderConfirmation } from '@/lib/email';
import Stripe from 'stripe';
import { type CreateEmailResponse } from 'resend';

// Helper function to ensure image URL is absolute
function getAbsoluteImageUrl(imageUrl: string | undefined): string | undefined {
    if (!imageUrl) return undefined;
    
    // If the URL is already absolute, return it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    
    // If it's a relative URL, make it absolute using the base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

export async function POST(req: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`🔔 [${requestId}] Webhook received at:`, new Date().toISOString());
    
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        console.error(`❌ [${requestId}] No stripe signature found in webhook request`);
        return NextResponse.json(
            { message: 'No stripe signature' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        console.log(`✅ [${requestId}] Webhook verified. Event type:`, event.type);
    } catch (err: any) {
        console.error(`❌ [${requestId}] Webhook signature verification failed:`, err.message);
        return NextResponse.json({ message: 'Webhook error' }, { status: 400 });
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`💳 [${requestId}] Processing completed checkout session:`, session.id);
                
                try {
                    // Get line items with expanded price data to get product images
                    console.log(`📦 [${requestId}] Fetching line items for session:`, session.id);
                    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
                        expand: ['data.price.product']
                    });
                    
                    if (!lineItems.data.length) {
                        console.warn(`⚠️ [${requestId}] No line items found for session:`, session.id);
                        break;
                    }

                    // Prepare order details
                    const orderDetails = {
                        orderNumber: session.payment_intent as string,
                        amount: session.amount_total as number,
                        createdAt: new Date().toISOString(),
                        items: lineItems.data.map(item => {
                            const product = item.price?.product as Stripe.Product;
                            return {
                                name: item.description as string,
                                quantity: item.quantity as number,
                                price: item.price?.unit_amount as number,
                                image: getAbsoluteImageUrl(product?.images?.[0]) // Convert to absolute URL
                            };
                        }),
                    };

                    // Log complete session and order details for debugging
                    console.log(`📋 [${requestId}] Complete session details:`, {
                        id: session.id,
                        customer: session.customer,
                        customerEmail: session.customer_details?.email,
                        paymentStatus: session.payment_status,
                        amount: session.amount_total,
                        currency: session.currency,
                    });

                    console.log(`📋 [${requestId}] Order details prepared:`, orderDetails);

                    // Send confirmation email
                    if (session.customer_details?.email) {
                        console.log(`📧 [${requestId}] Attempting to send email to:`, session.customer_details.email);
                        try {
                            console.log(`📧 [${requestId}] Email content prepared, calling sendOrderConfirmation...`);
                            const emailResponse = await sendOrderConfirmation(
                                session.customer_details.email,
                                orderDetails
                            );
                            console.log(`✅ [${requestId}] Email sent successfully:`, {
                                emailId: emailResponse.data?.id,
                                to: session.customer_details.email,
                                orderNumber: orderDetails.orderNumber
                            });
                        } catch (emailError) {
                            console.error(`❌ [${requestId}] Failed to send confirmation email:`, emailError);
                            console.error(`📧 [${requestId}] Email context:`, {
                                sessionId: session.id,
                                customerEmail: session.customer_details.email,
                                orderNumber: orderDetails.orderNumber,
                                error: emailError instanceof Error ? emailError.message : 'Unknown error',
                                errorStack: emailError instanceof Error ? emailError.stack : undefined,
                                resendApiKeyExists: !!process.env.RESEND_API_KEY,
                                resendApiKeyLength: process.env.RESEND_API_KEY?.length
                            });
                        }
                    } else {
                        console.warn(`⚠️ [${requestId}] No customer email found in session:`, session.id);
                    }
                } catch (error) {
                    console.error(`❌ [${requestId}] Error processing order confirmation:`, error);
                    console.error(`🔍 [${requestId}] Session details:`, {
                        id: session.id,
                        paymentIntent: session.payment_intent,
                        customerDetails: session.customer_details,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        errorStack: error instanceof Error ? error.stack : undefined
                    });
                }
                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`⏰ [${requestId}] Checkout session expired:`, session.id);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.error(`❌ [${requestId}] Payment failed:`, paymentIntent.id);
                break;
            }

            default:
                console.log(`ℹ️ [${requestId}] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`❌ [${requestId}] Error processing webhook:`, err);
        return NextResponse.json(
            { message: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

// Remove edge runtime as it might not be compatible with all features
export const config = {
    api: {
        bodyParser: false,
    },
}; 