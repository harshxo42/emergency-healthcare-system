const API_BASE = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Patients
  patients: {
    getAll: () => fetch(`${API_BASE}/patients`).then(handleResponse),
    getHistory: (patientId) => fetch(`${API_BASE}/patients/${patientId}`).then(handleResponse),
    create: (patientData) => fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    }).then(handleResponse)
  },

  // Hospitals
  hospitals: {
    getAll: () => fetch(`${API_BASE}/hospitals`).then(handleResponse),
    getNearest: (x, y) => fetch(`${API_BASE}/hospitals/nearest?x=${x}&y=${y}`).then(handleResponse)
  },

  // Ambulances
  ambulances: {
    getAll: () => fetch(`${API_BASE}/ambulances`).then(handleResponse),
    update: (id, updateData) => fetch(`${API_BASE}/ambulances/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    }).then(handleResponse)
  },

  // Emergencies
  emergencies: {
    getAll: () => fetch(`${API_BASE}/emergencies`).then(handleResponse),
    getQueue: () => fetch(`${API_BASE}/emergencies/queue`).then(handleResponse),
    create: (requestData) => fetch(`${API_BASE}/emergencies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    }).then(handleResponse),
    dispatch: (emergencyId) => fetch(`${API_BASE}/emergencies/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emergencyId ? { emergencyId } : {})
    }).then(handleResponse),
    resolve: (id) => fetch(`${API_BASE}/emergencies/${id}/resolve`, {
      method: 'POST'
    }).then(handleResponse)
  }
};

export default api;
