# Sloth - Wake Up On Time

Sloth is a unique alarm application that ensures you wake up on time by requiring you to physically move to a specific location to disable the alarm. If you fail to reach the location in time, a pre-set payment will be processed as a punishment.

## Features

- Google Authentication
- Location-based alarm deactivation using GPS
- Stripe integration for payment processing
- Interactive map for setting alarm locations
- Serverless backend using AWS Lambda and DynamoDB

## Prerequisites

Before running the application, you'll need:

- Node.js (v14 or later)
- AWS Account and configured AWS CLI
- Firebase Project
- Google Maps API Key
- Stripe Account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Frontend
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_API_URL=your_api_url

# Backend
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
npm run backend:install
```

## Running the Application

### Development

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them separately:

Frontend:
```bash
npm start
```

Backend:
```bash
npm run backend:start
```

### Production Deployment

1. Deploy the backend to AWS:
```bash
npm run backend:deploy
```

2. Build and deploy the frontend to your hosting service of choice:
```bash
npm run build
```

## Project Structure

```
sloth/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   └── utils/             # Utility functions
├── backend/               # Serverless backend
│   ├── functions/         # Lambda functions
│   ├── lib/              # Shared backend utilities
│   └── serverless.yml    # Serverless configuration
└── public/               # Static assets
```

## API Endpoints

### Alarms
- `POST /alarms` - Create a new alarm
- `GET /alarms` - List user's alarms
- `POST /check-location` - Verify user's location

### Payments
- `POST /setup-intent` - Create Stripe setup intent
- `POST /save-payment-method` - Save payment method
- `GET /payment-method` - Get payment method status

## Security

- All endpoints are protected with Firebase Authentication
- Stripe payments are processed securely using their official SDK
- User location data is only used when checking alarm conditions
- Payment information is stored securely with Stripe

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
