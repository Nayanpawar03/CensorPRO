import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle, Clock, AlertTriangle, XCircle, FileText, Video, ImageIcon, Settings, User, Menu } from 'lucide-react';
import censorProLogo from '../assets/CensorProLogo.png'

// Main Dashboard component containing all sub-components and logic
const Dashboard = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [moderationResults, setModerationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastModerationResult, setLastModerationResult] = useState(null);
  const [moderationType, setModerationType] = useState('image'); // 'image' or 'text'
  const [textToModerate, setTextToModerate] = useState('');
  const [aiModerationResult, setAiModerationResult] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [myContent, setMyContent] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    underReview: 0,
    rejected: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  const API_BASE_URL = useMemo(() => (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  ), []);

  const [userName, setUserName] = useState('');

  const getAuthToken = () => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  };

  const fetchMyContent = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/content/my-content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch content');
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data?.items || []);
      setMyContent(items);
      // recompute stats from backend data
      const counts = items.reduce((acc, item) => {
        const status = String(item.status || '').toLowerCase();
        const decision = String(item.decision || '').toLowerCase();
        acc.total += 1;
        if (status === 'pending' || status === 'in progress') acc.pending += 1;
        if (status === 'under review' || status === 'under_review') acc.underReview += 1;
        if (decision === 'approved') acc.approved += 1;
        if (decision === 'rejected') acc.rejected += 1;
        return acc;
      }, { total: 0, approved: 0, pending: 0, underReview: 0, rejected: 0 });
      setStats(counts);
    } catch (err) {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchMyContent();
    const intervalId = setInterval(fetchMyContent, 10000);
    // derive user name from JWT if available
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payloadBase64 = token.split('.')[1] || '';
        const payloadStr = atob(payloadBase64);
        const payload = JSON.parse(payloadStr || '{}');
        const derivedName = payload?.name || payload?.email || '';
        if (derivedName) setUserName(derivedName);
      }
    } catch {}
    return () => clearInterval(intervalId);
  }, []);

  
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
      gore: 0.5,
    };

    // Handle Sightengine specific output structure
    if (results.status === 'success') {
      // Nudity
      if (results.nudity && (results.nudity.raw > thresholds.nudity || results.nudity.partial > thresholds.nudity)) {
        inappropriateCategories.push(`Nudity (raw: ${results.nudity.raw?.toFixed(2) || '0'}, partial: ${results.nudity.partial?.toFixed(2) || '0'})`);
      }

      // Weapon
      if (results.weapon && results.weapon > thresholds.weapon) {
        inappropriateCategories.push(`Weapon (${results.weapon.toFixed(2)})`);
      }

      // Alcohol
      if (results.alcohol && results.alcohol > thresholds.alcohol) { // Corrected: direct check for alcohol probability
        inappropriateCategories.push(`Alcohol (${results.alcohol.toFixed(2)})`);
      }

      // Recreational Drug
      if (results.recreational_drugs && results.recreational_drugs > thresholds.recreational_drug) {
        inappropriateCategories.push(`Recreational Drug (${results.recreational_drugs.toFixed(2)})`);
      }

      // Medical
      if (results.medical_drugs && results.medical_drugs > thresholds.medical) {
        inappropriateCategories.push(`Medical (${results.medical_drugs.toFixed(2)})`);
      }

      // Tobacco
      if (results.tobacco && results.tobacco.prob > thresholds.tobacco) {
        inappropriateCategories.push(`Tobacco (${results.tobacco.prob.toFixed(2)})`);
      }

      // Violence
      if (results.violence && results.violence.prob > thresholds.violence) {
        inappropriateCategories.push(`Violence (${results.violence.prob.toFixed(2)})`);
      }

      // Offensive
      if (results.offensive && results.offensive.prob > thresholds.offensive) {
        inappropriateCategories.push(`Offensive (${results.offensive.prob.toFixed(2)})`);
      }

      // Gore
      if (results.gore && results.gore.prob > thresholds.gore) {
        inappropriateCategories.push(`Gore (${results.gore.prob.toFixed(2)})`);
      }

    } else if (results.error) {
      return `Error from Sightengine: ${results.error.message || 'Unknown error'}`;
    }

    if (inappropriateCategories.length > 0) {
      return `⚠️ Inappropriate content detected! Reasons: ${inappropriateCategories.join(', ')}`;
    } else {
      return '✅ Content is safe.';
    }
  };

  // Helper function to process text moderation results from Gradio
  const processTextModerationResults = (scores) => {
    const toxicCategories = ['toxic', 'obscene', 'insult', 'threat', 'identity_hate', 'severe_toxic'];
    const inappropriateReasons = [];
    let maxToxicScore = 0;
    
    toxicCategories.forEach(category => {
      const score = scores[category];
      if (score > 0.5) { // Only include if more than 50% confidence
        inappropriateReasons.push(`${category} (${(score * 100).toFixed(1)}%)`);
        if (score > maxToxicScore) {
          maxToxicScore = score;
        }
      }
    });

    const isSafe = scores.safe > 0.5 && inappropriateReasons.length === 0;
    
    return {
      label: isSafe ? "safe" : "unsafe",
      score: isSafe ? scores.safe : maxToxicScore,
      isInappropriate: !isSafe,
      reasons: inappropriateReasons,
      summary: isSafe 
        ? `✅ Content is safe (Confidence: ${(scores.safe * 100).toFixed(1)}%)`
        : `⚠️ Content may be inappropriate (${inappropriateReasons.join(", ")})`
    };
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

  const handleAIModeration = async () => {
    if (moderationType === 'image' && !selectedImage) return;
    if (moderationType === 'text' && !textToModerate.trim()) return;

    setLoading(true);
    setAiModerationResult(null);
    setSubmitError(null);

    try {
      if (moderationType === 'image') {
        const data = await moderateImageWithSightengine(selectedImage);
        setAiModerationResult(data);
        setModerationResults(data); // Set moderationResults for image moderation
        setLastModerationResult(getModerationSummary(data)); // Set lastModerationResult for image moderation
      } else {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/content/moderate/text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text: textToModerate.trim() }),
        });

        if (!res.ok) {
          throw new Error('Failed to moderate text');
        }

        const rawData = await res.json();
        console.log('Raw moderation result:', rawData);
        
        // Process the scores from the first element of data array
        const processedData = processTextModerationResults(rawData.data[0]);
        setAiModerationResult(processedData);
        setModerationResults(processedData);
        setLastModerationResult(processedData.summary);
      }

      // Add to recent activity
      const newActivity = {
        id: recentActivity.length + 1,
        filename: moderationType === 'image' ? selectedImage.name : 'Text moderation',
        status: aiModerationResult?.isInappropriate ? "Flagged" : "Safe",
        date: new Date().toISOString().slice(0, 10),
        icon: moderationType === 'image' ? ImageIcon : FileText,
      };
      setRecentActivity((prev) => [newActivity, ...prev]);
      
      await fetchMyContent();
    } catch (err) {
      setSubmitError(err.message || 'AI moderation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExpertReview = async () => {
    // Only one type at a time enforced by UI toggle
    const token = getAuthToken();
    if (!token) {
      setSubmitError('Please sign in to submit for expert review.');
      return;
    }
    if (moderationType === 'image' && !selectedImage) return;
    if (moderationType === 'text' && !textToModerate.trim()) return;

    setLoading(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('type', moderationType);
      if (moderationType === 'image') {
        formData.append('image', selectedImage);
      } else {
        formData.append('text_content', textToModerate.trim());
      }

      const res = await fetch(`${API_BASE_URL}/content/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Upload failed');
      setSubmitMessage('Submitted for expert review.');
      // clear only on success
      if (moderationType === 'image') {
        setSelectedImage(null);
      } else {
        setTextToModerate('');
      }
      await fetchMyContent();
    } catch (err) {
      setSubmitError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Text moderation is now handled in handleAIModeration

  const SIGHTENGINE_API_USER = import.meta.env.VITE_SIGHTENGINE_API_USER;
  const SIGHTENGINE_API_SECRET = import.meta.env.VITE_SIGHTENGINE_API_SECRET;

  const moderateImageWithSightengine = async (imageFile) => {
    const formData = new FormData();
    formData.append('media', imageFile);
    formData.append('models', 'nudity,wad,offensive,tobacco,violence'); // Updated models to precisely match requested categories
    formData.append('api_user', SIGHTENGINE_API_USER);
    formData.append('api_secret', SIGHTENGINE_API_SECRET);

    try {
      const res = await fetch('https://api.sightengine.com/1.0/check.json', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Sightengine API call failed');
      }
      return data;
    } catch (err) {
      console.error('Sightengine moderation error:', err);
      throw err;
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
        <Link to="/" className="hover:underline">Home</Link>
        <a href="#" className="hover:underline">Features</a>
        <a href="#" className="hover:underline">Docs</a>
        <a href="#" className="hover:underline">Contact</a>
      </nav>
      {localStorage.getItem('token') ? (
        <button
          onClick={async () => {
            try { localStorage.removeItem('token'); } catch {}
            try { await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' }); } catch {}
            window.location.href = '/';
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
        >
          Sign Out
        </button>
      ) : (
        <a
          href="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
        >
          Sign In
        </a>
      )}
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
          <h1 className="text-3xl font-bold text-blue-900">Welcome back, <span className="text-blue-600">{userName || 'User'}</span></h1>
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
              <h2 className="text-xl font-semibold mb-6">Content Moderation</h2>

              {/* Toggle for Image/Text Moderation */}
              <div className="flex items-center justify-center mb-6">
                <span className="mr-3 text-blue-700 font-medium">Image Moderation</span>
                <label htmlFor="toggle" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="toggle"
                      className="sr-only peer"
                      checked={moderationType === 'text'}
                      onChange={() => setModerationType(moderationType === 'image' ? 'text' : 'image')}
                    />
                    <div className="block bg-blue-300 w-14 h-8 rounded-full peer-checked:bg-blue-600"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-all duration-300 ease-in-out peer-checked:translate-x-full"></div>
                  </div>
                </label>
                <span className="ml-3 text-blue-700 font-medium">Text Moderation</span>
              </div>

              {moderationType === 'image' ? (
                <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 sm:p-10 text-center text-blue-700">
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
                    className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                  >
                    Select Image
                  </label>
                  {selectedImage && <p className="mt-2 text-sm">Selected: {selectedImage.name}</p>}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                    <button
                      onClick={handleAIModeration}
                      disabled={!selectedImage || loading}
                      className="bg-green-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Working...' : "AI Moderation"}
                    </button>
                    <button
                      onClick={handleExpertReview}
                      disabled={!selectedImage || loading}
                      className="bg-purple-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : "Expert's Review"}
                    </button>
                  </div>

                  <p className="text-xs mt-4">Only one content type is allowed at a time.</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 sm:p-8 text-center text-blue-700">
                  <FileText className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                  <p className="text-lg font-medium mb-4">Enter text to moderate</p>
                  <textarea
                    className="w-full p-4 border border-blue-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                    rows="6"
                    placeholder="Type your sentences here..."
                    value={textToModerate}
                    onChange={(e) => setTextToModerate(e.target.value)}
                  ></textarea>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleAIModeration}
                      disabled={!textToModerate || loading}
                      className="bg-green-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Working...' : "AI Moderation"}
                    </button>
                    <button
                      onClick={handleExpertReview}
                      disabled={!textToModerate || loading}
                      className="bg-purple-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : "Expert's Review"}
                    </button>
                  </div>
                </div>
              )}

              {(submitMessage || submitError) && (
                <div className="mt-4 text-left">
                  {submitMessage && (
                    <div className="text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-2 mb-2">{submitMessage}</div>
                  )}
                  {submitError && (
                    <div className="text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2 mb-2">{submitError}</div>
                  )}
                </div>
              )}
            </div>

            {lastModerationResult && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <h2 className="text-xl font-semibold mb-4">Last Moderation Result</h2>
                <div className={`text-lg font-medium ${aiModerationResult?.isInappropriate ? 'text-red-600' : 'text-green-600'}`}>
                  {lastModerationResult}
                </div>
                {aiModerationResult?.reasons && aiModerationResult.reasons.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-blue-900 mb-2">Detected Categories:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiModerationResult.reasons.map((reason, index) => (
                        <li key={index} className="text-red-600">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {moderationResults && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <h2 className="text-xl font-semibold mb-4">Detailed Moderation Results</h2>
                <div className={`text-lg font-medium ${moderationResults?.isInappropriate ? 'text-red-600' : 'text-green-600'}`}>
                  {moderationType === 'image' ? getModerationSummary(moderationResults) : moderationResults.summary}
                </div>

                {moderationType === 'text' && moderationResults?.reasons && moderationResults.reasons.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-blue-900 mb-2">Detected Categories:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {moderationResults.reasons.map((reason, index) => (
                        <li key={index} className="text-red-600">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
        {/* User Content List */}
        <div className="mt-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
            <h2 className="text-xl font-semibold mb-4">My Content</h2>
            {myContent.length === 0 ? (
              <p className="text-blue-700">No content yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myContent.map((item) => {
                  const isImage = !!item.image_path;
                  const imageUrl = isImage ? `${API_BASE_URL}${item.image_path}` : null;
                  // prefer explicit decision from backend; otherwise derive from status
                  const rawDecision = (item.decision && String(item.decision)) || (item.status && String(item.status)) || 'Pending';
                  const normalizedDecision = (() => {
                    const d = String(rawDecision || '').toLowerCase();
                    if (d === 'approved') return 'Approved';
                    if (d === 'rejected') return 'Rejected';
                    if (d === 'under review' || d === 'under_review') return 'Under Review';
                    if (d === 'pending' || d === 'in progress') return 'Pending';
                    if (d === 'done' || d === 'completed') return 'Pending';
                    return rawDecision;
                  })();
                  // normalize backend status for the top badge
                  const normalizedStatus = (() => {
                    const s = String(item.status || '').toLowerCase();
                    if (s === 'pending' || s === 'in progress') return 'Pending';
                    if (s === 'done' || s === 'completed') return 'Done';
                    if (s === 'under review' || s === 'under_review') return 'Under Review';
                    return item.status || 'Pending';
                  })();
                  const decisionStyles =
                    normalizedDecision === 'Approved'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : normalizedDecision === 'Rejected'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : normalizedDecision === 'Under Review'
                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200';
                  const containerStyles =
                    normalizedDecision === 'Approved'
                      ? 'bg-green-50 border-green-100'
                      : normalizedDecision === 'Rejected'
                        ? 'bg-red-50 border-red-100'
                        : normalizedDecision === 'Under Review'
                          ? 'bg-orange-50 border-orange-100'
                          : 'bg-blue-50 border-blue-100';
                  const expertResponse = item.expert_response || 'Awaiting expert review';
                  // status-specific styles for the top-right badge
                  const statusStyles =
                    normalizedStatus === 'Done'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : normalizedStatus === 'Under Review'
                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200';
                  return (
                    <div key={item.id || item._id} className={`rounded-xl p-4 shadow-sm border ${containerStyles}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-blue-900">Content</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${statusStyles}`}>{normalizedStatus}</span>
                      </div>
                      <div className="mb-3">
                        {isImage ? (
                          <img src={imageUrl} alt="uploaded" className="w-full h-40 object-cover rounded-md" />
                        ) : (
                          <p className="text-blue-900 whitespace-pre-wrap break-words bg-blue-50 rounded-md p-3">{item.text_content}</p>
                        )}
                      </div>
                      <div className="border-t border-blue-100 pt-3">
                        <div className="text-sm text-blue-700 mb-1 font-medium">Expert Response</div>
                        <p className="text-sm text-blue-900 whitespace-pre-wrap break-words">{expertResponse}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm text-blue-700 font-medium">Decision</div>
                          <span className={`text-xs px-2 py-1 rounded-full border ${decisionStyles}`}>{normalizedDecision}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
