import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerInfo, outputFormat, amount } = body;

    // In production, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Postmark

    // For now, we'll simulate sending an email
    const emailData = {
      to: customerInfo.email,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed! 🎉</h1>
            </div>
            <div class="content">
              <p>Dear ${customerInfo.name},</p>
              <p>Thank you for your order! We're excited to bring your magical storybook to life.</p>
              
              <div class="order-details">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Product:</strong> ${outputFormat}</p>
                <p><strong>Amount:</strong> ₹${amount}</p>
              </div>
              
              <p>We'll keep you updated on the status of your order.</p>
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The StoryMaker Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StoryMaker. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('Email sent to:', customerInfo.email);
    console.log('Email data:', emailData);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}