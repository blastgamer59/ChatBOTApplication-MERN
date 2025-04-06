const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const http = require("http");
const admin = require("firebase-admin");
const { Server } = require("socket.io");


const uri =
  "mongodb+srv://admin:admin@chatbot.aqy8ttg.mongodb.net/?retryWrites=true&w=majority&appName=Chatbot";
const port = 5000;
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Client
const client = new MongoClient(uri);


// Firebase Admin SDK Setup
const serviceAccount = require("./ServiceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Gemini API Setup
const genAI = new GoogleGenerativeAI("AIzaSyARfqYYGqsU0f0hGTJ0ZGC-18K_p6o-5-E"); // Gemini API key

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle joining a specific chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // Handle new message
  socket.on("send_message", async (messageData) => {
    try {
      // Save message to database
      const messageCollection = client.db("database").collection("messages");
      messageData.timestamp = new Date();
      await messageCollection.insertOne(messageData);

      // Broadcast to everyone in the chat room
      io.to(messageData.chatId).emit("receive_message", messageData);

      // If user message, generate bot response
      if (messageData.sender === "user") {
        // Indicate bot is typing
        io.to(messageData.chatId).emit("bot_typing", true);

        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(messageData.text);
          let responseText = await result.response.text();

          // Format response properly
          responseText = responseText
            .replace(/\s+/g, " ")
            .replace(/(\n\s*)+/g, "\n")
            .trim();

          const botMessage = {
            text: responseText,
            sender: "bot",
            chatId: messageData.chatId,
            email: messageData.email,
            timestamp: new Date()
          };

          // Save bot message to database
          await messageCollection.insertOne(botMessage);

          // Send bot response to client
          io.to(messageData.chatId).emit("receive_message", botMessage);
        } catch (error) {
          console.error("Error with Gemini API:", error);
          // Send error message to client
          io.to(messageData.chatId).emit("error", "Failed to generate response");
        } finally {
          // Bot is no longer typing
          io.to(messageData.chatId).emit("bot_typing", false);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

async function run() {
  try {
    await client.connect();
    const messageCollection = client.db("database").collection("messages");
    const userCollection = client.db("database").collection("users");

    // Check if email is registered
    app.post("/check-email", async (req, res) => {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      try {
        await admin.auth().getUserByEmail(email);
        res.json({ registered: true });
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          res.json({ registered: false });
        } else {
          console.error("Error checking email:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    });

    // Register user
    app.post("/register", async (req, res) => {
      const user = req.body;
      if (user.photoURL) {
        user.profileImage = user.photoURL;
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Get logged-in user
    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await userCollection.find({ email: email }).toArray();
      res.send(user);
    });

    // Get chat messages (for initial loading)
    app.get("/messages", async (req, res) => {
      const email = req.query.email;
      const chatId = req.query.chatId;
      const messages = await messageCollection
        .find({ email, chatId })
        .sort({ timestamp: 1 })
        .toArray();
      res.send(messages);
    });

    // Get chat history for sidebar
    app.get("/chat-history", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.status(400).json({ error: "Email parameter is required" });
      }

      try {
        const chats = await messageCollection
          .aggregate([
            { $match: { email } },
            {
              $group: {
                _id: "$chatId",
                timestamp: { $max: "$timestamp" }, // Get latest timestamp
                title: { $first: "$text" }, // Use the first message as chat title
              },
            },
            { $sort: { timestamp: -1 } },
          ])
          .toArray();

        res.json(chats);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Delete chat and all its messages
    app.delete("/delete-chat/:chatId", async (req, res) => {
      try {
        const { chatId } = req.params;
        const { email } = req.body;

        if (!chatId || !email) {
          return res.status(400).json({ error: "Chat ID and email are required" });
        }

        // Delete all messages associated with this chat
        const deleteResult = await messageCollection.deleteMany({
          chatId,
          email,
        });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: "No messages found for this chat" });
        }

        res.status(200).json({ message: "Chat deleted successfully" });
      } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Rename chat title
    app.put("/rename-chat", async (req, res) => {
      try {
        const { chatId, email, newTitle } = req.body;

        if (!chatId || !email || !newTitle) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        // Find the first message of the chat to update its text
        // This works because we're using the first message as the chat title
        const messages = await messageCollection
          .find({ chatId, email })
          .sort({ timestamp: 1 })
          .limit(1)
          .toArray();

        if (messages.length === 0) {
          return res.status(404).json({ error: "Chat not found" });
        }

        // Update the first message text
        const firstMessageId = messages[0]._id;
        const updateResult = await messageCollection.updateOne(
          { _id: firstMessageId },
          { $set: { text: newTitle } }
        );

        if (updateResult.modifiedCount === 0) {
          return res.status(500).json({ error: "Failed to rename chat" });
        }

        res.status(200).json({ message: "Chat renamed successfully" });
      } catch (error) {
        console.error("Error renaming chat:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

  } catch (error) {
    console.log(error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ChatBOT is working");
});

// Use server.listen instead of app.listen
server.listen(port, () => {
  console.log(`ChatBOT backend server with Socket.io is running on port ${port}`);
});