import React from "react";
import "./styles/globals.css";
import "./styles/calendar.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/404";
// import { AuthProvider } from "./contexts/AuthContext";s

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/income" element={<Income />} />
        <Route path="/schedule" element={<Tasks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
