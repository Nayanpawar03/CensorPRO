import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const { firstName, lastName, email, password, confirmPassword, mobile, address } = formData;

    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!firstName || !nameRegex.test(firstName)) {
      alert("First Name must not be empty and contain only alphabets.");
      return false;
    }

    if (!lastName) {
      alert("Last Name cannot be empty.");
      return false;
    }

    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address (e.g., name@domain.com).");
      return false;
    }

    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    if (!phoneRegex.test(mobile)) {
      alert("Mobile Number must be exactly 10 digits.");
      return false;
    }

    if (!address) {
      alert("Address cannot be empty.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Proceed with submission (e.g., API call)
      alert("Registration successful!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center rounded-b-lg">
        <div className="text-blue-600 font-bold text-xl">CensorPro</div>
        <ul className="flex gap-6 items-center text-sm text-blue-700 font-medium">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          <li>
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Sign In
            </Link>
          </li>
        </ul>
      </nav>

      {/* Register Form */}
      <div className="flex flex-1 justify-center items-center">
        <div className="bg-transparent w-full max-w-md text-center p-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Register</h1>
          <p className="text-sm text-blue-700 mb-6">
            Create an account to start moderating your content effectively.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              Register
            </button>
          </form>

          <p className="text-sm mt-4 text-blue-800">
            Already have an account?{' '}
            <Link to="/login" className="underline text-blue-900 hover:text-blue-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
