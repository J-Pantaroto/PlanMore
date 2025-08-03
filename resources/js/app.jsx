import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./Pages/Welcome";
import Dashboard from "./Pages/Dashboard";
import Register from "./Pages/Auth/Register";
import Profile from "./Pages/Profile";
import '../css/app.css';
import './bootstrap';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
