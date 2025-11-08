import { config } from '../config';

const API_URL = `${config.apiUrl}/api`;

class AuthService {
  private token: string | null = null;
  private user: any = null;

  constructor() {
    // Load token from localStorage on init
    this.token = localStorage.getItem('chess_token');
    const userData = localStorage.getItem('chess_user');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }

  async register(username: string, email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      this.token = data.token;
      this.user = data.user;

      localStorage.setItem('chess_token', data.token);
      localStorage.setItem('chess_user', JSON.stringify(data.user));

      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.token = data.token;
      this.user = data.user;

      localStorage.setItem('chess_token', data.token);
      localStorage.setItem('chess_user', JSON.stringify(data.user));

      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('chess_token');
    localStorage.removeItem('chess_user');
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  async getCurrentUser() {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const user = await response.json();
      this.user = user;
      localStorage.setItem('chess_user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async updateProfile(username: string) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      this.user = data;
      localStorage.setItem('chess_user', JSON.stringify(data));

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Update failed');
    }
  }
}

export const authService = new AuthService();
