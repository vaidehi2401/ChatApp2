import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import axios from 'axios';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
const navigate = useNavigate();
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3004/users/login`, {credentials});
      console.log("Login successful", response.data);
   localStorage.setItem('token', response.data.token);   
   alert("Login successful!");
   navigate('/homepage')
  } catch (error) {
    console.log(error)
   const status = error.response.status;
    const message = error.response.data.error; 
    if (status === 400) {
        alert("⚠️ All fields are required!");
    } else if (status === 404) {
        alert("❌ User not found! Please register first.");
    } else if (status === 401) {
        alert("🔑 Invalid password! Please try again.");
    } else {
       console.log(error);
    }
}
   
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit">Log In</button>
        </form>
        <p>
          Don't have an account? <Link to="/">Sign Up</Link>
        </p>
       
      </div>
    </div>
  );
};

export default Login;