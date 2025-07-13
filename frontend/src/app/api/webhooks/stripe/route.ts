import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sendOrderConfirmation } from '@/lib/email';
import Stripe from 'stripe';

async function updateOrderStatus(session: Stripe.Checkout.Session, status: string) {
    try {
        // Update the session metadata with the new status
        await stripe.checkout.sessions.update(session.id, {
            metadata: { status }
        });

        console.log(`Updated order ${session.id} status to ${status}`);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

export async function POST(request: Request) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`🔔 [${requestId}] Webhook received at:`, new Date().toISOString());
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

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
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`💳 [${requestId}] Processing completed checkout session:`, session.id);
                
                try {
                    // Update order status
                    await updateOrderStatus(session, 'processing');

                    // Get line items with expanded price data to get product images
                    console.log(`📦 [${requestId}] Fetching line items for session:`, session.id);
                    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
                        expand: ['data.price.product']
                    });
                    
                    if (!lineItems.data.length) {
                        console.warn(`⚠️ [${requestId}] No line items found for session:`, session.id);
                        break;
                    }

                    // Get full session details with customer information
                    const checkoutSession = await stripe.checkout.sessions.retrieve(session.id);

                    // Prepare order details for email
                    const orderDetails = {
                        orderNumber: checkoutSession.payment_intent as string,
                        amount: checkoutSession.amount_total as number,
                        createdAt: new Date().toISOString(),
                        items: lineItems.data.map(item => {
                            const product = item.price?.product as Stripe.Product;
                            return {
                                name: item.description as string,
                                quantity: item.quantity as number,
                                price: item.price?.unit_amount as number,
                                image: product?.images?.[0] // Use first product image
                            };
                        }),
                        shippingAddress: {
                            line1: checkoutSession.customer_details?.address?.line1 || '',
                            line2: checkoutSession.customer_details?.address?.line2 || '',
                            city: checkoutSession.customer_details?.address?.city || '',
                            state: checkoutSession.customer_details?.address?.state || '',
                            postal_code: checkoutSession.customer_details?.address?.postal_code || '',
                            country: checkoutSession.customer_details?.address?.country || ''
                        }
                    };

                    // Send confirmation email
                    if (session.customer_details?.email) {
                        console.log(`📧 [${requestId}] Attempting to send email to:`, session.customer_details.email);
                        try {
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
                                error: emailError instanceof Error ? emailError.message : 'Unknown error'
                            });
                        }
                    } else {
                        console.warn(`⚠️ [${requestId}] No customer email found in session:`, session.id);
                    }
                } catch (error) {
                    console.error(`❌ [${requestId}] Error processing order:`, error);
                }
                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`⏰ [${requestId}] Checkout session expired:`, session.id);
                await updateOrderStatus(session, 'cancelled');
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.error(`❌ [${requestId}] Payment failed:`, paymentIntent.id);
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                // We need to find the associated session to update its status
                try {
                    const sessions = await stripe.checkout.sessions.list({
                        payment_intent: paymentIntent.id,
                        limit: 1
                    });
                    
                    if (sessions.data.length > 0) {
                        await updateOrderStatus(sessions.data[0], 'processing');
                    }
                } catch (error) {
                    console.error(`❌ [${requestId}] Error updating session status:`, error);
                }
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