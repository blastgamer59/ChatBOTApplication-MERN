# 💬 Chatbot Application (MERN Stack + Gemini API)

A real-time chatbot application built with the MERN stack that integrates **Google's Gemini API** for AI conversations, **Socket.io** for real-time messaging, and **Material UI** for a sleek, responsive interface.

## 🚀 Features

- 🔐 Email & Password Authentication (Signup/Login/Forgot Password)
- ✉️ Resend Email (CheckEmail Page)
- 🧠 AI Responses via Gemini API
- 💬 Real-time Messaging with Socket.io
- 📅 Chat History (Today, Yesterday, Last 7 Days)
- 🗂️ Sidebar with Chat Threads
- ✨ "New Chat" Functionality
- 📩 Message Storage with MongoDB Atlas
- ✅ Fully Responsive UI using Material UI
- ⚠️ Error Handling with Snackbar + Alert
- ❌ No Local Storage – JWT & Firebase Used
- Google Authentication using Firebase

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Material UI
- Axios
- Socket.io-client

### Backend
- Node.js
- Express.js
- MongoDB Atlas (Native Driver)
- JWT for authentication
- Socket.io
- Gemini API Integration
- Firebase

---

## 📦 Folder Structure

ChatBOTApplication
│
├── frontend/                       # React Frontend
│   ├── public/                   # Public assets (HTML, icons, etc.)
│   └── src/
│       ├── components/           # Reusable UI components (e.g., Sidebar, ChatArea)
│       ├── services/             # API request logic (Axios instances)
│       ├── App.js                # App entry point
│       └── index.js              # React root render
│
├── backend/                      # Node.js + Express Backend
│   ├── node_modules/             # Installed backend dependencies
│   ├── .gitignore                # Specifies intentionally untracked files to ignore
│   ├── package-lock.json         # Locks the versions of dependencies installed
│   ├── package.json              # Backend project metadata and dependencies
│   └── index.js                  # Main entry point for the Express server amd MONGODB Atlas Connection

⚙️ Setup Instructions
Follow these steps to run the chatbot application locally on your machine.

🔧 Prerequisites
Make sure you have the following installed:

Node.js (v16 or above recommended)

npm (comes with Node.js)

MongoDB Atlas account (or a local MongoDB instance)

📁 Clone the Repository
bash
Copy
Edit
git clone https://github.com/blastgamer59/ChatBOTApplication-MERN.git
cd ChatBOTApplication-MERN
🖥️ Backend (Node.js + Express)
bash
Copy
Edit
cd backend

# Install dependencies
npm install

# Create .env file in /backend with the following keys
PORT=5000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000

# Start the server
npm start
The backend server will start at http://localhost:5000.

🌐 Frontend (React.js)
bash
Copy
Edit
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
The React app will run at http://localhost:3000.

🧠 Gemini API
To use Gemini AI for chatbot responses:

Go to https: Google Ai Studio 

Get your Gemini API key.

Add it to your .env file in the backend under GEMINI_API_KEY.

Let me know if you'd like to add Docker setup, deployment guide, or how to use the chatbot instructions too!


Live Link : https://mernstactchatbotapplication.netlify.app/ │
 


