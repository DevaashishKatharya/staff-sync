// StaffSync API Service Layer
const BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('staffsync_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

export const api = {
  // Auth API
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse(res);
    },
    demoSwitch: async (role) => {
      const res = await fetch(`${BASE_URL}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Employees API
  employees: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/employees?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${BASE_URL}/employees/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    create: async (employeeData) => {
      const res = await fetch(`${BASE_URL}/employees`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(employeeData),
      });
      return handleResponse(res);
    },
    update: async (id, employeeData) => {
      const res = await fetch(`${BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(employeeData),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getDepartmentSummary: async () => {
      const res = await fetch(`${BASE_URL}/employees/departments/summary`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Leave Requests API
  leaves: {
    apply: async (leaveData) => {
      const res = await fetch(`${BASE_URL}/leaves`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(leaveData),
      });
      return handleResponse(res);
    },
    getMyLeaves: async () => {
      const res = await fetch(`${BASE_URL}/leaves/my`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/leaves?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    review: async (id, { status, reviewerComments }) => {
      const res = await fetch(`${BASE_URL}/leaves/${id}/review`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reviewerComments }),
      });
      return handleResponse(res);
    },
  },

  // Attendance API
  attendance: {
    punch: async ({ action, location, notes }) => {
      const res = await fetch(`${BASE_URL}/attendance/punch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, location, notes }),
      });
      return handleResponse(res);
    },
    getMyAttendance: async () => {
      const res = await fetch(`${BASE_URL}/attendance/my`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/attendance?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Announcements API
  announcements: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/announcements?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${BASE_URL}/announcements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${BASE_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Training & Development API
  training: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/training?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${BASE_URL}/training/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${BASE_URL}/training`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    assign: async (id, employeeIds) => {
      const res = await fetch(`${BASE_URL}/training/${id}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ employeeIds }),
      });
      return handleResponse(res);
    },
    updateProgress: async (id, { employeeId, progress }) => {
      const res = await fetch(`${BASE_URL}/training/${id}/progress`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ employeeId, progress }),
      });
      return handleResponse(res);
    },
  },

  // Reports API
  reports: {
    getHRMetrics: async () => {
      const res = await fetch(`${BASE_URL}/reports/hr-metrics`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getManagerMetrics: async () => {
      const res = await fetch(`${BASE_URL}/reports/manager-metrics`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getEmployeeMetrics: async () => {
      const res = await fetch(`${BASE_URL}/reports/employee-metrics`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },
};
