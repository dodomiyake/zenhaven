import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// Helper function to format Stripe order data
function formatOrder(session: Stripe.Checkout.Session) {
    return {
        id: session.id,
        orderNumber: session.payment_intent as string,
        customerEmail: session.customer_details?.email,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        status: session.metadata?.status || 'pending',
        createdAt: new Date(session.created * 1000).toISOString(),
        items: session.line_items?.data.map(item => ({
            name: item.description,
            quantity: item.quantity,
            price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0
        })) || []
    };
}

// Middleware to check admin authentication
async function checkAuth(request: Request) {
    const headersList = await headers();
    const isAdmin = headersList.get('x-admin-token') === process.env.ADMIN_SECRET_KEY;
    
    if (!isAdmin) {
        return new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401 }
        );
    }
    return null;
}

export async function GET(request: Request) {
    // Check authentication
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        // Get all completed checkout sessions
        const sessions = await stripe.checkout.sessions.list({
            limit: 100,
            expand: ['data.line_items'],
        });

        // Format the orders
        const orders = sessions.data
            .filter(session => session.payment_status === 'paid')
            .map(formatOrder);

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    // Check authentication
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('id');
        const { status } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Update the session metadata with the new status
        const session = await stripe.checkout.sessions.update(sessionId, {
            metadata: { status }
        });

        return NextResponse.json({
            id: session.id,
            status: session.metadata?.status
        });
    } catch (error) {
        console.error('Failed to update order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
} 