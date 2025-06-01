import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing');
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });

        // Try to list a single product to verify API access
        await stripe.products.list({ limit: 1 });

        return NextResponse.json({ 
            status: 'success',
            message: 'Stripe configuration is valid',
            config: {
                hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
                hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
                hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
                baseUrl: process.env.NEXT_PUBLIC_BASE_URL
            }
        });
    } catch (error: any) {
        console.error('Stripe configuration test error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            type: error.type,
            config: {
                hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
                hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
                hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
                baseUrl: process.env.NEXT_PUBLIC_BASE_URL
            }
        }, { status: 500 });
    }
} 