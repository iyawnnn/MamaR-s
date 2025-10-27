import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (error) {
      setErr(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      {/* === LEFT SIDE: LOGIN CARD === */}
      <div className="login-card">
        <h2 className="login-title">Welcome back</h2>
        <p className="login-paragraph">Please enter your details</p>
        <form className="login-form" onSubmit={onSubmit}>
          {/* Email Field */}
          <label>Email Address</label>
          <div className="input-wrapper">
            <i className="bi bi-envelope input-icon"></i>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <label>Password</label>
          <div className="input-wrapper">
            <i className="bi bi-lock input-icon"></i>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              className={`bi ${
                showPassword ? "bi-eye-slash" : "bi-eye"
              } toggle-icon`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          {err && <div className="error-text">{err}</div>}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>

      {/* === RIGHT SIDE: IMAGE === */}
      <div className="login-image"></div>
    </div>
  );
}
