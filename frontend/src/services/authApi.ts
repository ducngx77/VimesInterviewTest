import { LoginCredentials, LoginResponse } from '@shared/type.js';
import.meta.env.VITE_API_BASE_URL;

const API_URL = import.meta.env.VITE_API_BASE_URL + "/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  }
};