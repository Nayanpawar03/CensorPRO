import React from 'react';
import { FaShieldAlt, FaImage, FaCheckCircle } from 'react-icons/fa';
import censorProLogo from '../assets/CensorProLogo.png'

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-blue-200 text-blue-900">
      
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center rounded-b-xl">
        <div className="flex items-center gap-2">
          <img src={censorProLogo} alt="CensorPro Logo" className="w-10 h-10" />
          <span className="font-bold text-xl text-blue-600">CensorPro</span>
        </div>
        <nav className="hidden md:flex gap-6 text-blue-700 font-medium">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Features</a>
          <a href="#" className="hover:underline">Docs</a>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Empower Your Platform with <span className="text-blue-700">Safe Content</span>
        </h1>
        <p className="max-w-xl text-lg mb-8">
          CensorPro helps you detect abusive, offensive, or sensitive content in uploaded images instantly. Built for creators, businesses, and communities to stay secure and respectful.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700 transition-all cursor-pointer">
          Try It Now
        </button>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <FaImage className="text-3xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Image Upload</h3>
            <p>Upload any image containing text, and we’ll analyze it for harmful or inappropriate content.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <FaShieldAlt className="text-3xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Content Filtering</h3>
            <p>AI-powered scanning ensures quick and reliable detection of sensitive or abusive content.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <FaCheckCircle className="text-3xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Safe Results</h3>
            <p>Get clear results and suggestions to improve your content safety and stay compliant.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 mt-16 rounded-t-xl text-center text-sm text-blue-700">
        <p>&copy; {new Date().getFullYear()} CensorPro-SEWDL. All rights reserved.</p>
        <div className="mt-2">
          <a href="#" className="mx-2 hover:underline">Privacy</a>
          <a href="#" className="mx-2 hover:underline">Terms</a>
          <a href="#" className="mx-2 hover:underline">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;

