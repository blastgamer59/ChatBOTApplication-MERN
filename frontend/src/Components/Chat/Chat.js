import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Modal,
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { Mic as MicIcon } from "@mui/icons-material";
import Sidebar from "../Sidebar/Sidebar";
import "./Chat.css";
import useLoggedinuser from "../../Services/useloggedinuser";
import { useUserAuth } from "../../Services/UserAuthcontext";
import io from "socket.io-client";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  bgcolor: "white",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  outline: "none",
};

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(Date.now().toString());
  const [showModal, setShowModal] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSidebarIcon, setShowSidebarIcon] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [isBotTyping, setIsBotTyping] = useState(false);
  const loadingRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user, logOut } = useUserAuth();
  const [loggedinuser] = useLoggedinuser();
  const navigate = useNavigate();

  let recognition = null;

  // Socket.io connection
  useEffect(() => {
    // Connect to socket server
    socketRef.current = io("http://localhost:5000");

    // Socket event listeners
    socketRef.current.on("connect", () => {
      console.log("Connected to backend socket server");
    });

    socketRef.current.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socketRef.current.on("bot_typing", (status) => {
      setIsBotTyping(status);
    });

    socketRef.current.on("error", (errorMessage) => {
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join chat room whenever chatId changes
  useEffect(() => {
    if (socketRef.current && chatId && user) {
      socketRef.current.emit("join_chat", chatId);
    }
  }, [chatId, user]);

  // Load existing messages when chatId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (user && chatId) {
        try {
          const response = await fetch(
            `http://localhost:5000/messages?email=${user.email}&chatId=${chatId}`
          );
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
    };

    loadMessages();
  }, [chatId, user]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isBotTyping]);

  useEffect(() => {
    if (user) {
      setShowSidebarIcon(true);
      setIsSidebarOpen(true);
      setShowModal(false);
    } else {
      setShowSidebarIcon(false);
      setIsSidebarOpen(false);
      setShowModal(true);
    }
  }, [user]);

  useEffect(() => {
    setAvatarError(false);
  }, [user, loggedinuser]);

  useEffect(() => {
    // Check if SpeechRecognition API is available
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setSpeechAvailable(true);
    }
  }, []);

  // Scroll to loading animation when it appears
  useEffect(() => {
    if (isBotTyping && loadingRef.current) {
      loadingRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isBotTyping]);

  const getProfileImageUrl = () => {
    if (user?.photoURL) {
      return user.photoURL; // Google profile image
    } else if (loggedinuser?.[0]?.profileImage) {
      return loggedinuser[0].profileImage; // Fallback to stored profile image
    }
    return ""; // Default case: no image
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");

  const startVoiceRecognition = () => {
    if (!speechAvailable) {
      setSnackbar({
        open: true,
        message: "Speech recognition is not supported in this browser.",
        severity: "error",
      });
      return;
    }

    if (!user) return setShowModal(true);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setSnackbar({
        open: true,
        message: "Voice recognition error. Try again.",
        severity: "error",
      });
    };

    recognition.start();
  };

  const handleSendMessage = () => {
    if (!user) return setShowModal(true);
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      sender: "user",
      chatId,
      email: user.email,
    };

    // Send message through socket
    socketRef.current.emit("send_message", userMessage);
    setMessage("");
  };

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await logOut();
    setShowSidebarIcon(false);
    setIsSidebarOpen(false);
    handleMenuClose();
    setMessages([]);
    setShowModal(true);
  };

  const handleAvatarError = () => setAvatarError(true);

  return (
    <div className="chat-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        showSidebarIcon={showSidebarIcon}
        setChatId={setChatId}
        setMessages={setMessages}
        user={user}
      />

      <div
        className={`chat-container ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <div className="chat-header">
          <div className="chat-logo">ChatBOT</div>
          <div className="auth-buttons">
            {!user ? (
              <>
                <button className="btn btn-login" onClick={handleLogin}>
                  Log in
                </button>
                <button className="btn btn-signup" onClick={handleSignup}>
                  Sign up
                </button>
              </>
            ) : (
              <Avatar
                onClick={handleAvatarClick}
                src={!avatarError ? getProfileImageUrl() : ""}
                alt={user?.displayName || user?.email || "User"}
                onError={handleAvatarError}
                sx={{
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                }}
              />
            )}
          </div>
        </div>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              minWidth: "200px",
              padding: "8px 0",
              marginTop: "10px",
              marginRight: "20px",
            },
          }}
        >
          <MenuItem
            sx={{
              fontSize: "14px",
              color: "#333",
              padding: "10px 16px",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            {user?.email}
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              fontSize: "14px",
              color: "red",
              padding: "10px 16px",
              marginTop: "5px",
              "&:hover": {
                backgroundColor: "#ffe5e5",
              },
            }}
          >
            Log out
          </MenuItem>
        </Menu>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              {msg.text}
              {msg.file && (
                <div className="uploaded-file">
                  {msg.file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(msg.file)}
                      alt="Uploaded"
                      style={{ maxWidth: "200px" }}
                    />
                  ) : (
                    <div>{msg.file.name}</div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isBotTyping && (
            <div ref={loadingRef} className="loading-dots-container">
              <span className="loading-dots">...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MicIcon
                    onClick={startVoiceRecognition}
                    sx={{
                      cursor: speechAvailable ? "pointer" : "not-allowed",
                      color: isRecording ? "red" : "black",
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <Button
            sx={{
              width: "20%",
              bgcolor: user ? "black" : "grey.500",
              color: "white",
            }}
            variant="contained"
            onClick={handleSendMessage}
            disabled={!user}
          >
            Send
          </Button>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box sx={modalStyle}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            Welcome Back
          </Typography>
          <Typography sx={{ mt: 1, color: "gray", textAlign: "center" }}>
            Log in or sign up to get smarter responses, upload files, and more.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: "black",
              color: "white",
              py: 1.5,
              borderRadius: "9999px",
            }}
            onClick={handleLogin}
          >
            Log in
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: "white",
              color: "black",
              py: 1.5,
              borderColor: "#e5e5e5",
              borderRadius: "9999px",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={handleSignup}
          >
            Sign up
          </Button>
          <Typography
            sx={{
              mt: 2,
              textAlign: "center",
              cursor: "pointer",
              color: "rgb(93, 93, 93)",
            }}
            onClick={() => setShowModal(false)}
          >
            Stay logged out
          </Typography>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Chat;