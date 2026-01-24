// app/api/payment/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, financialAidId, donorName, donorEmail, isAnonymous, message } = await request.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Minimum donation amount is Rs. 100' },
        { status: 400 }
      );
    }

    const baseUrl = request.headers.get('origin') || 'https://athena.mehara.io';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `Donation for Financial Aid #${financialAidId}`,
              description: isAnonymous ? 'Anonymous donation' : `From ${donorName || 'Supporter'}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      customer_email: donorEmail || undefined,
      success_url: `${baseUrl}/financial-aid/payment/callback?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${baseUrl}/financial-aid/payment/cancel?status=cancelled`,
      metadata: {
        financialAidId: String(financialAidId),
        donorName: donorName || 'Anonymous',
        isAnonymous: String(isAnonymous),
        message: message || '',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
