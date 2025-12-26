
import { User, SkillAnalysis, StudyPlanItem, InterviewQuestion, ChatMessage } from '../types';

// Use environment variable for production, fallback to local for development
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:5000/api'
  : 'https://skillgraph-backend.onrender.com/api'; // REPLACE with your actual Render URL later

// --- Local Storage Fallback Implementation ---
const LOCAL_STORAGE_KEY = 'skillgraph_offline_db';

const getLocalDB = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : { users: [] };
};

const saveLocalDB = (db: any) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
};

const simulateNetwork = () => new Promise(resolve => setTimeout(resolve, 300));

const localDB = {
  signup: async (name: string, email: string, password: string): Promise<User> => {
    await simulateNetwork();
    const db = getLocalDB();
    if (db.users.find((u: any) => u.email === email)) throw new Error('Email already exists (Local Mode)');
    const newUser = { id: `local_${Date.now()}`, name, email, password, createdAt: new Date().toISOString() };
    db.users.push(newUser);
    saveLocalDB(db);
    return { id: newUser.id, name: newUser.name, email: newUser.email };
  },
  login: async (email: string, password: string): Promise<User> => {
    await simulateNetwork();
    const db = getLocalDB();
    const user = db.users.find((u: any) => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials (Local Mode)');
    return { id: user.id, name: user.name, email: user.email };
  },
  googleLogin: async (googleId: string, email: string, name: string): Promise<User> => {
    await simulateNetwork();
    const db = getLocalDB();
    let user = db.users.find((u: any) => u.googleId === googleId || u.email === email);
    if (!user) {
      user = { id: `local_g_${Date.now()}`, googleId, name, email, createdAt: new Date().toISOString() };
      db.users.push(user);
      saveLocalDB(db);
    }
    return { id: user.id, name: user.name, email: user.email };
  },
  saveData: async (userId: string, key: string, data: any) => {
    const db = getLocalDB();
    const userIndex = db.users.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex][key] = data;
      saveLocalDB(db);
    }
  },
  fetchData: async (userId: string) => {
    const db = getLocalDB();
    return db.users.find((u: any) => u.id === userId) || null;
  }
};

// --- API Implementation ---
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }
  return response.json();
};

export const saveUserToDB = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await handleResponse(response);
  } catch (err) {
    console.warn('Backend unreachable, switching to Local Mode for signup.');
    return await localDB.signup(name, email, password);
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (err) {
    console.warn('Backend unreachable, switching to Local Mode for login.');
    return await localDB.login(email, password);
  }
};

export const googleAuth = async (payload: { googleId: string; email: string; name: string }): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await handleResponse(response);
  } catch (err) {
    console.warn('Backend unreachable, switching to Local Mode for Google login.');
    return await localDB.googleLogin(payload.googleId, payload.email, payload.name);
  }
};

export const syncAnalysis = async (userId: string, analysis: SkillAnalysis) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/analysis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis }),
    });
    return await handleResponse(response);
  } catch (err) {
    return await localDB.saveData(userId, 'analysis', analysis);
  }
};

export const syncStudyPlan = async (userId: string, studyPlan: StudyPlanItem[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/study-plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyPlan }),
    });
    return await handleResponse(response);
  } catch (err) {
    return await localDB.saveData(userId, 'studyPlan', studyPlan);
  }
};

export const syncInterviewPrep = async (userId: string, interviewPrep: InterviewQuestion[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/interview-prep`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewPrep }),
    });
    return await handleResponse(response);
  } catch (err) {
    return await localDB.saveData(userId, 'interviewPrep', interviewPrep);
  }
};

export const saveChatMessage = async (userId: string, message: ChatMessage) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    return await handleResponse(response);
  } catch (err) {
    const db = getLocalDB();
    const user = db.users.find((u: any) => u.id === userId);
    if (user) {
      if (!user.chatHistory) user.chatHistory = [];
      user.chatHistory.push({ ...message, timestamp: new Date() });
      saveLocalDB(db);
    }
  }
};

export const fetchAllUserData = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/data`, { method: 'GET' });
    if (!response.ok) return await localDB.fetchData(userId);
    return await response.json();
  } catch (e) {
    return await localDB.fetchData(userId);
  }
};
