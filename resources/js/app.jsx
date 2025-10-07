import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import { ensureCsrf } from './bootstrap';
import Welcome from "./Pages/Welcome";
import Dashboard from "./Pages/Dashboard";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import VerifyEmail from "./Pages/Auth/VerifyEmail";
import EditProfile from "./Pages/Profile/EditProfile";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import TransactionsIndex from "./Pages/Transactions/Index";
import TransactionsGroups from "./Pages/Transactions/Groups";
import TransactionsAutomation from "./Pages/Transactions/Automation";
import VerifiedSuccess from "./Pages/Auth/EmailVerifiedSucces";
import '../css/app.css';
import './bootstrap';


function App() {
    useEffect(() => {
        ensureCsrf();
    }, []);

    return (
            <Router>
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route exact path="/profile/edit" element={<EditProfile />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/transactions" element={<TransactionsIndex />} />
                    <Route path="/transactions/groups" element={<TransactionsGroups />} />
                    <Route path="/transactions/automation" element={<TransactionsAutomation />} />
                    <Route path="/email/verified-success" element={<VerifiedSuccess />} />
                </Routes>
            </Router>
    );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
