// utils/auth.js

// Retrieve token only if it is not expired
export function getToken() {
  const token = localStorage.getItem("token");
  const expiryTime = localStorage.getItem("tokenExpiry");

  if (!token || !expiryTime || Date.now() > parseInt(expiryTime)) {
    // Token expired → clean up
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    return null;
  }

  return token;
}

// Decode JWT payload safely
export function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}
