// This page is no longer used - OAuth callback is handled directly in AuthContext
// Kept for backward compatibility with any old links
export default function OAuthCallback() {
  // Redirect to dashboard (AuthContext will pick up token from URL)
  window.location.href = "/dashboard";
  return null;
}