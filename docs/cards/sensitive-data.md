# Displaying Sensitive Card Data with Sudo Secure Proxy

## Overview

By default, Sudo redacts sensitive card data (card number, CVV, PIN) in API responses to maintain PCI compliance. To display this sensitive data to users, you must use **Secure Proxy Show**, a JavaScript library that securely displays card data via encrypted iframes.

**Important**: Sensitive data never passes through your backend or frontend servers - it goes directly from Secure Proxy to the user's browser, keeping you PCI compliant.

## Backend Implementation

### 1. Generate Card Token Endpoint

The backend provides an endpoint to generate a card token:

```
GET /api/cards/:id/token

User calls GET /api/cards/:id/token to get a card token

```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Authentication:** Requires JWT token (user must own the card)

**Token Expiry:** Card tokens expire after a short period (typically 20 seconds). Generate a new token each time you need to display sensitive data.

## Frontend Implementation

### Step 1: Include Secure Proxy Show Library

Add the Secure Proxy Show script to your HTML:

**Sandbox Environment:**
```html
<script type="text/javascript" src="https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js"></script>
```

**Production Environment:**
```html
<script type="text/javascript" src="https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js"></script>
```

### Step 2: Initialize Secure Proxy

```javascript
const vaultId = "we0dsa28s"; // Sandbox vault ID
// Production: "vdl2xefo5"

const secureProxy = SecureProxy.create(vaultId);
```

**Vault IDs:**
- **Sandbox**: `we0dsa28s`
- **Production**: `vdl2xefo5` (get from Sudo dashboard)

### Step 3: Generate Card Token

Before displaying sensitive data, fetch a card token from your backend:

```javascript
async function getCardToken(cardId) {
  const response = await fetch(`/api/cards/${cardId}/token`, {
    headers: {
      'Authorization': `Bearer ${userJwtToken}`
    }
  });
  const data = await response.json();
  return data.data.token;
}
```

### Step 4: Display Card Number

