import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import axios from 'axios';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
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
`;

const AlarmCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const NoAlarms = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PaymentWarning = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alarms, setAlarms] = useState([]);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alarmsResponse, paymentResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/alarms`, {
            headers: { Authorization: `Bearer ${await user.getIdToken()}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/payment-method`, {
            headers: { Authorization: `Bearer ${await user.getIdToken()}` }
          })
        ]);

        setAlarms(alarmsResponse.data);
        setHasPaymentMethod(paymentResponse.data.hasPaymentMethod);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Your Alarms</Title>
        <div>
          {!hasPaymentMethod && (
            <Button 
              onClick={() => navigate('/payment-setup')}
              style={{ marginRight: '1rem' }}
            >
              Add Payment Method
            </Button>
          )}
          <Button onClick={() => navigate('/create-alarm')}>
            Create New Alarm
          </Button>
        </div>
      </Header>

      {!hasPaymentMethod && (
        <PaymentWarning>
          ⚠️ Please add a payment method to create new alarms
        </PaymentWarning>
      )}

      {alarms.length > 0 ? (
        alarms.map((alarm) => (
          <AlarmCard key={alarm.id}>
            <h2>{formatTime(alarm.time)}</h2>
            <p>Location: {alarm.locationName}</p>
            <p>Punishment Amount: {formatMoney(alarm.amount)}</p>
            <p>Status: {alarm.active ? 'Active' : 'Inactive'}</p>
          </AlarmCard>
        ))
      ) : (
        <NoAlarms>
          <h2>No Active Alarms</h2>
          <p>Create a new alarm to get started!</p>
        </NoAlarms>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
