import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil" as Stripe.LatestApiVersion,
});

router.post('/verify-payment', async (req, res) => {
    try {
        const { sessionId } = req.body;
        console.log('Received sessionId:', sessionId);

        if (!sessionId) {
            console.log('No sessionId provided');
            return res.status(400).json({ message: 'Session ID is required' });
        }

        console.log('Retrieving session from Stripe...');
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'customer'],
        });
        
        console.log('Session retrieved:', {
            id: session.id,
            payment_status: session.payment_status,
            status: session.status,
            amount_total: session.amount_total
        });

        if (session.payment_status !== 'paid') {
            console.log('Payment not completed. Status:', session.payment_status);
            return res.status(400).json({ 
                message: 'Payment not completed',
                payment_status: session.payment_status,
                session_status: session.status
            });
        }

        // Generate a simple order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();

        console.log('Payment verified successfully. Order number:', orderNumber);

        // Return success with order details
        return res.json({
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
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode
        });
        return res.status(500).json({ 
            message: error.message || 'Payment verification failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

export default router; 