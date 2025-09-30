import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const WaiverDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [waivers, setWaivers] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('sessions');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [newSession, setNewSession] = useState({ 
    participant_email: '', 
    participant_name: '' 
  });

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'waivers') {
      loadWaivers();
    }
  }, [activeTab, debouncedSearch]);

  const loadData = async () => {
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        apiService.getWaiverDashboardStats(),
        apiService.getWaiverSessions()
      ]);
      
      setStats(statsRes || {});
      
      const sessionsData = sessionsRes?.results || sessionsRes || [];
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadWaivers = async () => {
    try {
      const response = await apiService.getWaivers(debouncedSearch);
      const waiversData = response?.results || response || [];
      setWaivers(waiversData);
    } catch (error) {
      console.error('Failed to load waivers:', error);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.createWaiverSession(newSession);
      const newSessionData = response?.results?.[0] || response;

      if (!newSessionData) {
        alert('Failed to create session. No data returned.');
        return;
      }

      // Add new session locally
      setSessions(prevSessions => [newSessionData, ...prevSessions]);

      setNewSession({ participant_email: '', participant_name: '' });
      setShowForm(false);

      // Refresh stats only (avoid duplicate sessions from re-fetching)
      const statsRes = await apiService.getWaiverDashboardStats();
      setStats(statsRes || {});
      
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create waiver link');
    }
  };

  const copyLink = (link, sessionName ) => {
    if (!link) {
      alert(`No waiver link for ${sessionName}`);
      return;
    }
    
    navigator.clipboard.writeText(link).then(() => {
      alert(`✅ Waiver link for ${sessionName} copied to clipboard!`);
    }).catch((err) => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy link. Please try again.');
    });
  };

  const downloadWaiver = async (waiver) => {
    try {
      const blob = await apiService.downloadWaiver(waiver.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = waiver.full_name?.replace(/\s+/g, '_') || 'unknown';
      link.href = url;
      link.download = `waiver_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download waiver');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Links Sent</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total_sessions ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Signed Waivers</h3>
          <p className="text-3xl font-bold text-green-600">{stats.signed_waivers ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Pending Signatures</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending_sessions ?? 0}</p>
        </div>
      </div>

      {/* Create Session Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Create Waiver Link</h2>
          <form onSubmit={createSession}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participant Email (Optional)
                </label>
                <input
                  type="email"
                  value={newSession.participant_email}
                  onChange={(e) => setNewSession({...newSession, participant_email: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participant Name (Optional)
                </label>
                <input
                  type="text"
                  value={newSession.participant_name}
                  onChange={(e) => setNewSession({...newSession, participant_name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
              >
                Create Link
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Waiver Links
            </button>
            <button
              onClick={() => setActiveTab('waivers')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'waivers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Signed Waivers
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'sessions' ? (
            <SessionsTable sessions={sessions} onCopyLink={copyLink} />
          ) : (
            <WaiversTable 
              waivers={waivers} 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDownload={downloadWaiver}
            />
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        aria-label="Create new waiver session"
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>
    </div>
  );
};

// Sessions Table Component
const SessionsTable = ({ sessions, onCopyLink }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No waiver links created yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expires
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sessions.map((session) => {
            const participantName = session.participant_name || 'Unknown';
            
            return (
              <tr key={session.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {participantName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.participant_email || 'No email provided'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    session.status === 'Signed' 
                      ? 'bg-green-100 text-green-800' 
                      : session.status === 'Expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.expires_at ? new Date(session.expires_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onCopyLink(session.waiver_link, participantName)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    disabled={!session.waiver_link}
                  >
                    Copy Link
                  </button>
                  {session.status === 'Pending' && session.waiver_link && (
                    <span className="text-green-600 text-xs">✓ Ready to share</span>
                  )}
                  {!session.waiver_link && (
                    <span className="text-red-500 text-xs">No link available</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Waivers Table Component
const WaiversTable = ({ waivers, searchTerm, onSearchChange, onDownload }) => {
  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {(!waivers || waivers.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? 'No waivers found matching your search.' : 'No signed waivers yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {waivers.map((waiver) => (
                <tr key={waiver.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {waiver.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {waiver.session?.participant_email || 'Not provided'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {waiver.signed_at ? new Date(waiver.signed_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onDownload(waiver)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Download PDF
                    </button>
                    {waiver.pdf_url && (
                      <a
                        href={waiver.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        View PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WaiverDashboard;