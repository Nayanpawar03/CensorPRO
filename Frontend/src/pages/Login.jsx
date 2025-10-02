import React from 'react';
import { Link } from 'react-router-dom';


const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col">
      {/* Navbar */}
<nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center rounded-b-lg">
  <div className="text-blue-600 font-bold text-xl">CensorPro</div>
  <ul className="flex gap-6 items-center text-sm text-blue-700 font-medium">
    <li>
      <Link to="/" className="hover:underline">
        Home
      </Link>
    </li>


    <li>
      <Link to="/contact" className="hover:underline">
        Contact
      </Link>
    </li>
    <li>
      <Link
        to="/login"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Sign In
      </Link>
    </li>
  </ul>
</nav>


      {/* Login Form */}
      <div className="flex flex-1 justify-center items-center">
        <div className="bg-transparent w-full max-w-md text-center p-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Login</h1>
          <p className="text-sm text-blue-700 mb-6">
            Sign in to manage and moderate your content safely.
          </p>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-3 border border-white-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-3 border border-white-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              Login
            </button>
          </form>

          <p className="text-sm mt-4 text-blue-800">
            Don’t have an account?{' '}
            <Link to="/register" className="underline cursor-pointer text-blue-900 hover:text-blue-700">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
