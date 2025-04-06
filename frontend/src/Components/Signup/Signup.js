import React, { useState } from "react";
import "./Signup.css";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { FaGoogle, FaMicrosoft, FaPhone } from "react-icons/fa6";
import { IoLogoApple } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  RadioButtonUnchecked,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useUserAuth } from "../../Services/UserAuthcontext";
import { Snackbar, Alert } from "@mui/material";

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "error",
    position: { vertical: "top", horizontal: "right" },
  });
  const { signUp, googleSignIn } = useUserAuth();
  const navigate = useNavigate();
  const hasMinLength = password.length >= 10;

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity,
      position: { vertical: "top", horizontal: "right" },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setCurrentStep(2);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(value.length >= 10);
  };

  // Google-Signup
  const handleGoogleSignin = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      showNotification("Successfully signed in with Google!", "success");

      // Short delay before navigation to allow the notification to be seen
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      showNotification("Google sign-in failed. Please try again.", "error");
      console.log(error.message);
    }
  };

  // Handle third-party signup methods that are not implemented
  const handleUnsupportedSignup = (provider) => {
    showNotification(`Please Signup with Google only. You cannot Signup with ${provider}.`, "warning");
  };

  const handleEmailPasswordSignup = async (e) => {
    e.preventDefault();

    if (!passwordValid) return;

    try {
      // Create the user in Firebase auth
      const userCredential = await signUp(email, password);

      // Only proceed to MongoDB if Firebase auth was successful
      if (userCredential && userCredential.user) {
        // Then store user data in MongoDB
        const user = {
          email: email,
          uid: userCredential.user.uid, // Store Firebase UID for reference
        };

        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(user),
        });

        const data = await response.json();

        if (data.acknowledged) {
          showNotification(
            "Registration successful! Welcome to ChatBOT!",
            "success"
          );

          // Short delay before navigation to allow the notification to be seen
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          // MongoDB registration failed
          showNotification(
            "Failed to complete registration. Please try again.",
            "error"
          );
        }
      }
    } catch (error) {
      // Format the error message to be more user-friendly
      let errorMessage = "Registration failed. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please login instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      }

      showNotification(errorMessage, "error");
      console.log(error.message);
    }
  };

  return (
    <div className="app">
      <h1 className="logo">ChatBOT</h1>

      <div className="signup-container">
        <div className="signup-form">
          {currentStep === 1 ? (
            <>
              <h1 className="signup-title">Create an account</h1>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Email address"
                  variant="outlined"
                  type="email"
                  fullWidth
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                />
                <button type="submit" className="continue-button">
                  Continue
                </button>
              </form>

              <p className="login-text">
                Already have an account?{" "}
                <a href="/login" className="login-link">
                  Login
                </a>
              </p>
              <div className="divider">
                <span className="divider-text">OR</span>
              </div>

              <button
                className="oauth-button"
                type="button"
                onClick={handleGoogleSignin}
              >
                <FaGoogle className="oauth-logo" />
                <span>Continue with Google</span>
              </button>

              <button
                className="oauth-button"
                type="button"
                onClick={() => handleUnsupportedSignup("Apple")}
              >
                <IoLogoApple className="oauth-logo" />
                <span>Continue with Apple</span>
              </button>

              <button
                className="oauth-button"
                type="button"
                onClick={() => handleUnsupportedSignup("Microsoft")}
              >
                <FaMicrosoft className="oauth-logo" />
                <span>Continue with Microsoft</span>
              </button>

              <button
                className="oauth-button"
                type="button"
                onClick={() => handleUnsupportedSignup("Phone")}
              >
                <FaPhone className="oauth-logo" />
                <span>Continue with Phone</span>
              </button>
            </>
          ) : (
            <>
              <h1 className="signup-title">Create your account</h1>
              <form onSubmit={handleEmailPasswordSignup}>
                <TextField
                  variant="outlined"
                  type="email"
                  fullWidth
                  className="input-field"
                  value={email}
                  disabled
                  sx={{ marginBottom: 1.5 }}
                />

                <TextField
                  label="Password"
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  className="input-field"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!passwordValid && password.length > 0}
                  sx={{ marginBottom: 1 }}
                  autoComplete="off"
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

                {password.length > 0 && (
                  <div className="requirements">
                    <p className="requirements-title">
                      Your password must contain:
                    </p>
                    <div
                      className={`requirement ${
                        hasMinLength ? "valid" : "invalid"
                      }`}
                    >
                      {hasMinLength ? (
                        <CheckCircle
                          style={{ fontSize: 16, marginLeft: "8" }}
                        />
                      ) : (
                        <RadioButtonUnchecked style={{ fontSize: 16 }} />
                      )}
                      <span>At least 10 characters</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="continue-button"
                  disabled={!passwordValid}
                >
                  Continue
                </button>
              </form>

              <p className="login-text">
                <a
                  href="/signup"
                  className="go-back-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentStep(1);
                  }}
                >
                  Go back
                </a>
              </p>
            </>
          )}
        </div>

        <footer className="oai-footer">
          <a href="/terms">Terms of Use</a>
          <span className="separator">|</span>
          <a href="/privacy">Privacy Policy</a>
        </footer>
      </div>

      {/* Notification */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleCloseNotification}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Signup;