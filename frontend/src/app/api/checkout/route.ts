import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CartItem } from '@/types/cart';

export async function POST(request: Request) {
    try {
        const { cartItems, customerEmail } = await request.json();

        if (!cartItems?.length) {
            return NextResponse.json(
                { error: 'No items in cart' },
                { status: 400 }
            );
        }

        // Validate image URLs
        const validateImageUrl = (url: string) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        };

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartItems.map((item: CartItem) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.description,
                        images: item.images?.filter(validateImageUrl) || [],
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents and ensure integer
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
            customer_email: customerEmail,
            metadata: {
                status: 'pending', // Initial order status
            },
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB'], // Add more countries as needed
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'usd',
                        },
                        display_name: 'Free shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 5,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 7,
                            },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 1500,
                            currency: 'usd',
                        },
                        display_name: 'Express shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 2,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 3,
                            },
                        },
                    },
                },
            ],
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: error.message || 'Error creating checkout session' },
            { status: 500 }
        );
    }
} 