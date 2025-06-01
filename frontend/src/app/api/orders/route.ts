import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');
        const starting_after = searchParams.get('starting_after') || undefined;

        // Get payments with expanded customer and charge data
        const payments = await stripe.paymentIntents.list({
            limit,
            ...(starting_after ? { starting_after } : {}),
            expand: ['data.customer', 'data.latest_charge'],
        });

        // Filter for successful payments only
        const successfulPayments = payments.data.filter(
            payment => payment.status === 'succeeded'
        );

        // Transform payment data into order format
        const orders = successfulPayments.map((payment) => ({
            orderNumber: payment.id,
            amount: payment.amount,
            status: payment.status,
            createdAt: new Date(payment.created * 1000).toISOString(),
            customerEmail: payment.receipt_email,
            // If you need more detailed item information, consider storing this in your database
            // or in payment metadata when creating the payment
            metadata: payment.metadata
        }));

        return NextResponse.json({ 
            orders,
            has_more: payments.has_more,
            next_page: payments.has_more ? page + 1 : null,
            next_cursor: payments.has_more && payments.data.length > 0 
                ? payments.data[payments.data.length - 1].id 
                : null
        });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { 
                message: 'Failed to fetch orders',
                error: error.message 
            },
            { status: error.statusCode || 500 }
        );
    }
} 