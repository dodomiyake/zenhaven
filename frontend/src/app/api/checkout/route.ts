import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Use the latest API version
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, discount, couponCode } = body;

        // Calculate total amount including discount
        const subtotal = items.reduce((sum: number, item: any) => 
            sum + (item.price * item.quantity), 0
        );
        const discountAmount = subtotal * (discount || 0);
        const total = subtotal - discountAmount;

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: [item.image], // Add product image to Stripe checkout
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            })),
            discounts: discount ? [
                {
                    coupon: await createOrRetrieveCoupon(couponCode, discount),
                }
            ] : [],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
            metadata: {
                couponCode: couponCode || '',
                discountApplied: discount || 0,
            },
        });

        return NextResponse.json({ 
            checkoutUrl: session.url,
            sessionId: session.id
        });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to create or retrieve a Stripe coupon
async function createOrRetrieveCoupon(code: string, discountAmount: number) {
    if (!code) return null;

    try {
        // Try to retrieve existing coupon
        const existingCoupon = await stripe.coupons.retrieve(code);
        return existingCoupon.id;
    } catch (error) {
        // If coupon doesn't exist, create a new one
        const newCoupon = await stripe.coupons.create({
            id: code,
            percent_off: discountAmount * 100, // Convert decimal to percentage
            duration: 'once',
        });
        return newCoupon.id;
    }
} 