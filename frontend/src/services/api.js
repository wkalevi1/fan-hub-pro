import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Outfits API
export const outfitsAPI = {
  // Get all outfits with ranking
  getAll: () => api.get('/outfits'),
  
  // Get single outfit
  getById: (id) => api.get(`/outfits/${id}`),
  
  // Create new outfit (admin)
  create: (outfitData) => api.post('/outfits', outfitData),
};

// Votes API
export const votesAPI = {
  // Cast a vote
  vote: (voteData) => api.post('/votes', voteData),
  
  // Get votes for outfit
  getByOutfit: (outfitId) => api.get(`/votes/outfit/${outfitId}`),
  
  // Get voting stats
  getStats: () => api.get('/votes/stats'),
};

// Questions API
export const questionsAPI = {
  // Get all answered questions
  getAll: (params = {}) => api.get('/questions', { params }),
  
  // Submit new question
  submit: (questionData) => api.post('/questions', questionData),
  
  // Get pending questions (admin)
  getPending: () => api.get('/questions/pending'),
  
  // Answer question (admin)
  answer: (id, answerData) => api.put(`/questions/${id}/answer`, answerData),
};

// Wallpapers API
export const wallpapersAPI = {
  // Get all wallpapers
  getAll: (params = {}) => api.get('/wallpapers', { params }),
  
  // Get popular wallpapers
  getPopular: (limit = 20) => api.get('/wallpapers/popular', { params: { limit } }),
  
  // Track download
  download: (id, fanData = {}) => api.post(`/wallpapers/${id}/download`, fanData),
  
  // Create wallpaper (admin)
  create: (wallpaperData) => api.post('/wallpapers', wallpaperData),
};

// Fans API
export const fansAPI = {
  // Get all fans
  getAll: (params = {}) => api.get('/fans', { params }),
  
  // Get top fans
  getTop: (limit = 10) => api.get('/fans/top', { params: { limit } }),
  
  // Create fan profile
  create: (fanData) => api.post('/fans', fanData),
  
  // Get single fan
  getById: (id) => api.get(`/fans/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
  status: () => api.get('/status'),
};

// Helper function to handle API errors
export const handleAPIError = (error, defaultMessage = 'Something went wrong') => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message || defaultMessage;
};

// Local storage helpers for user session
export const sessionAPI = {
  // Get stored votes (for preventing duplicate votes)
  getStoredVotes: () => {
    const stored = localStorage.getItem('fanhub_votes');
    return stored ? JSON.parse(stored) : {};
  },
  
  // Store vote
  storeVote: (outfitId) => {
    const votes = sessionAPI.getStoredVotes();
    votes[outfitId] = true;
    localStorage.setItem('fanhub_votes', JSON.stringify(votes));
  },
  
  // Get stored questions
  getStoredQuestions: () => {
    const stored = localStorage.getItem('fanhub_questions');
    return stored ? JSON.parse(stored) : [];
  },
  
  // Store question
  storeQuestion: (question) => {
    const questions = sessionAPI.getStoredQuestions();
    const newQuestion = {
      id: Date.now(),
      question: question,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    questions.push(newQuestion);
    localStorage.setItem('fanhub_questions', JSON.stringify(questions));
    return newQuestion;
  },
  
  // Get stored downloads
  getStoredDownloads: () => {
    const stored = localStorage.getItem('fanhub_downloads');
    return stored ? JSON.parse(stored) : {};
  },
  
  // Store download
  storeDownload: (wallpaperId) => {
    const downloads = sessionAPI.getStoredDownloads();
    downloads[wallpaperId] = true;
    localStorage.setItem('fanhub_downloads', JSON.stringify(downloads));
  },
};

export default api;