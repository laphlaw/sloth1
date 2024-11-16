import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import styled from 'styled-components';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Container = styled.div`
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
`;

const CardElementContainer = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!stripe || !elements) {
      setError('Stripe has not been initialized');
      setLoading(false);
      return;
    }

    try {
      // Get client secret from your backend
      const { data: { clientSecret } } = await axios.post(
        `${process.env.REACT_APP_API_URL}/setup-intent`,
        {},
        {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` }
        }
      );

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: user.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else {
        // Send payment method ID to your backend
        await axios.post(
          `${process.env.REACT_APP_API_URL}/save-payment-method`,
          {
            paymentMethodId: result.setupIntent.payment_method,
          },
          {
            headers: { Authorization: `Bearer ${await user.getIdToken()}` }
          }
        );

        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error setting up payment:', error);
      setError(error.response?.data?.message || 'Failed to set up payment method');
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <CardElementContainer>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </CardElementContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Button type="submit" disabled={loading || !stripe}>
        {loading ? 'Setting up...' : 'Save Payment Method'}
      </Button>
    </Form>
  );
};

const PaymentSetup = () => {
  return (
    <Container>
      <Card>
        <Title>Setup Payment Method</Title>
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </Card>
    </Container>
  );
};

export default PaymentSetup;
