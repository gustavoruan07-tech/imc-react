import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { plan } = req.body;

    // Define qual o Price ID do Stripe com base no plano
    const priceId =
      plan === 'yearly'
        ? process.env.STRIPE_PRICE_YEARLY
        : process.env.STRIPE_PRICE_MONTHLY;

    // Define a URL base prioritária
    const baseUrl =
      process.env.PUBLIC_SITE_URL ||
      'https://imc-react-b5jf-edz4539gk-gustavoruan.vercel.app';

    // Cria a sessão de Checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erro no checkout:', error);
    return res.status(500).json({ error: error.message });
  }
}
