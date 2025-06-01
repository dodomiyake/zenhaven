import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
    try {
        // Get the last 100 payments
        const payments = await stripe.paymentIntents.list({
            limit: 100,
        });

        // Transform payment data into order format
        const orders = await Promise.all(payments.data.map(async (payment) => {
            // Get the session data for additional details
            const sessions = await stripe.checkout.sessions.list({
                payment_intent: payment.id,
            });
            const session = sessions.data[0];

            if (!session) {
                return null;
            }

            // Get line items
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

            return {
                orderNumber: payment.id,
                amount: payment.amount,
                status: payment.status,
                createdAt: new Date(payment.created * 1000).toISOString(),
                customerEmail: session.customer_details?.email,
                items: lineItems.data.map(item => ({
                    name: item.description,
                    quantity: item.quantity,
                    price: item.price?.unit_amount,
                })),
            };
        }));

        // Filter out null values and only return completed payments
        const validOrders = orders.filter(order => 
            order !== null && 
            order.status === 'succeeded'
        );

        return NextResponse.json({ 
            orders: validOrders 
        });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { message: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
} 