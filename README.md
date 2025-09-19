# OHPlus Activation Key Validator

A Node.js API service for validating digitally signed activation keys using RSA-SHA256 signatures. This service accepts activation key files via HTTP POST requests and verifies their authenticity against a public key.

## Features

- Validates activation keys with cryptographic signatures
- RESTful API endpoint for key validation
- File upload support for activation key files
- JSON response format with detailed error messages
- Docker support for easy deployment

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ohplus-activation-key-validator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure the `public.pem` file is present in the root directory (contains the RSA public key for signature verification).

4. Start the server:
   ```bash
   npm start
   ```

   The server will start on port 8080 by default, or use the `PORT` environment variable to specify a different port.

### Docker Deployment

If you prefer to run the service in a Docker container:

```bash
docker build -t ohplus-validator .
docker run -p 8080:8080 ohplus-validator
```

## API Usage

### Endpoint

**POST** `/validate-activation-key`

Validates an uploaded activation key file.

### Request

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: File upload with field name `activationKey`

The activation key file should contain base64-encoded JSON with the following structure:
```json
{
  "licenseData": "{\"user\":\"example\",\"expires\":\"2024-12-31\",\"features\":[\"feature1\",\"feature2\"]}",
  "signature": "base64-encoded-rsa-signature"
}
```

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": "example",
    "expires": "2024-12-31",
    "features": ["feature1", "feature2"]
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid or missing file:
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

**400 Bad Request** - Invalid activation key:
```json
{
  "success": false,
  "error": "Invalid Activation Key"
}
```

## Examples

### Creating an Activation Key File

Before using the API, you need to create a valid activation key file. Here's how to create one programmatically:

```javascript
const crypto = require('crypto');
const fs = require('fs');

// Your license data
const licenseData = JSON.stringify({
  user: "john_doe",
  expires: "2024-12-31",
  features: ["premium", "api_access"]
});

// Load private key (you would have this for signing)
const privateKey = fs.readFileSync('private.pem', 'utf8');

// Create signature
const signer = crypto.createSign('RSA-SHA256');
signer.update(licenseData);
const signature = signer.sign(privateKey, 'base64');

// Create the activation key structure
const activationKey = {
  licenseData: licenseData,
  signature: signature
};

// Encode to base64 and save to file
const encodedKey = Buffer.from(JSON.stringify(activationKey)).toString('base64');
fs.writeFileSync('activation.key', encodedKey);
```

### Using curl

```bash
curl -X POST \
  -F "activationKey=@activation.key" \
  http://localhost:8080/validate-activation-key
```

```bash
curl -F "activationKey=@/Users/dean/Documents/ohplus-license-generator/activation-testUser-1758260338362.lic" \
  https://ohplus-activation-key-validator-zfb2ogutxq-et.a.run.app/validate-activation-key
  ```
  
### Using JavaScript (Node.js)

```javascript
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function validateActivationKey(filePath) {
  const form = new FormData();
  form.append('activationKey', fs.createReadStream(filePath));

  try {
    const response = await axios.post('http://localhost:8080/validate-activation-key', form, {
      headers: form.getHeaders()
    });

    console.log('Validation result:', response.data);
  } catch (error) {
    console.error('Validation failed:', error.response.data);
  }
}

// Usage
validateActivationKey('./activation.key');
```

### Using Python

```python
import requests

def validate_activation_key(file_path):
    with open(file_path, 'rb') as file:
        files = {'activationKey': file}
        response = requests.post('http://localhost:8080/validate-activation-key', files=files)

    if response.status_code == 200:
        print("Validation successful:", response.json())
    else:
        print("Validation failed:", response.json())

# Usage
validate_activation_key('activation.key')
```

## Error Handling

The API provides clear error messages for common issues:

- **No file uploaded**: Ensure you're sending a file with the field name `activationKey`
- **Invalid Activation Key**: The file format is incorrect, signature verification failed, or the JSON structure is malformed

Always check the `success` field in the response to determine if validation was successful.

## Security Notes

- The service uses RSA-SHA256 for cryptographic signature verification
- Ensure your `public.pem` file contains the correct public key that corresponds to the private key used for signing activation keys
- Keep private keys secure and never expose them in client-side code

## Development

To run in development mode:

```bash
node index.js
```

Note: The `package.json` references `server.js` as the main file, but the actual server code is in `index.js`. You may want to update the main field in `package.json` to match.

## License

[Add your license information here]
