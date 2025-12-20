// authUtils.js
// Utility functions for authentication and authorization

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(user) {
  if (!user || !user.expirationDate) return true;
  
  const expirationDate = new Date(user.expirationDate);
  const currentDate = new Date();
  
  return currentDate > expirationDate;
}

export function isUserLoggedIn() {
  const user = getStoredUser();
  if (!user) return false;
  
  return !isTokenExpired(user);
}

export function isAdmin() {
  const user = getStoredUser();
  if (!user || isTokenExpired(user)) return false;
  
  return user.role_id === 1;
}

export function isUserRole() {
  const user = getStoredUser();
  if (!user || isTokenExpired(user)) return false;
  
  return user.role_id === 2;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}
