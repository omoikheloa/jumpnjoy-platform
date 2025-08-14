// API Service Layer - Handles all backend communication
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
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

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(username, password) {
    const response = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout/', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
    }
  }

  // Form data methods
  async getSafetyChecks() {
    return this.get('/safety-checks/');
  }

  async createSafetyCheck(data) {
    return this.post('/safety-checks/', data);
  }

  async getIncidents() {
    return this.get('/incidents/');
  }

  async createIncident(data) {
    return this.post('/incidents/', data);
  }

  async getShifts() {
    return this.get('/shifts/');
  }

  async createShift(data) {
    return this.post('/shifts/', data);
  }

  async getCleaningLogs() {
    return this.get('/cleaning/');
  }

  async createCleaningLog(data) {
    return this.post('/cleaning/', data);
  }

  async getMaintenanceLogs() {
    return this.get('/maintenance/');
  }

  async createMaintenanceLog(data) {
    return this.post('/maintenance/', data);
  }

  async getDailyStats() {
    return this.get('/daily-stats/');
  }

  async createDailyStats(data) {
    return this.post('/daily-stats/', data);
  }

  // Dashboard data
  async getDashboardData() {
    return this.get('/dashboard/');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;
