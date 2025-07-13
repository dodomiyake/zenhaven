import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: ContactFormData = await request.json();
        const { name, email, subject, message } = body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Create email content
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
                </div>

                <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Contact Details</h2>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #333;">Name:</strong>
                        <span style="color: #666; margin-left: 10px;">${name}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #333;">Email:</strong>
                        <span style="color: #666; margin-left: 10px;">${email}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #333;">Subject:</strong>
                        <span style="color: #666; margin-left: 10px;">${subject}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #333;">Message:</strong>
                        <div style="color: #666; margin-top: 10px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; margin: 0;">
                        This message was sent from the ZenHaven contact form.
                    </p>
                </div>
            </div>
        `;

        // Send email to the company
        const response = await resend.emails.send({
            from: 'ZenHaven Contact Form <contact@resend.dev>',
            to: ['hello@zenhaven.com', 'support@zenhaven.com'], // You can update these email addresses
            subject: `New Contact Form Submission: ${subject}`,
            html: emailContent,
            replyTo: email, // This allows direct reply to the customer
        });

        // Send confirmation email to the customer
        const customerEmailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0; font-size: 28px;">Thank you for contacting ZenHaven!</h1>
                </div>

                <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
                        Hi ${name},
                    </p>
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        Thank you for reaching out to us! We've received your message and our team will get back to you within 24 hours.
                    </p>
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        <strong>Your message details:</strong><br>
                        Subject: ${subject}<br>
                        Message: ${message}
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; margin: 0;">
                        If you have any urgent questions, feel free to call us at +1 (555) 123-4567.
                    </p>
                </div>
            </div>
        `;

        await resend.emails.send({
            from: 'ZenHaven <hello@zenhaven.com>',
            to: email,
            subject: 'Thank you for contacting ZenHaven',
            html: customerEmailContent,
        });

        console.log('Contact form email sent successfully:', response);

        return NextResponse.json(
            { message: 'Contact form submitted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error sending contact form email:', error);
        return NextResponse.json(
            { error: 'Failed to send contact form' },
            { status: 500 }
        );
    }
} 