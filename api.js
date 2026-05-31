const BASE = '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = token;
  return config;
});
api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.error || "Server bilan bog'lanishda xato";
    return Promise.reject(new Error(msg));
  }
);
const Auth = {
  login:  async (username, password) => api.post('/auth/login',  { username, password }),
  logout: async ()                   => api.post('/auth/logout'),
};
const Doctors = {
  getAll:  async (q = '')    => api.get(`/doctors${q ? '?q='+encodeURIComponent(q) : ''}`),
  getOne:  async (id)        => api.get(`/doctors/${id}`),
  create:  async (data)      => api.post('/doctors', data),
  update:  async (id, data)  => api.put(`/doctors/${id}`, data),
  remove:  async (id)        => api.delete(`/doctors/${id}`),
};

const Patients = {
  getAll:  async (q = '', doctorId = '') => {
    let url = '/patients?';
    if (q) url += 'q=' + encodeURIComponent(q) + '&';
    if (doctorId) url += 'doctorId=' + doctorId;
    return api.get(url);
  },
  getOne:  async (id)       => api.get(`/patients/${id}`),
  create:  async (data)     => api.post('/patients', data),
  update:  async (id, data) => api.put(`/patients/${id}`, data),
  remove:  async (id)       => api.delete(`/patients/${id}`),
};
const Diseases = {
  getAll:  async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/diseases${params ? '?'+params : ''}`);
  },
  getOne:  async (id)       => api.get(`/diseases/${id}`),
  create:  async (data)     => api.post('/diseases', data),
  update:  async (id, data) => api.put(`/diseases/${id}`, data),
  remove:  async (id)       => api.delete(`/diseases/${id}`),
};
const Stats = {
  get: async () => api.get('/stats'),
};