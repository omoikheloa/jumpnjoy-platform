// API Service Layer - Handles all backend communication
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = this.getUserFromStorage();
    this.baseURL = API_BASE;
  }

  // Save token + user to both state and localStorage
  setAuthData(token, user) {
    this.token = token;
    this.user = user;

    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  // Get user from localStorage
  getUserFromStorage() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Authentication
  async login(username, password) {
    const response = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token && response.user) {
      this.setAuthData(response.token, response.user);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout/', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setAuthData(null, null);
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    return headers;
  }

  // Generic HTTP methods
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Handle response method for compatibility
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Dashboard methods
  async getDashboardData() {
    return this.get('/dashboard/');
  }

  async getDailyStats() {
    return this.get('/daily-stats/');
  }

  async getIncidents() {
    return this.get('/incidents/');
  }

  async getAppraisals() {
    return this.get('/appraisals/');
  }

  // User management methods
  async getUsers() {
    return this.get('/users/');
  }

  async createUser(data) {
    return this.post('/users/', data);
  }

  async updateUser(userId, data) {
    return this.patch(`/users/${userId}/`, data);
  }

  async deleteUser(userId) {
    return this.delete(`/users/${userId}/`);
  }

  // Analytics methods
  async getAnalytics() {
    return this.get('/analytics/');
  }

  // CafeChecklist
  async getCafeChecklists(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/cafe-checklists/${query ? `?${query}` : ''}`);
  }

  async createCafeChecklist(data) {
    return this.post('/cafe-checklists/', data);
  }

  async updateCafeChecklist(itemId, data) {
    return this.patch(`/cafe-checklists/${itemId}/`, data);
  }

  async toggleCafeChecklistItem(itemId) {
    return this.post(`/cafe-checklists/${itemId}/toggle/`);
  }

  async getCafeChecklistByDate(date) {
    return this.get(`/cafe-checklists/?date=${date}`);
  }

  // MarshalChecklist
  async getMarshalChecklists(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/marshal-checklists/${query ? `?${query}` : ''}`);
  }

  async createMarshalChecklist(data) {
    return this.post('/marshal-checklists/', data);
  }

  async updateMarshalChecklist(itemId, data) {
    return this.patch(`/marshal-checklists/${itemId}/`, data);
  }

  async toggleMarshalChecklistItem(itemId) {
    return this.post(`/marshal-checklists/${itemId}/toggle/`);
  }

  async getMarshalChecklistByDate(date) {
    return this.get(`/marshal-checklists/?date=${date}`);
  }

  // =========================================================================
  // DAILY INSPECTION API METHODS - UPDATED TO MATCH YOUR DJANGO BACKEND
  // =========================================================================

  // Check if user has already submitted an inspection for today
  async checkDailySubmission(date) {
    try {
      // Use the daily-inspections endpoint with date filter
      const response = await this.get(`/daily-inspections/?date=${date}`);
      
      // Check if current user has any submissions for today
      const submissions = response.results || response;
      const userSubmissions = submissions.filter(submission => 
        submission.checked_by === this.user?.id
      );
      
      return {
        hasSubmitted: userSubmissions.length > 0,
        existingSubmission: userSubmissions[0] || null
      };
    } catch (error) {
      console.error('Error checking daily submission:', error);
      return { hasSubmitted: false };
    }
  }

  async getDailyInspections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/daily-inspections/${queryString ? `?${queryString}` : ''}`);
  }

  async getDailyInspection(id) {
    return this.get(`/daily-inspections/${id}/`);
  }

  async createDailyInspection(data) {
    // Transform frontend data structure to match Django API
    const today = new Date().toISOString().split("T")[0];

    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('User not authenticated. Please log in again.');
    }
    
    const apiData = {
      date: today,
      wc_number: data.wc_number || '',
      inspector_initials: data.inspector_initials,
      manager_initials: data.manager_initials,
      
      // Map inspection results to individual fields
      framework_stability: data.inspection_results?.INS001 || 'pass',
      perimeter_netting: data.inspection_results?.INS002 || 'pass',
      wall_padding: data.inspection_results?.INS003 || 'pass',
      walkway_padding: data.inspection_results?.INS004 || 'pass',
      coverall_pads: data.inspection_results?.INS005 || 'pass',
      trampoline_beds: data.inspection_results?.INS006 || 'pass',
      safety_netting: data.inspection_results?.INS007 || 'pass',
      trampoline_springs: data.inspection_results?.INS008 || 'pass',
      fire_doors: data.inspection_results?.INS009 || 'pass',
      fire_equipment: data.inspection_results?.INS010 || 'pass',
      electrical_cables: data.inspection_results?.INS011 || 'pass',
      electrical_sockets: data.inspection_results?.INS012 || 'pass',
      first_aid_box: data.inspection_results?.INS013 || 'pass',
      signage: data.inspection_results?.INS014 || 'pass',
      area_cleanliness: data.inspection_results?.INS015 || 'pass',
      gates_locks: data.inspection_results?.INS016 || 'pass',
      trip_hazards: data.inspection_results?.INS017 || 'pass',
      staff_availability: data.inspection_results?.INS018 || 'pass',
      
      // Include remedial notes for automatic RemedialAction creation
      remedial_notes: data.remedial_notes || {},

      checked_by: currentUser.id
    };

    return this.post('/daily-inspections/', apiData);
  }

  async updateDailyInspection(id, data) {
    const apiData = {
      wc_number: data.wc_number || '',
      inspector_initials: data.inspector_initials,
      manager_initials: data.manager_initials,
      
      // Map inspection results to individual fields
      framework_stability: data.inspection_results?.INS001 || 'pass',
      perimeter_netting: data.inspection_results?.INS002 || 'pass',
      wall_padding: data.inspection_results?.INS003 || 'pass',
      walkway_padding: data.inspection_results?.INS004 || 'pass',
      coverall_pads: data.inspection_results?.INS005 || 'pass',
      trampoline_beds: data.inspection_results?.INS006 || 'pass',
      safety_netting: data.inspection_results?.INS007 || 'pass',
      trampoline_springs: data.inspection_results?.INS008 || 'pass',
      fire_doors: data.inspection_results?.INS009 || 'pass',
      fire_equipment: data.inspection_results?.INS010 || 'pass',
      electrical_cables: data.inspection_results?.INS011 || 'pass',
      electrical_sockets: data.inspection_results?.INS012 || 'pass',
      first_aid_box: data.inspection_results?.INS013 || 'pass',
      signage: data.inspection_results?.INS014 || 'pass',
      area_cleanliness: data.inspection_results?.INS015 || 'pass',
      gates_locks: data.inspection_results?.INS016 || 'pass',
      trip_hazards: data.inspection_results?.INS017 || 'pass',
      staff_availability: data.inspection_results?.INS018 || 'pass',
      
      // Include remedial notes
      remedial_notes: data.remedial_notes || {}
    };

    return this.put(`/daily-inspections/${id}/`, apiData);
  }

  async deleteDailyInspection(id) {
    return this.delete(`/daily-inspections/${id}/`);
  }

  // =========================================================================
  // REMEDIAL ACTION API METHODS
  // =========================================================================

  async getRemedialActions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/remedial-actions/${queryString ? `?${queryString}` : ''}`);
  }

  async getRemedialAction(id) {
    return this.get(`/remedial-actions/${id}/`);
  }

  async createRemedialAction(data) {
    return this.post('/remedial-actions/', data);
  }

  async updateRemedialAction(id, data) {
    return this.put(`/remedial-actions/${id}/`, data);
  }

  async deleteRemedialAction(id) {
    return this.delete(`/remedial-actions/${id}/`);
  }

  // =========================================================================
  // INSPECTION DASHBOARD API METHODS
  // =========================================================================

  async getInspectionDashboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/safety/inspection-dashboard/${queryString ? `?${queryString}` : ''}`);
  }

  // =========================================================================
  // INCIDENT REPORT API METHODS
  // =========================================================================

  async getIncidents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.get(`/incidents/${queryString ? `?${queryString}` : ''}`);
    console.log('Raw incidents API response:', response);
    return response;
  }

  async getIncident(id) {
    return this.get(`/incidents/${id}/`);
  }

  async createIncident(formData) {
    const response = await fetch(`${this.baseURL}/incidents/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async updateIncident(id, formData) {
    const response = await fetch(`${this.baseURL}/incidents/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${this.token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async deleteIncident(id) {
    return this.delete(`/incidents/${id}/`);
  }

  // Get incidents for current user
  async getUserIncidents() {
    return this.get('/incidents/my-reports/');
  }

  // =========================================================================
  // SAFETY CHECK API METHODS (Legacy/Simple Safety Checks)
  // =========================================================================

  async getSafetyChecks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/safety/safety-checks/${queryString ? `?${queryString}` : ''}`);
  }

  async createSafetyCheck(data) {
    return this.post('/safety/safety-checks/', data);
  }

  // =========================================================================
  // UTILITY METHODS FOR DATA TRANSFORMATION
  // =========================================================================

  transformInspectionToFrontend(apiData) {
    // Transform API response back to frontend format
    const inspectionResults = {
      INS001: apiData.framework_stability,
      INS002: apiData.perimeter_netting,
      INS003: apiData.wall_padding,
      INS004: apiData.walkway_padding,
      INS005: apiData.coverall_pads,
      INS006: apiData.trampoline_beds,
      INS007: apiData.safety_netting,
      INS008: apiData.trampoline_springs,
      INS009: apiData.fire_doors,
      INS010: apiData.fire_equipment,
      INS011: apiData.electrical_cables,
      INS012: apiData.electrical_sockets,
      INS013: apiData.first_aid_box,
      INS014: apiData.signage,
      INS015: apiData.area_cleanliness,
      INS016: apiData.gates_locks,
      INS017: apiData.trip_hazards,
      INS018: apiData.staff_availability,
    };

    return {
      ...apiData,
      inspection_results: inspectionResults,
    };
  }

  // Helper method to get inspection item names
  getInspectionItems() {
    return [
      { id: 'INS001', name: 'Framework Stability & Security' },
      { id: 'INS002', name: 'Perimeter Netting' },
      { id: 'INS003', name: 'Protective Wall Padding' },
      { id: 'INS004', name: 'Protective Walkway Padding' },
      { id: 'INS005', name: 'Coverall Pads' },
      { id: 'INS006', name: 'Trampoline Beds' },
      { id: 'INS007', name: 'Trampoline Safety Netting' },
      { id: 'INS008', name: 'Trampoline Springs' },
      { id: 'INS009', name: 'Fire Doors Functioning Correctly & Routes Free from Obstruction' },
      { id: 'INS010', name: 'Fire Extinguishing Equipment In Place' },
      { id: 'INS011', name: 'Electrical Cables Safely Routed and Secured in Position' },
      { id: 'INS012', name: 'Electrical plugs and sockets in good condition with unused sockets protected by childproof covers' },
      { id: 'INS013', name: 'First-aid box on hand and fully stocked in accordance with its contents list' },
      { id: 'INS014', name: 'Signage in place and clearly visible' },
      { id: 'INS015', name: 'Area clean and ready for use' },
      { id: 'INS016', name: 'Gates, closing and locking devices are operational' },
      { id: 'INS017', name: 'Area is free of trip/slip hazards' },
      { id: 'INS018', name: 'Minimum required staff always available, including first aid requirements' }
    ];
  }

  // Helper method to validate inspection data
  validateInspectionData(data) {
    const errors = [];

    if (!data.inspector_initials?.trim()) {
      errors.push('Inspector initials are required');
    }

    if (!data.manager_initials?.trim()) {
      errors.push('Manager initials are required');
    }

    // Check if failed/remedial items have notes
    const results = data.inspection_results || {};
    const notes = data.remedial_notes || {};

    Object.entries(results).forEach(([code, status]) => {
      if ((status === 'fail' || status === 'remedial') && !notes[code]?.trim()) {
        const item = this.getInspectionItems().find(item => item.id === code);
        errors.push(`Remedial notes required for ${item?.name || code}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // =========================================================================
  // WAIVER MANAGEMENT API METHODS
  // =========================================================================

  async getWaiverDashboardStats() {
    return this.get('/dashboard/stats/');
  }

  async getWaiverSessions() {
    return this.get('/waiver-sessions/');
  }

  async createWaiverSession(data) {
    return this.post('/waiver-sessions/', data);
  }

  async getWaivers(search = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    return this.get(`/waivers/?${params.toString()}`);
  }

  async downloadWaiver(waiverId) {
    const response = await fetch(`${this.baseURL}/waivers/${waiverId}/download/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  // Public waiver endpoints (no authentication required)
  async getPublicWaiverSession(token) {
    const response = await fetch(`${this.baseURL}/waiver/${token}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.handleResponse(response);
  }

  async signPublicWaiver(token, data) {
    const response = await fetch(`${this.baseURL}/waiver/${token}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;