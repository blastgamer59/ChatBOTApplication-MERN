import React, { useState } from "react";
import "./Login.css";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { FaGoogle, FaMicrosoft, FaPhone } from "react-icons/fa6";
import { IoLogoApple } from "react-icons/io5";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  RadioButtonUnchecked,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../Services/UserAuthcontext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Login = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
    position: { vertical: "top", horizontal: "right" },
  });
  const { googleSignIn, logIn } = useUserAuth();
  const navigate = useNavigate();
  const hasMinLength = password.length >= 10;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setCurrentStep(2);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(value.length >= 10);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!passwordValid) {
      setNotification({
        open: true,
        message: "Password must be at least 10 characters",
        severity: "error",
        position: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      await logIn(email, password);
      setNotification({
        open: true,
        message: "Login successful!",
        severity: "success",
        position: { vertical: "top", horizontal: "right" },
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      if (
        error.code === "auth/wrong-password" ||
        error.message.includes("password")
      ) {
        setNotification({
          open: true,
          message: "Invalid password. Please try again.",
          severity: "error",
          position: { vertical: "top", horizontal: "right" },
        });
      } else if (
        error.code === "auth/user-not-found" ||
        error.message.includes("user") ||
        error.message.includes("no user record")
      ) {
        setNotification({
          open: true,
          message: "User not registered. Please sign up first.",
          severity: "error",
          position: { vertical: "top", horizontal: "right" },
        });
      } else {
        setNotification({
          open: true,
          message: error.message || "Login failed. Please try again.",
          severity: "error",
          position: { vertical: "top", horizontal: "right" },
        });
      }
      console.log(error.message);
    }
  };

  // Google-login
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      setNotification({
        open: true,
        message: "Google sign-in successful!",
        severity: "success",
        position: { vertical: "top", horizontal: "right" },
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        setNotification({
          open: true,
          message: "Sign-in canceled. Please try again.",
          severity: "warning",
          position: { vertical: "top", horizontal: "right" },
        });
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setNotification({
          open: true,
          message:
            "An account already exists with the same email but different sign-in method.",
          severity: "error",
          position: { vertical: "top", horizontal: "right" },
        });
      } else {
        setNotification({
          open: true,
          message: error.message || "Google sign-in failed",
          severity: "error",
          position: { vertical: "top", horizontal: "right" },
        });
      }
      console.log(error.message);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Handle third-party login methods that are not implemented
  const handleUnsupportedLogin = (provider) => {
    setNotification({
      open: true,
      message: `Please login with Google only. You cannot login with ${provider}.`,
      severity: "warning",
      position: { vertical: "top", horizontal: "right" },
    });
  };

  return (
    <div className="app">
      <h1 className="logo">ChatBOT</h1>

      <div className="signup-container">
        <div className="signup-form">
          {currentStep === 1 ? (
            <>
              <h1 className="signup-title">Welcome back</h1>
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
                Don't have an account?{" "}
                <a href="/signup" className="login-link">
                  Signup
                </a>
              </p>
              <div className="divider">
                <span className="divider-text">OR</span>
              </div>

              <button
                className="oauth-button"
                type="button"
                onClick={handleGoogleSignIn}
              >
                <FaGoogle className="oauth-logo" />
                <span>Continue with Google</span>
              </button>

              <button
                className="oauth-button"
                type="button"
                onClick={() => handleUnsupportedLogin("Apple")}
              >
                <IoLogoApple className="oauth-logo" />
                <span>Continue with Apple</span>
              </button>

              <button
                className="oauth-button"
                type="button"
                onClick={() => handleUnsupportedLogin("Microsoft")}
              >
                <FaMicrosoft className="oauth-logo" />
                <span>Continue with Microsoft</span>
              </button>

              <button
                className="oauth-button"
                type="button"
                onClick={() => handleUnsupportedLogin("Phone")}
              >
                <FaPhone className="oauth-logo" />
                <span>Continue with Phone</span>
              </button>
            </>
          ) : (
            <>
              <h1 className="signup-title">Enter your password</h1>
              <form onSubmit={handleLogin}>
                <TextField
                  variant="outlined"
                  type="email"
                  fullWidth
                  className="input-field"
                  value={email}
                  disabled
                  sx={{ marginBottom: 1.5 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                      </InputAdornment>
                    ),
                  }}
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
                        <CheckCircle style={{ fontSize: 16 }} />
                      ) : (
                        <RadioButtonUnchecked style={{ fontSize: 16 }} />
                      )}
                      <span>At least 10 characters</span>
                    </div>
                  </div>
                )}

                <p className="link-paragraph">
                  <a href="/forgotpassword" className="link-element">
                    Forgot password?
                  </a>
                </p>

                <button
                  type="submit"
                  className="continue-button"
                  disabled={!passwordValid}
                >
                  Continue
                </button>
              </form>

              <p className="login-text">
                Don't have an account?{" "}
                <a href="/signup" className="login-link">
                  Signup
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
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={notification.position}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
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

export default Login;