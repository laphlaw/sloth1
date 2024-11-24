# Sloth App

## Security & Configuration

This app uses runtime configuration to prevent sensitive values from being embedded in the production build. This means:

- Environment variables are not embedded in the JavaScript bundle
- Configuration is injected at runtime via `config.js`
- Sensitive operations are handled by the backend

## Local Development

1. Create a `.env` file in the root directory with your development values:
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_API_URL=http://localhost:3001
```

2. Install dependencies:
```bash
npm install
npm run backend:install
```

3. Start the development server:
```bash
npm run dev
```

This will:
- Create a local runtime configuration
- Start the React development server
- Start the backend server

## Production Deployment

1. Create a `.env.production` file with your production values:
```
REACT_APP_FIREBASE_API_KEY=your_prod_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_prod_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_prod_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_prod_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_prod_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_prod_firebase_app_id
REACT_APP_STRIPE_PUBLIC_KEY=your_prod_stripe_public_key
REACT_APP_API_URL=your_prod_api_url
```

2. Deploy:
```bash
npm run deploy
```

This will:
- Build the React application
- Inject runtime configuration
- Deploy the backend
- Deploy the frontend

## Security Notes

1. The `config.js` file in the public directory contains placeholders and is safe to commit
2. Actual values are injected during the build/deployment process
3. Never commit `.env` or `.env.production` files
4. Use appropriate security headers and CSP in production
5. Ensure Firebase Security Rules are properly configured
6. Set up API key restrictions in Google Cloud Console
7. Configure Stripe webhook endpoints securely

## Backend Configuration

The backend uses its own environment variables for sensitive operations:
- Stripe secret key
- Database credentials
- Other API keys

These are managed separately in the backend's deployment process and are never exposed to the frontend.
