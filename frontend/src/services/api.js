// API Service Layer - Handles all backend communication
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = this.getUserFromStorage();
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
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

  // Get authentication headers
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

  // Cafe Checklist methods
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

  // async initializeTodaysChecklist(checklistItems) {
  //   const today = new Date().toISOString().split('T')[0];
  //   const createdItems = [];
    
  //   for (const [checklistType, items] of Object.entries(checklistItems)) {
  //     for (const item of items) {
  //       try {
  //         const checklistItem = await this.createCafeChecklist({
  //           date: today,
  //           item_name: item.label,
  //           item_id: item.id,
  //           checklist_type: checklistType,
  //           completed: false
  //         });
  //         createdItems.push(checklistItem);
  //       } catch (error) {
  //         // Item might already exist, continue
  //         console.log(`Item ${item.id} may already exist:`, error.message);
  //       }
  //     }
  //   }
    
  //   return createdItems;
  // }


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

  async getAppraisals(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.get(`/appraisals/${query ? `?${query}` : ''}`);
}

async getAppraisal(id) {
  return this.get(`/appraisals/${id}/`);
}

async createAppraisal(data) {
  return this.post('/appraisals/', data);
}

async updateAppraisal(id, data) {
  return this.put(`/appraisals/${id}/`, data);
}

async deleteAppraisal(id) {
  return this.delete(`/appraisals/${id}/`);
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
