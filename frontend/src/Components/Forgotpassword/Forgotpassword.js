import React, { useState } from "react";
import "./Forgotpassword.css";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from "axios";

const Forgotpassword = () => {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showAlert("error", "Please enter your email address.");
      return;
    }

    try {
   
      localStorage.setItem("userEmail", email);

      // Check if email is registered via backend API
      const response = await axios.post("http://localhost:5000/check-email", { email });

      if (!response.data.registered) {
        showAlert("error", "Entered email ID is not registered. Please register.");
        return;
      }

      // Send Password Reset Email using Firebase
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email, { url: "http://localhost:3000/login" });

      showAlert("success", "Password reset link has been sent to your email.");

      // Redirect to CheckEmail page after 1.5 seconds
      setTimeout(() => {
        navigate("/checkemail");
      }, 1500);

    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        showAlert("error", error.response.data.error || "An error occurred.");
      } else if (error.code === "auth/invalid-email") {
        showAlert("error", "Invalid email format. Please enter a valid email.");
      } else {
        showAlert("error", "Error sending password reset email: " + error.message);
      }
    }
  };

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <div className="app">
      <h1 className="logo">ChatBOT</h1>
      <div className="forgotpassword-container">
        <div className="forgotpassword-form">
          <h1 className="forgotpassword-title">Reset your password</h1>
          <p className="description">
            Enter your Email address and we will send you instructions to reset your password.
          </p>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email address"
              variant="outlined"
              type="email"
              fullWidth
              className="forgotpasswordinput-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
            <button type="submit" className="forgotpasswordcontinue-button">
              Continue
            </button>
          </form>
          <a href="/login" className="back-link">
            Go back
          </a>
        </div>
        <footer className="forgotpasswordoai-footer">
          <a href="/terms">Terms of Use</a>
          <span className="forgotpasswordseparator">|</span>
          <a href="/privacy">Privacy Policy</a>
        </footer>
      </div>

      {/* Snackbar Notification */}
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleClose} 
          severity={alertType} 
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Forgotpassword;
