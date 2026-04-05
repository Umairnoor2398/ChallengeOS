import React, { useState } from "react";
import ApiService from "../../services/api_service";
import { Navigate } from "react-router";

const Login = () => {
  // State variables for form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      ApiService.username = username;
      ApiService.password = password;
      // Call the login API
      const loginResponse = await ApiService.login();

      console.log("Login successful", loginResponse);

      setRedirect(true);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (redirect) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h2 className="text-center text-primary mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              placeholder="Enter your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error Message */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Login Button */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
