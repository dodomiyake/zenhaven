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
}

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount / 100);
};

// Helper function to validate image URL
function isValidImageUrl(url: string | undefined): boolean {
    if (!url) return false;
    try {
        new URL(url); // This will throw if the URL is invalid
        return true;
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
        const { orderNumber, amount, items, createdAt } = orderDetails;
        
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
                        const itemTotal = item.price * item.quantity;
                        const hasValidImage = item.image && isValidImageUrl(item.image);
                        
                        return `
                            <div style="margin-bottom: 25px; display: flex; align-items: center;">
                                ${hasValidImage ? `
                                    <div style="margin-right: 15px; flex-shrink: 0;">
                                        <img src="${item.image}" 
                                             alt="${item.name}" 
                                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;"
                                             onerror="this.style.display='none'"
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
                                        <span style="color: #333;">${formatPrice(itemTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    
                    <div style="margin-top: 30px; border-top: 1px solid #000; padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: bold; color: #333; font-size: 16px;">Total</span>
                            <span style="margin: 0 15px; color: #999;">-</span>
                            <span style="font-weight: bold; color: #333; font-size: 16px;">${formatPrice(amount)}</span>
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