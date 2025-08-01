import React from 'react';
import { Upload, CheckCircle, Clock, AlertTriangle, XCircle, FileText, Video, ImageIcon, Settings, User, Menu } from 'lucide-react';
import censorProLogo from '../assets/CensorProLogo.png'

// Main Dashboard component containing all sub-components and logic
const Dashboard = () => {
  // Header component for the top navigation bar, defined inside Dashboard
  const Header = () => (
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
      <a
        href="/login"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
      >
        Sign In
      </a>
      <button className="md:hidden">
        <Menu className="h-6 w-6 text-blue-700" />
      </button>
    </header>
  );

  // A reusable card component for the statistics section, defined inside Dashboard
  const StatCard = ({ title, value, change, icon: Icon, iconColor, statusColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex-1 min-w-[150px] md:min-w-[180px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-blue-600">{title}</h3>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-blue-900 mb-1">{value}</div>
          <span className={`text-sm font-medium ${statusColor}`}>{change}</span>
        </div>
      </div>
    </div>
  );

  // Mock data for the recent activity list
  const recentActivity = [
    { id: 1, name: 'summer_vacation.jpg', date: '1/15/2024', status: 'Approved', icon: ImageIcon },
    { id: 2, name: 'product_review.txt', date: '1/15/2024', status: 'Pending', icon: FileText },
    { id: 3, name: 'tutorial_video.mp4', date: '1/15/2024', status: 'Under Review', icon: Video },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-blue-200 text-blue-900 font-sans">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Welcome back, <span className="text-blue-600">Sheshank</span></h1>
          <p className="text-blue-900 mt-1">Upload and manage your content with AI-powered moderation</p>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Total Content"
            value="128"
            change="All time uploads"
            icon={FileText}
            iconColor="text-blue-700"
            statusColor="text-blue-700"
          />
          <StatCard
            title="Approved"
            value="95"
            change="Ready to publish"
            icon={CheckCircle}
            iconColor="text-green-500"
            statusColor="text-green-500"
          />
          <StatCard
            title="Pending"
            value="12"
            change="Being processed"
            icon={Clock}
            iconColor="text-yellow-500"
            statusColor="text-yellow-500"
          />
          <StatCard
            title="Under Review"
            value="15"
            change="Awaiting admin review"
            icon={AlertTriangle}
            iconColor="text-orange-500"
            statusColor="text-orange-500"
          />
          <StatCard
            title="Rejected"
            value="6"
            change="Did not pass review"
            icon={XCircle}
            iconColor="text-red-500"
            statusColor="text-red-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Content Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <h2 className="text-xl font-semibold mb-6">Upload New Content</h2>
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-16 text-center text-blue-700">
                <Upload className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <p className="text-lg font-medium">Drop files here to moderate</p>
                <p className="text-sm mt-1 mb-4">Or click to select files from your computer</p>
                <button className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors">
                  Select Files
                </button>
                <p className="text-xs mt-4">Supports images, videos, documents, and text files</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <activity.icon className="h-6 w-6 text-blue-400 mt-1" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-900">{activity.name}</div>
                      <div className="text-sm text-blue-700">{activity.date}</div>
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                      activity.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      activity.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                ))}
              </div>
              <a href="#" className="mt-6 w-full block text-center text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors">
                View all activity history →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
