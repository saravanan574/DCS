
"use client";
import { UserRole } from "./types";

const API_URL = "http://localhost:5000";
async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || `An error occurred: ${response.statusText}` };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { success: false, error: "A network error occurred. Please try again." };
  }
}

export async function login(data: any, role: UserRole) {
  const result = await apiFetch(`/api/auth/${role}/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (result.success) {
     return { success: true, token: result.data.token, user: result.data.hospital || result.data.donor };
  }
  return { success: false, error: result.error };
}

export async function register(data: any, role: UserRole) {
  // The backend expects `contact` and `city` for donor, and `location` and `phone` for hospital.
  let payload = {};
  if (role === 'hospital') {
    payload = { ...data, location: data.city, phone: data.contactNumber };
  } else {
    payload = { ...data, contact: data.contactNumber };
  }
  
  const result = await apiFetch(`/api/auth/${role}/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error };
}

export async function getItems(type: 'blood' | 'organ' | 'events' |'patients'|'notifications' | 'available-organs', token: string) {
  const result = await apiFetch(`/api/${type}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return result.success ? result.data : [];
}

export async function getPublicItems(type: 'blood' | 'events'|'hospitals') {
    const result = await apiFetch(`/api/public/${type}`);
    return result.success ? result.data : [];
}

export async function createItem(type: string, data: any, token: string) {
  const result = await apiFetch(`/api/${type}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return result;
}

export async function deleteItem(id: string, type: string, token: string) {
  const apiType = type.toLowerCase().replace(' ', '-');
  const result = await apiFetch(`/api/${apiType}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
   if (result.success) {
    return { success: true, message: `${type} deleted successfully.` };
  }
  return { success: false, message: result.error };
}
