import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = headers().get('stripe-signature')!;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                webhookSecret
            );
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json(
                { message: 'Webhook signature verification failed' },
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                
                // Here you would typically:
                // 1. Update order status in your database
                // 2. Send confirmation email
                // 3. Update inventory
                // 4. Any other post-purchase actions

                console.log('Payment successful for session:', session.id);
                
                // You can access metadata you passed during checkout
                const { couponCode, discountApplied } = session.metadata || {};
                
                // Access customer details
                const customerDetails = session.customer_details;
                const amountTotal = session.amount_total;
                
                // Here you would save the order details to your database
                // await saveOrder({
                //     sessionId: session.id,
                //     customerId: session.customer,
                //     amount: amountTotal,
                //     email: customerDetails?.email,
                //     couponUsed: couponCode,
                //     discount: discountApplied,
                //     items: session.line_items // You might need to fetch line items separately
                // });

                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('Checkout session expired:', session.id);
                // Handle expired checkout sessions
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.error('Payment failed:', paymentIntent.id);
                // Handle failed payments
                break;
            }

            // Add more event types as needed
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Webhook error:', err.message);
        return NextResponse.json(
            { message: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

// Using edge runtime for better performance
export const config = {
    runtime: 'edge',
}; 