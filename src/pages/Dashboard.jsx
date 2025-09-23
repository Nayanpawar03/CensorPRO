import React, { useState } from 'react';
import { Upload, CheckCircle, Clock, AlertTriangle, XCircle, FileText, Video, ImageIcon, Settings, User, Menu } from 'lucide-react';
import censorProLogo from '../assets/CensorProLogo.png'

// Main Dashboard component containing all sub-components and logic
const Dashboard = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [moderationResults, setModerationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastModerationResult, setLastModerationResult] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    underReview: 0,
    rejected: 0
  });

  const [recentActivity, setRecentActivity] = useState([
    // { id: 1, filename: "summer_vacation.jpg", status: "Approved", date: "2024-01-15", icon: ImageIcon },
  ]);

  const getModerationSummary = (results) => {
    if (!results) return null;

    if (results.error) {
      return `Error: ${results.error}`;
    }

    const inappropriateCategories = [];
    const thresholds = {
      weapon: 0.5,
      alcohol: 0.5,
      recreational_drug: 0.5,
      medical: 0.5,
      tobacco: 0.5,
      violence: 0.5,
      offensive: 0.5,
      nudity: 0.5, // Using partial or raw for nudity
    };

    for (const category in thresholds) {
      if (results[category]) {
        if (category === 'nudity') {
          if (results.nudity.raw > thresholds.nudity || results.nudity.partial > thresholds.nudity) {
            inappropriateCategories.push(`Nudity (raw: ${results.nudity.raw.toFixed(2)}, partial: ${results.nudity.partial.toFixed(2)})`);
          }
        } else if (results[category].hasOwnProperty('prob') && results[category].prob > thresholds[category]) {
          inappropriateCategories.push(`${category.charAt(0).toUpperCase() + category.slice(1)} (${results[category].prob.toFixed(2)})`);
        } else if (results[category].hasOwnProperty('sexual_activity') && results[category].sexual_activity > thresholds[category]) {
          inappropriateCategories.push(`${category.charAt(0).toUpperCase() + category.slice(1)} (sexual_activity: ${results[category].sexual_activity.toFixed(2)})`);
        }
      }
    }

    if (inappropriateCategories.length > 0) {
      return `⚠️ Inappropriate content detected! Reasons: ${inappropriateCategories.join(', ')}`;
    } else {
      return '✅ Content is safe.';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const newActivity = {
        id: recentActivity.length + 1,
        filename: file.name,
        status: "Pending",
        date: new Date().toISOString().slice(0, 10),
        icon: ImageIcon, // Assuming all uploads are images for now
      };
      setRecentActivity((prev) => [newActivity, ...prev]);
      setStats((prev) => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }));
    }
  };

  const moderateFile = (fileId, newStatus) => {
    setRecentActivity((prevActivity) =>
      prevActivity.map((activity) =>
        activity.id === fileId ? { ...activity, status: newStatus } : activity
      )
    );

    setStats((prevStats) => {
      const updatedStats = { ...prevStats };
      // Decrement previous status count
      const oldActivity = recentActivity.find(act => act.id === fileId);
      if (oldActivity) {
        if (oldActivity.status === "Pending") updatedStats.pending--;
        else if (oldActivity.status === "Approved") updatedStats.approved--;
        else if (oldActivity.status === "Rejected") updatedStats.rejected--;
        else if (oldActivity.status === "Under Review") updatedStats.underReview--;
      }

      // Increment new status count
      if (newStatus === "Approved") updatedStats.approved++;
      else if (newStatus === "Rejected") updatedStats.rejected++;
      else if (newStatus === "Under Review") updatedStats.underReview++;
      else if (newStatus === "Pending") updatedStats.pending++; // Should not happen in moderation, but for completeness

      return updatedStats;
    });
  };

  const handleImageModeration = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setModerationResults(null);
    setLastModerationResult(null);

    const formData = new FormData();
    formData.append('media', selectedImage);
    formData.append('models', 'weapon,alcohol,recreational_drug,medical,tobacco,violence,offensive,nudity');
    formData.append('api_user', import.meta.env.VITE_SIGHTENGINE_API_USER);
    formData.append('api_secret', import.meta.env.VITE_SIGHTENGINE_API_SECRET);

    try {
      const response = await fetch('https://api.sightengine.com/1.0/check.json', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.nudity && data.nudity.safe) {
        delete data.nudity.safe;
      }
      setModerationResults(data);

      // Simulate moderation outcome based on Sightengine results
      const summary = getModerationSummary(data);
      let newStatus = "Under Review"; // Default to under review
      if (summary === '✅ Content is safe.') {
        newStatus = "Approved";
        setLastModerationResult("Content is safe");
      } else if (summary.startsWith('⚠️ Inappropriate content detected!')) {
        newStatus = "Rejected";
        setLastModerationResult("Content is unsafe");
      } else {
        setLastModerationResult("Awaiting review");
      }

      // Find the activity item that corresponds to the selected image
      const activityToUpdate = recentActivity.find(activity => activity.filename === selectedImage.name && activity.status === "Pending");
      if (activityToUpdate) {
        moderateFile(activityToUpdate.id, newStatus);
      }

    } catch (error) {
      console.error('Error moderating image:', error);
      setModerationResults({ error: 'Failed to moderate image.' });
      setLastModerationResult("Error during moderation");
    } finally {
      setLoading(false);
    }
  };

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
            value={stats.total}
            change="All time uploads"
            icon={FileText}
            iconColor="text-blue-700"
            statusColor="text-blue-700"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            change="Ready to publish"
            icon={CheckCircle}
            iconColor="text-green-500"
            statusColor="text-green-500"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            change="Being processed"
            icon={Clock}
            iconColor="text-yellow-500"
            statusColor="text-yellow-500"
          />
          <StatCard
            title="Under Review"
            value={stats.underReview}
            change="Awaiting admin review"
            icon={AlertTriangle}
            iconColor="text-orange-500"
            statusColor="text-orange-500"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Select Image
                </label>
                {selectedImage && <p className="mt-2 text-sm">Selected: {selectedImage.name}</p>}
                <button
                  onClick={handleImageModeration}
                  disabled={!selectedImage || loading}
                  className="bg-green-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Moderating...' : 'Moderate Image'}
                </button>
                <p className="text-xs mt-4">Supports images</p>
              </div>
            </div>

            {lastModerationResult && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <h2 className="text-xl font-semibold mb-4">Last Moderation Result</h2>
                <p className="text-lg font-medium text-blue-900">
                  {lastModerationResult}
                </p>
              </div>
            )}

            {moderationResults && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <h2 className="text-xl font-semibold mb-4">Detailed Moderation Results</h2>
                <p className="text-lg font-medium text-blue-900">
                  {getModerationSummary(moderationResults)}
                </p>
              </div>
            )}
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
                      <div className="font-medium text-blue-900">{activity.filename}</div>
                      <div className="text-sm text-blue-700">{activity.date}</div>
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                      activity.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      activity.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                      activity.status === 'Under Review' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
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
