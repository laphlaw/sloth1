const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { withAuth, formatResponse } = require('../lib/auth');
const { getUser, updateUser, createUser } = require('../lib/dynamodb');

// Create a SetupIntent for collecting payment method
exports.createSetupIntent = withAuth(async (event) => {
  try {
    const userId = event.user.uid;
    let user = await getUser(userId);

    // If user doesn't exist in our database, create them
    if (!user) {
      // Create a Stripe customer
      const customer = await stripe.customers.create({
        email: event.user.email,
        metadata: {
          firebaseUid: userId
        }
      });

      // Save user with Stripe customer ID
      user = await createUser(userId, {
        email: event.user.email,
        stripeCustomerId: customer.id
      });
    }

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session' // Important for future payments
    });

    return formatResponse(200, {
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    console.error('Create setup intent error:', error);
    return formatResponse(500, {
      message: 'Failed to initialize payment setup'
    });
  }
});

// Save payment method after successful setup
exports.savePaymentMethod = withAuth(async (event) => {
  try {
    const { paymentMethodId } = JSON.parse(event.body);
    const userId = event.user.uid;
    const user = await getUser(userId);

    if (!user) {
      return formatResponse(404, {
        message: 'User not found'
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId
    });

    // Set as default payment method
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Update user record
    await updateUser(userId, {
      hasPaymentMethod: true,
      defaultPaymentMethodId: paymentMethodId
    });

    return formatResponse(200, {
      message: 'Payment method saved successfully'
    });
  } catch (error) {
    console.error('Save payment method error:', error);
    return formatResponse(500, {
      message: 'Failed to save payment method'
    });
  }
});

// Get user's payment method status
exports.getPaymentMethod = withAuth(async (event) => {
  try {
    const userId = event.user.uid;
    const user = await getUser(userId);

    if (!user) {
      return formatResponse(404, {
        message: 'User not found'
      });
    }

    return formatResponse(200, {
      hasPaymentMethod: !!user.hasPaymentMethod
    });
  } catch (error) {
    console.error('Get payment method error:', error);
    return formatResponse(500, {
      message: 'Failed to get payment method status'
    });
  }
});

// Process payment for failed alarm
exports.processPayment = async (event) => {
  try {
    const { alarmId, userId, amount } = event;
    const user = await getUser(userId);

    if (!user || !user.stripeCustomerId || !user.defaultPaymentMethodId) {
      throw new Error('User payment information not found');
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: user.stripeCustomerId,
      payment_method: user.defaultPaymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        alarmId,
        userId
      }
    });

    // Update alarm with payment status
    await updateAlarm(userId, alarmId, {
      paymentProcessed: true,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Payment processed successfully'
      })
    };
  } catch (error) {
    console.error('Process payment error:', error);
    
    // If it's a card error, we might want to notify the user
    if (error.type === 'StripeCardError') {
      // Here you might want to implement a notification system
      // to alert the user their payment failed
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process payment'
      })
    };
  }
};

// Handle Stripe webhooks
exports.handleWebhook = async (event) => {
  try {
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let stripeEvent;
    
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      return formatResponse(400, {
        message: `Webhook Error: ${err.message}`
      });
    }

    // Handle specific webhook events
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = stripeEvent.data.object;
        await handleFailedPayment(failedPayment);
        break;
    }

    return formatResponse(200, { received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return formatResponse(500, {
      message: 'Failed to handle webhook'
    });
  }
};

async function handleSuccessfulPayment(paymentIntent) {
  const { alarmId, userId } = paymentIntent.metadata;
  
  await updateAlarm(userId, alarmId, {
    paymentStatus: 'succeeded'
  });
}

async function handleFailedPayment(paymentIntent) {
  const { alarmId, userId } = paymentIntent.metadata;
  
  await updateAlarm(userId, alarmId, {
    paymentStatus: 'failed'
  });
  
  // Here you might want to implement retry logic
  // or notify the user about the failed payment
}
