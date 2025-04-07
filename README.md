# ChatBot Application

## Overview

The ChatBot Application is a modern, intelligent conversational interface built on the MERN stack (MongoDB, Express, React, Node.js) with Google's Gemini AI API integration. This application provides users with a responsive and intuitive chatbot experience.

Designed to be both powerful and user-friendly, the application enables natural conversations, content generation, and assistance across a wide range of topics. The MERN architecture ensures scalability, performance, and a seamless user experience across devices.

## Features

### Core Functionality
- **AI-Powered Conversations**: Utilize Google's Gemini API for natural language understanding and generation
- **Real-time Chat Interface**: Instant message delivery with typing indicators
- **Session Persistence**: Conversation history saved and user can retrive their chats
- **User Authentication**: Secure login/signup system or user can signup/login using google insted email/password with Firebase Authentication 
- **Password Recovery**: Users can request a password reset link via email to securely regain access to their accounts

### Advanced Capabilities
- **Speech-to-Text**: Voice input capability using Window Speech Recognition API

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **React**: JavaScript library for building the user interface
- **Redux**: State management for the application
- **Socket.io frontend**: Real-time communication capabilities
- **CSS**: Custom styling with standard CSS
- **Material UI**: Specifically used for dialog modals and pop-up interfaces
- **Axios**: Promise-based HTTP client for API requests

### Backend
- **Node.js**: JavaScript runtime for server-side logic
- **Express**: Web application framework for Node.js
- **MongoDB Atlas**: Cloud database service for storing user data and chat history
- **Socket.io**: Real-time bidirectional event-based communication

### AI Integration
- **Gemini API**: Google's multimodal AI model for natural language processing


### DevOps
- **Netlify**: Frontend hosting and deployment
- **Render**: Backend hosting and deployment

## Live Demo

Experience the ChatBot Application in action: [https://mernstactchatbotapplication.netlify.app/](https://mernstactchatbotapplication.netlify.app/)

---

## Getting Started

Check out the [Installation Guide](./docs/installation.md) for detailed setup instructions.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
