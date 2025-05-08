# IamHuman

![IamHuman](https://github.com/user-attachments/assets/374e23d4-1bc6-43e6-ba55-b3df00697348)

## Overview

IamHuman is a product that showcases a proof of concept (PoC) for identity verification using the ZKPassport SDK. It combines multiple verification methods, including unique human motion patterns (such as moving your mobile device in a figure-eight), fingerprint recognition, and facial ID. While the process may sound complex, in reality it takes less than 30 seconds—and even faster if you've already generated a unique identifier for the domain in which you're proving your humanness.

## Disclaimer

⚠️ **Important Notice**

This project is currently in MVP/development stage and has several limitations and work-in-progress features:

1. **Simulated Verification**

   - The current implementation uses simulated verification

2. **Security Limitations**

   - Basic session management is implemented
   - No production-grade security measures are in place

3. **Future Considerations**
   - Implementation of proper security measures
   - Addition of persistent storage
   - Enhanced error handling and validation
   - Rate limiting and security features
   - Correct implementation and e2e tests on moving the mobile device while proving

## Features

- QR code generation for verification
- Simulated passport verification system
- RESTful API endpoints for verification
- Session management for verified users
- Real-time verification status updates
- Cross-platform compatibility (We aim to make our solution work on both Android and iOS.)

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
PORT=3001
NODE_ENV=development
SESSION_SECRET=your_session_secret
VERIFICATION_TIMEOUT=300000  # 5 minutes in milliseconds
```

## Usage

1. Start the verification server:

```bash
node verifyServer.js
```

The server will start running at `http://localhost:3001`

2. Access the verification QR code:

Currently the ZKPassport's QR code verification is mocked due to unresolved blocker issue, so one can just click on the link below the QR code to proceed.

3. Moving verification process:

- When a user scans the QR code or clicks the verification link, they will be marked as verified
  _Currently those are still work in progress 🏗️:_
  - 🚧 The system maintains a session of verified users
  - 🚧 Verification status can be checked through the API
  - 🚧 Sessions expire after the configured timeout period

## API Endpoints

TODO

### Project Structure

TODO

## Troubleshooting

### Common Issues

1. **Server won't start**

   - Check if port 3001 is already in use
   - Verify Node.js version is compatible
   - Ensure all dependencies are installed

2. **QR Code not generating**

   - Check if the userId parameter is provided
   - Verify server is running
   - Check browser console for errors

3. **Verification not working**
   - Ensure the server is running
   - Check if the session hasn't expired
   - Verify the userId is correct

### Debug Mode

To enable debug mode, set the following environment variable:

```bash
DEBUG=true node verifyServer.js
```

## Environment Variables

| Variable             | Description                          | Default     | Required |
| -------------------- | ------------------------------------ | ----------- | -------- |
| PORT                 | Server port number                   | 3001        | No       |
| NODE_ENV             | Environment (development/production) | development | No       |
| SESSION_SECRET       | Secret for session encryption        | -           | Yes      |
| VERIFICATION_TIMEOUT | Session timeout in milliseconds      | 300000      | No       |
| DEBUG                | Enable debug mode                    | false       | No       |

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

DM thevasi1 or nikoanon on discord if you have any questions or feedback.
