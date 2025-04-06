import React, { useEffect, useState } from "react";
import "./Checkemail.css";
import { SiGmail } from "react-icons/si";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Checkemail = () => {
  const [userEmail, setUserEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
   // console.log("Stored email:", storedEmail); 
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, [userEmail]); 

  const handleResendEmail = async () => {
    if (!userEmail) {
      showAlert("error", "Email address not found");
      return;
    }

    // Check for daily reset limit
    const today = new Date().toLocaleDateString();
    const resetCount = parseInt(localStorage.getItem(`passwordResetCount_${today}`) || "0");
    
    if (resetCount >= 5) {
      showAlert("error", "You can only request password reset 5 times per day.");
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, userEmail, { url: "http://localhost:3000/login" });

      // Update reset count
      localStorage.setItem(`passwordResetCount_${today}`, (resetCount + 1).toString());

      showAlert("success", "Password reset email resent successfully");
    } catch (error) {
      console.error(error.message);

      if (error.code === "auth/user-not-found") {
        showAlert("error", "Email address is not registered");
      } else {
        showAlert("error", "Error sending password reset email");
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
    <div className="container">
      <div className="icon-container">
        <SiGmail className="mail-icon" />
      </div>

      <h2 className="checkmail-h2">Check Your Email</h2>
      <p className="mail-text">
        Please check the email address {userEmail} for instructions to reset your password.
      </p>
      <button className="resend-btn" onClick={handleResendEmail}>
        Resend email
      </button>
      <footer className="checkemailoai-footer">
        <a href="/terms">Terms of Use</a>
        <span className="checkemailseparator">|</span>
        <a href="/privacy">Privacy Policy</a>
      </footer>

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

export default Checkemail;
