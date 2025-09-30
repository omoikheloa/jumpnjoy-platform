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

  // Handle response method for compatibility with second file
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

  // Daily Inspection API methods
  async getDailyInspections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/safety/daily-inspections/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async getDailyInspection(id) {
    const response = await fetch(`${this.baseURL}/safety/daily-inspections/${id}/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async createDailyInspection(data) {
    // Transform the frontend data structure to match the API
    const today = new Date().toISOString().split("T")[0]; // "2025-09-04"
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
      remedial_notes: data.remedial_notes || {},
      checked_by: this.user?.id || null,
      date: today
    };

    const response = await fetch(`${this.baseURL}/daily-inspections/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(apiData),
    });
    
    return this.handleResponse(response);
  }

  async updateDailyInspection(id, data) {
    // Transform the frontend data structure to match the API
    const apiData = {
      wc_number: data.wc_number || '',
      inspection_day: data.inspection_day,
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

    const response = await fetch(`${this.baseURL}/daily-inspections/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(apiData),
    });
    
    return this.handleResponse(response);
  }

  async deleteDailyInspection(id) {
    const response = await fetch(`${this.baseURL}/safety/daily-inspections/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Remedial Action API methods
  async getRemedialActions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/safety/remedial-actions/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async getRemedialAction(id) {
    const response = await fetch(`${this.baseURL}/safety/remedial-actions/${id}/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async createRemedialAction(data) {
    const response = await fetch(`${this.baseURL}/safety/remedial-actions/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  }

  async updateRemedialAction(id, data) {
    const response = await fetch(`${this.baseURL}/safety/remedial-actions/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  }

  async deleteRemedialAction(id) {
    const response = await fetch(`${this.baseURL}/safety/remedial-actions/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Dashboard API method
  async getInspectionDashboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/safety/dashboard/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // Backward compatibility - Simple Safety Checks
  async getSafetyChecks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/safety/safety-checks/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async createSafetyCheck(data) {
    const response = await fetch(`${this.baseURL}/safety/safety-checks/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  }

  // Utility methods for data transformation
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

    if (!data.inspection_day) {
      errors.push('Inspection day is required');
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

    // Waiver Dashboard
  async getWaiverDashboardStats() {
    return this.get('/dashboard/stats/');
  }

  // Waiver Sessions
  async getWaiverSessions() {
    return this.get('/waiver-sessions/');
  }

  async createWaiverSession(data) {
    return this.post('/waiver-sessions/', data);
  }

  // Waivers
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