#!/usr/bin/env node

/**
 * Create a Stripe coupon and promotion code for testing
 * Usage: node create-promotion-code.js
 */

const Stripe = require('stripe')

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable not set')
  console.error('Run: export STRIPE_SECRET_KEY=sk_test_...')
  process.exit(1)
}

const stripe = Stripe(STRIPE_SECRET_KEY)

async function createCouponAndCode() {
  try {
    // Create a coupon with 100% off
    const coupon = await stripe.coupons.create({
      duration: 'once',
      percent_off: 100,
      max_redemptions: 1,
    })

    console.log('✅ Coupon created!')
    console.log('Coupon ID:', coupon.id)
    console.log('')

    // Create a promotion code
    const promotionCode = await stripe.promotionCodes.create({
      code: 'MUSIC25',
      coupon: coupon.id,
    })

    console.log('✅ Promotion code created!')
    console.log('')
    console.log('==========================================')
    console.log('  TEST DISCOUNT CODE: MUSIC25')
    console.log('==========================================')
    console.log('Percent off: 100% (free song)')
    console.log('Uses: 1')
    console.log('')

  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

createCouponAndCode()
