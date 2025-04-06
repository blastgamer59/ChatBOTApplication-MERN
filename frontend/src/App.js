import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Components/Signup/Signup";
import Login from "./Components/Login/Login";
import Forgotpassword from "./Components/Forgotpassword/Forgotpassword";
import OTP from "./Components/Forgotpassword/otp";
import Checkemail from "./Components/Forgotpassword/Checkemail";
import Home from "./Components/Home";
import Chat from "./Components/Chat/Chat";
import { UserAuthContextProvider } from "./Services/UserAuthcontext";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <UserAuthContextProvider>
          <Routes>
            <Route path="/" element={<Home />}>
              <Route index element={<Chat />} />
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<Forgotpassword />} />
            <Route path="/otp" element={<OTP />} />
            <Route path="/checkemail" element={<Checkemail />} />
          </Routes>
        </UserAuthContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
