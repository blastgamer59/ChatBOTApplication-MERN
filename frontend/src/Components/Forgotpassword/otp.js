import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./otp.css";

const Otp = () => {
  const [newPassword, setNewPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const oobCode = query.get("oobCode"); // Get the oobCode from the URL

  const hasMinLength = newPassword.length >= 10;

  const handlePasswordChange = (e, field) => {
    const value = e.target.value;
    if (field === "new") {
      setNewPassword(value);
      setPasswordValid(value.length >= 10);
    } else if (field === "reenter") {
      setReenterPassword(value);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== reenterPassword) {
      showAlert("error", "Passwords do not match.");
      return;
    }

    if (!oobCode) {
      showAlert("error", "Invalid or expired reset link.");
      return;
    }

    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      showAlert("success", "Password reset successfully!");

      // Redirect to login after success
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Error resetting password:", error.message);
      showAlert("error", "Error resetting password. Please try again.");
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
      <div className="otp-container">
        <div className="otp-form">
          <h1 className="otp-title">Reset your password</h1>
          <p className="otp-description">
            Enter a new password below to change your password.
          </p>
          <form onSubmit={handleResetPassword}>
            <TextField
              label="New password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              fullWidth
              className="otppassword-input"
              value={newPassword}
              onChange={(e) => handlePasswordChange(e, "new")}
              error={!passwordValid && newPassword.length > 0}
              sx={{
                marginBottom: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "gray" },
                  "&:hover fieldset": { borderColor: "rgb(16, 163, 127)" },
                  "&.Mui-focused fieldset": { borderColor: "rgb(16, 163, 127)" },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Re-enter password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              fullWidth
              className="otppassword-input"
              value={reenterPassword}
              onChange={(e) => handlePasswordChange(e, "reenter")}
              error={
                reenterPassword.length > 0 && reenterPassword !== newPassword
              }
              sx={{
                marginBottom: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "gray" },
                  "&:hover fieldset": { borderColor: "rgb(16, 163, 127)" },
                  "&.Mui-focused fieldset": { borderColor: "rgb(16, 163, 127)" },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {newPassword.length > 0 && (
              <div className="otp-requirements">
                <p className="otp-requirements-title">
                  Your password must contain:
                </p>
                <div
                  className={`otp-requirement ${hasMinLength ? "valid" : "invalid"}`}
                >
                  {hasMinLength ? (
                    <CheckCircle style={{ fontSize: 16, marginLeft: "8" }} />
                  ) : (
                    <RadioButtonUnchecked style={{ fontSize: 16 }} />
                  )}
                  <span>At least 10 characters</span>
                </div>
              </div>
            )}
            <button type="submit" className="otp-button">
              Reset password
            </button>
          </form>

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
        <footer className="otpoai-footer">
          <a href="/terms">Terms of Use</a>
          <span className="otpseparator">|</span>
          <a href="/privacy">Privacy Policy</a>
        </footer>
      </div>
    </div>
  );
};

export default Otp;