```javascript
async function displayCardNumber(cardId, containerElementId) {
  // Get token
  const cardToken = await getCardToken(cardId);
  
  // Create Secure Proxy instance
  const vaultId = "we0dsa28s"; // Use production vault ID in production
  const numberSecret = SecureProxy.create(vaultId);
  
  // Request card number
  const cardNumberIframe = numberSecret.request({
    name: 'pan-text',
    method: 'GET',
    path: `/cards/${cardId}/secure-data/number`,
    headers: {
      "Authorization": `Bearer ${cardToken}`
    },
    htmlWrapper: 'text',
    jsonPathSelector: 'data.number',
    serializers: [
      numberSecret.SERIALIZERS.replace(
        '(\\d{4})(\\d{4})(\\d{4})(\\d{4})',
        '$1 $2 $3 $4 '
      ),
    ]
  });
  
  // Render in container
  cardNumberIframe.render(`#${containerElementId}`);
}
```

### Step 5: Display CVV

```javascript
async function displayCVV(cardId, containerElementId) {
  const cardToken = await getCardToken(cardId);
  const vaultId = "we0dsa28s";
  const cvv2Secret = SecureProxy.create(vaultId);
  
  const cvv2iframe = cvv2Secret.request({
    name: 'cvv-text',
    method: 'GET',
    path: `/cards/${cardId}/secure-data/cvv2`,
    headers: {
      "Authorization": `Bearer ${cardToken}`
    },
    htmlWrapper: 'text',
    jsonPathSelector: 'data.cvv2',
    serializers: []
  });
  
  cvv2iframe.render(`#${containerElementId}`);
}
```

### Step 6: Display Default PIN

```javascript
async function displayPIN(cardId, containerElementId) {
  const cardToken = await getCardToken(cardId);
  const vaultId = "we0dsa28s";
  const pinSecret = SecureProxy.create(vaultId);
  
  const pinIframe = pinSecret.request({
    name: 'pin-text',
    method: 'GET',
    path: `/cards/${cardId}/secure-data/defaultPin`,
    headers: {
      "Authorization": `Bearer ${cardToken}`
    },
    htmlWrapper: 'text',
    jsonPathSelector: 'data.defaultPin',
    serializers: []
  });
  
  pinIframe.render(`#${containerElementId}`);
}
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charSet="utf-8">
    <title>Card Details</title>
    <style>
        iframe {
            height: 20px;
            border: 1px solid #ddd;
            padding: 5px;
        }
        .card-info {
            margin: 20px 0;
        }
        label {
            display: block;
            margin-top: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h2>Card Details</h2>
    
    <div class="card-info">
        <label>Card Number:</label>
        <div id="cardNumber"></div>
    </div>
        
    <div class="card-info">
        <label>CVV2:</label>
        <div id="cvv2"></div>
    </div>
    
    <div class="card-info">
        <label>Default PIN:</label>
        <div id="pin"></div>
    </div>
    
    <div class="card-info">
        <label>Expiry Date:</label>
        <div id="expiryDate"></div>
    </div>
    
    <script type="text/javascript" src="https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js"></script>
    <script type="text/javascript">
        const vaultId = "we0dsa28s"; // Sandbox - use "vdl2xefo5" in production
        const cardId = "YOUR_CARD_ID"; // Get from card object
        const userJwtToken = "YOUR_JWT_TOKEN"; // User's authentication token
        
        async function getCardToken(cardId) {
            const response = await fetch(`/api/cards/${cardId}/token`, {
                headers: {
                    'Authorization': `Bearer ${userJwtToken}`
                }
            });
            const data = await response.json();
            return data.data.token;
        }
        
        async function displayCardDetails(cardId) {
            // Get token (expires quickly, so get fresh one)
            const cardToken = await getCardToken(cardId);
            
            // Initialize Secure Proxy instances
            const numberSecret = SecureProxy.create(vaultId);
            const cvv2Secret = SecureProxy.create(vaultId);
            const pinSecret = SecureProxy.create(vaultId);
            
            // Display card number (formatted)
            const cardNumberIframe = numberSecret.request({
                name: 'pan-text',
                method: 'GET',
                path: `/cards/${cardId}/secure-data/number`,
                headers: {
                    "Authorization": `Bearer ${cardToken}`
                },
                htmlWrapper: 'text',
                jsonPathSelector: 'data.number',
                serializers: [
                    numberSecret.SERIALIZERS.replace(
                        '(\\d{4})(\\d{4})(\\d{4})(\\d{4})',
                        '$1 $2 $3 $4 '
                    ),
                ]
            });
            cardNumberIframe.render('#cardNumber');
            
            // Display CVV
            const cvv2iframe = cvv2Secret.request({
                name: 'cvv-text',
                method: 'GET',
                path: `/cards/${cardId}/secure-data/cvv2`,
                headers: {
                    "Authorization": `Bearer ${cardToken}`
                },
                htmlWrapper: 'text',
                jsonPathSelector: 'data.cvv2',
                serializers: []
            });
            cvv2iframe.render('#cvv2');
            
            // Display PIN
            const pinIframe = pinSecret.request({
                name: 'pin-text',
                method: 'GET',
                path: `/cards/${cardId}/secure-data/defaultPin`,
                headers: {
                    "Authorization": `Bearer ${cardToken}`
                },
                htmlWrapper: 'text',
                jsonPathSelector: 'data.defaultPin',
                serializers: []
            });
            pinIframe.render('#pin');
        }
        
        // Display expiry date (not sensitive, can get from card object)
        // This is already available in the card response: expiryMonth and expiryYear
        document.getElementById('expiryDate').textContent = 'MM/YY'; // Use from card object
        
        // Load card details when page loads
        displayCardDetails(cardId);
    </script>
</body>
</html>
```

## Important Notes

1. **Token Expiry**: Card tokens expire quickly (typically 20 seconds). Generate a fresh token each time you need to display sensitive data.

2. **Card ID**: Use the `sudoCardId` from the card object (not the internal card ID). This is the Sudo card ID that matches the card in Sudo's system.

3. **Expiry Date**: The expiry date (month/year) is NOT sensitive data and is already available in the card response from `GET /api/cards/:id`. You don't need Secure Proxy for this.

4. **Security**: Never store or log card tokens. They should be used immediately and discarded.

5. **Error Handling**: If token generation fails or expires, show a user-friendly message and allow them to retry.

6. **Vault ID**: Make sure to use the correct vault ID for your environment (sandbox vs production).

## React/Next.js Example

```tsx
import { useEffect, useState } from 'react';

interface CardDetailsProps {
  cardId: string;
  sudoCardId: string; // Sudo card ID
  expiryMonth: string;
  expiryYear: string;
}

export function CardDetails({ cardId, sudoCardId, expiryMonth, expiryYear }: CardDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Secure Proxy script
    const script = document.createElement('script');
    script.src = 'https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js';
    script.onload = async () => {
      try {
        await displayCardDetails(sudoCardId);
        setLoading(false);
      } catch (err) {
        setError('Failed to load card details');
        setLoading(false);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [sudoCardId]);

  async function getCardToken(cardId: string): Promise<string> {
    const response = await fetch(`/api/cards/${cardId}/token`, {
      headers: {
        'Authorization': `Bearer ${getUserToken()}` // Your auth helper
      }
    });
    const data = await response.json();
    return data.data.token;
  }

  async function displayCardDetails(sudoCardId: string) {
    const vaultId = process.env.NEXT_PUBLIC_SUDO_VAULT_ID || "we0dsa28s";
    const cardToken = await getCardToken(cardId);
    
    const numberSecret = (window as any).SecureProxy.create(vaultId);
    const cvv2Secret = (window as any).SecureProxy.create(vaultId);
    const pinSecret = (window as any).SecureProxy.create(vaultId);
    
    // Card number
    const cardNumberIframe = numberSecret.request({
      name: 'pan-text',
      method: 'GET',
      path: `/cards/${sudoCardId}/secure-data/number`,
      headers: { "Authorization": `Bearer ${cardToken}` },
      htmlWrapper: 'text',
      jsonPathSelector: 'data.number',
      serializers: [
        numberSecret.SERIALIZERS.replace(
          '(\\d{4})(\\d{4})(\\d{4})(\\d{4})',
          '$1 $2 $3 $4 '
        ),
      ]
    });
    cardNumberIframe.render('#cardNumber');
    
    // CVV
    const cvv2iframe = cvv2Secret.request({
      name: 'cvv-text',
      method: 'GET',
      path: `/cards/${sudoCardId}/secure-data/cvv2`,
      headers: { "Authorization": `Bearer ${cardToken}` },
      htmlWrapper: 'text',
      jsonPathSelector: 'data.cvv2',
      serializers: []
    });
    cvv2iframe.render('#cvv2');
    
    // PIN
    const pinIframe = pinSecret.request({
      name: 'pin-text',
      method: 'GET',
      path: `/cards/${sudoCardId}/secure-data/defaultPin`,
      headers: { "Authorization": `Bearer ${cardToken}` },
      htmlWrapper: 'text',
      jsonPathSelector: 'data.defaultPin',
      serializers: []
    });
    pinIframe.render('#pin');
  }

  if (loading) return <div>Loading card details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>
        <label>Card Number:</label>
        <div id="cardNumber"></div>
      </div>
      <div>
        <label>CVV:</label>
        <div id="cvv2"></div>
      </div>
      <div>
        <label>PIN:</label>
        <div id="pin"></div>
      </div>
      <div>
        <label>Expiry:</label>
        <div>{expiryMonth}/{expiryYear}</div>
      </div>
    </div>
  );
}
```

## API Reference

### Generate Card Token

**Endpoint:** `GET /api/cards/:id/token`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `404`: Card not found
- `403`: User doesn't own this card
- `500`: Failed to generate token

## Security Best Practices

1. **Never log or store card tokens**
2. **Generate tokens on-demand** (don't cache them)
3. **Use HTTPS** for all requests
4. **Validate card ownership** before generating tokens
5. **Set appropriate token expiry** (handled by Sudo)
6. **Show sensitive data only when necessary** (e.g., on user request)

## References

- [Sudo Secure Proxy Documentation](https://docs.sudo.africa/docs/displaying-sensitive-card-data)
- [Generate Card Token API](https://docs.sudo.africa/reference/generate-card-token)
