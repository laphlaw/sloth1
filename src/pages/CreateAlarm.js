import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FormContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MapContainer = styled.div`
  height: 400px;
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
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
`;

const CreateAlarm = () => {
  console.log("api key: " + process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
  const { user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [time, setTime] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultCenter = {
    lat: 37.7749,
    lng: -122.4194
  };

  const handleMapClick = (event) => {
    setLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!location || !time || !amount) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/alarms`,
        {
          location,
          time,
          amount: parseFloat(amount)
        },
        {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` }
        }
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating alarm:', error);
      setError(error.response?.data?.message || 'Failed to create alarm');
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1>Create New Alarm</h1>
      <FormContainer>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <MapContainer>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={defaultCenter}
              zoom={13}
              onClick={handleMapClick}
            >
              {location && (
                <Marker
                  position={location}
                />
              )}
            </GoogleMap>
          </MapContainer>
        </LoadScript>

        <Form onSubmit={handleSubmit}>
          <div>
            <Label>Wake Up Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Punishment Amount ($)</Label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading || !location}>
            {loading ? 'Creating...' : 'Create Alarm'}
          </Button>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default CreateAlarm;
