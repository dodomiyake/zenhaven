import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

async function updateOrderStatus(session: Stripe.Checkout.Session, status: string) {
    try {
        // Update the session metadata with the new status
        await stripe.checkout.sessions.update(session.id, {
            metadata: { status }
        });

        // Here you could also update your database if you're storing orders there
        console.log(`Updated order ${session.id} status to ${status}`);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

export async function POST(request: Request) {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature found' },
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
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    const session = event.data.object as Stripe.Checkout.Session;

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                // Payment is successful and the subscription is created
                await updateOrderStatus(session, 'processing');
                break;

            case 'checkout.session.expired':
                // Session has expired (customer didn't complete payment)
                await updateOrderStatus(session, 'cancelled');
                break;

            case 'payment_intent.payment_failed':
                // Payment failed or was declined
                await updateOrderStatus(session, 'cancelled');
                break;

            case 'payment_intent.succeeded':
                // Payment was successful
                await updateOrderStatus(session, 'processing');
                break;

            case 'charge.refunded':
                // Payment was refunded
                await updateOrderStatus(session, 'cancelled');
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
} 