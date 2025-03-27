import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState("");
  const navigate = useNavigate();
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!validatePassword(formData.password)) {
      setErrors("Password must be 8+ characters with an uppercase, number, and special character.");
      return;
    }
    setErrors("");
    try {
      const response = await axios.post(`http://localhost:3004/users/signup`, {formData});
      console.log("Signup successful", response.data);
   localStorage.setItem('token', response.data.token);
   navigate("/homepage");   
  } catch (error) {
    console.log(error)
      alert("Email ID already registered!");
  }
    alert("Sign-up successful!");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
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
          {errors && <p className="error">{errors}</p>}
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>

      </div>
    </div>
  );
};

export default SignUp;