import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
});

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { message: 'Session ID is required' },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'customer'],
        });

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { message: 'Payment not completed' },
                { status: 400 }
            );
        }

        // Generate a simple order number (you might want to use a more sophisticated method)
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();

        // Return success with order details
        return NextResponse.json({
            status: 'complete',
            orderDetails: {
                orderNumber,
                customerEmail: session.customer_details?.email,
                amount: session.amount_total,
                currency: session.currency,
                items: session.line_items?.data,
                metadata: session.metadata
            }
        });

    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { message: error.message || 'Payment verification failed' },
            { status: 500 }
        );
    }
} 