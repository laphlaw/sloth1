# Authentication and API Request Flow

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant R as React Frontend
    participant G as Google OAuth
    participant F as Firebase
    participant L as Lambda/API Gateway
    participant S as Stripe

    %% Initial Authentication
    U->>R: Click "Sign in with Google"
    R->>G: Redirect to Google Sign-in
    G->>U: Show login page
    U->>G: Enter credentials
    G->>F: Authenticate
    F->>R: Return ID token (JWT)
    R->>U: Store token in browser

    %% Making an API Request (e.g., Payment Setup)
    U->>R: Click "Setup Payment"
    R->>L: POST /setup-intent with Bearer token
    Note over L: Lambda checks token
    L->>F: Verify token using<br/>Firebase Admin SDK<br/>(private key)
    F->>L: Token valid
    L->>S: Create SetupIntent
    S->>L: Return client secret
    L->>R: Return client secret
    R->>U: Show payment form

    %% Completing Payment Setup
    U->>R: Enter card details
    R->>S: Submit card to Stripe
    S->>R: Return payment method
    R->>L: POST /save-payment-method<br/>with Bearer token
    Note over L: Lambda verifies token again
    L->>F: Verify token
    F->>L: Token valid
    L->>S: Save payment method
    S->>L: Confirm saved
    L->>R: Success response
    R->>U: Show success message
```

## Flow Explanation

1. **Initial Authentication:**
   - User clicks "Sign in with Google" in your React app
   - Google OAuth handles login
   - Firebase provides a JWT token
   - Frontend stores this token

2. **API Request Security:**
   - Frontend includes token in all API requests
   - Lambda functions receive requests through API Gateway
   - Lambda uses Firebase Admin SDK (with private key) to verify tokens
   - This ensures only authenticated users can access your API

3. **Why Private Key is Needed:**
   - Frontend: Uses public Firebase config for login
   - Backend: Uses private key to verify tokens
   - Without private key, anyone could forge tokens

4. **AWS Infrastructure:**
   - Frontend: Hosted on S3, served via CloudFront
   - API: Lambda functions behind API Gateway
   - Authentication: Firebase + Lambda verification
   - Payments: Stripe integration via Lambda

This secure setup ensures that:
- Only real Google-authenticated users can access your API
- Tokens cannot be forged
- Sensitive operations (payments) are properly secured
- Frontend and backend are properly separated
