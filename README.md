# ChatBot Application

## Overview
ChatBot Application is a modern, interactive conversational AI platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with Google's Gemini API integration. This application provides users with an intuitive interface to interact with an AI-powered chatbot capable of understanding and responding to a wide range of queries.

## Features
- **AI-Powered Conversations**: Leveraging Google's Gemini API for natural language understanding and generation
- **User Authentication**: Secure login and registration system
- **Conversation History**: Save and retrieve past conversations
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Real-time Responses**: Instant message delivery and responses

## Tech Stack
- **Frontend**: React.js, Redux for state management, CSS for styling
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB for storing user data and conversation history
- **AI Integration**: Google Gemini API
- **Authentication**: Firebase
- **Deployment**: For Backend Render.com and For Frontend Netlify

## Prerequisites
- Node.js (v16.x or higher)
- MongoDB (v4.x or higher)
- Google Gemini API key

## Installation

### Clone the repository
```bash
git clone https://github.com/blastgamer59/ChatBOTApplication-MERN.git
cd frontend
```

### Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Environment Variables
Create `.env` files in both the server and client directories:

### Running the Application

#### Development Mode
```bash
# Start the backend server
cd server
npm start

# Start the frontend in another terminal
cd frontend
npm start
```

# Start the server which will serve the built frontend
cd ../server
npm start
```
## Gemini API Integration
The application uses Google's Gemini API to process natural language input and generate human-like responses. The integration is handled through a middleware service that manages API calls, rate limiting, and error handling.

## Project Structure
```
chatbotapplication/
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source files
│   │   ├── components/     # UI components
│   │   ├── services/       # API services
│   │   ├── App.js          # Main component
│   │   └── index.js        # Entry point
│   └── package.json        # Dependencies
│
├── server/                 # Node.js backend
│   ├── app.js              # Express application
│   └── package.json        # Dependencies
│

```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- [Google Gemini API](https://ai.google.dev/)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database)
- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
 


