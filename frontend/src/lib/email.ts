import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface OrderDetails {
    orderNumber: string;
    amount: number;
    createdAt: string;
    items: OrderItem[];
    shippingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
}

// Helper function to format price
function formatPrice(amount: number): string {
    return `$${(amount / 100).toFixed(2)}`;
}

// Helper function to validate image URL
function isValidImageUrl(url: string | undefined): boolean {
    if (!url) return false;
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

export async function sendOrderConfirmation(
    to: string,
    orderDetails: OrderDetails
) {
    console.log('📧 Starting email send process');
    console.log('📧 Email recipient:', to);
    console.log('📧 Order details:', orderDetails);

    try {
        const { orderNumber, amount, items, createdAt, shippingAddress } = orderDetails;
        
        console.log('📧 Preparing email content');
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0; font-size: 28px;">Thank you for your order!</h1>
                </div>

                <div style="margin-bottom: 30px;">
                    <p style="margin: 5px 0; color: #666; font-size: 16px;">Order #${orderNumber}</p>
                    <p style="margin: 5px 0; color: #666; font-size: 16px;">Date: ${new Date(createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })}</p>
                </div>
                
                <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Order Summary</h2>
                    ${items.map(item => {
                        const unitPrice = formatPrice(item.price);
                        const itemTotal = formatPrice(item.price * item.quantity);
                        const hasValidImage = item.image && isValidImageUrl(item.image);
                        
                        return `
                            <div style="display: flex; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
                                ${hasValidImage ? `
                                    <div style="flex-shrink: 0; margin-right: 15px;">
                                        <img src="${item.image}"
                                             alt="${item.name}"
                                             width="80"
                                             height="80"
                                             style="object-fit: cover; border-radius: 4px;"
                                        />
                                    </div>
                                ` : ''}
                                <div style="flex-grow: 1;">
                                    <div style="color: #333; font-weight: 500; margin-bottom: 8px;">
                                        ${item.name}
                                    </div>
                                    <div style="color: #666; font-size: 14px;">
                                        <span>${unitPrice} × ${item.quantity}</span>
                                        <span style="margin: 0 15px; color: #999;">-</span>
                                        <span style="float: right; color: #333; font-weight: 500;">${itemTotal}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee;">
                        <div style="display: flex; justify-content: space-between; font-weight: bold;">
                            <span style="color: #333; font-size: 16px;">Total</span>
                            <span style="margin: 0 15px; color: #999;">-</span>
                            <span style="color: #333; font-size: 16px;">${formatPrice(amount)}</span>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; margin: 0;">
                        If you have any questions about your order, please contact our support team.
                    </p>
                </div>
            </div>
        `;

        console.log('📧 Sending email via Resend');
        const response = await resend.emails.send({
            from: 'Zenhaven <orders@resend.dev>',
            to,
            subject: `Order Confirmation #${orderNumber}`,
            html: emailContent,
        });

        console.log('📧 Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error('❌ Failed to send order confirmation email:', error);
        console.error('📧 Error details:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            resendApiKeyExists: !!process.env.RESEND_API_KEY,
            resendApiKeyLength: process.env.RESEND_API_KEY?.length
        });
        throw error;
    }
} 