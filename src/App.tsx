import React from "react";
import "../src/styles/globals.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
// import { AuthProvider } from "./contexts/AuthContext";s

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        {/* <Route path="/reset-password/:token" element={<ResetPassword />} /> */}
        {/* <Route path="/profile" element={<Profile />} /> */}
        {/* <Route path="/settings" element={<Settings />} /> */}
        {/* <Route path="/transactions" element={<Transactions />} /> */}
        {/* <Route path="/reports" element={<Reports />} /> */}
        {/* <Route path="/budget" element={<Budget />} /> */}
        {/* <Route path="/goals" element={<Goals />} /> */}
        {/* <Route path="/notifications" element={<Notifications />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
