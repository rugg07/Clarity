'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
})

export async function createCheckoutSession(credits: number) 
{
    const {userId} = await auth()
    if (!userId) {
        throw new Error('Unauthorized')
    }
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
            {
                price_data:{
                    currency: 'usd',
                    product_data: {
                        name: `${credits} Clarity Credits`,
                    },
                    unit_amount: Math.round((credits / 50) * 100),
                },
                quantity: 1,
            },
        ],
        customer_creation: 'always',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/create-project`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
        client_reference_id: userId.toString(),
        metadata:{
            credits
        }
    })

    return redirect(session.url!)
} 