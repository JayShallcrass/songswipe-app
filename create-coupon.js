#!/usr/bin/env node

/**
 * Create a Stripe coupon for testing
 * Usage: node create-coupon.js
 */

const Stripe = require('stripe')

// Get Stripe key from environment
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable not set')
  console.error('Run: export STRIPE_SECRET_KEY=sk_test_...')
  process.exit(1)
}

const stripe = Stripe(STRIPE_SECRET_KEY)

async function createCoupon() {
  try {
    // Create a coupon for testing (100% off, max 1 use)
    const coupon = await stripe.coupons.create({
      duration: 'once',
      percent_off: 100, // 100% off for testing
      max_redemptions: 1,
      metadata: {
        test: 'true',
        created_by: 'songswipe'
      }
    })

    console.log('✅ Coupon created successfully!')
    console.log('')
    console.log('Coupon ID:', coupon.id)
    console.log('Percent off:', coupon.percent_off + '%')
    console.log('Max redemptions:', coupon.max_redemptions)
    console.log('')
    console.log('To use this coupon in checkout, add it as a promotion_code when creating a checkout session.')
    console.log('')
    console.log('Example promotion code:', 'SONGSWIPE-TEST')
    
    return coupon
  } catch (error) {
    console.error('Error creating coupon:', error.message)
    process.exit(1)
  }
}

createCoupon()
