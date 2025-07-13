import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Forward the request to the new webhook endpoint
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/stripe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': signature
            },
            body
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error forwarding webhook:', error);
        return NextResponse.json(
            { error: 'Webhook forwarding failed' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}; 