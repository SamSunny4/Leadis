/**
 * Magic Link Authentication Service
 * Handles Magic Link authentication for passwordless login
 */

import { Magic } from 'magic-sdk';

// Initialize Magic instance (client-side only)
let magic = null;

/**
 * Get or initialize the Magic instance
 * @returns {Magic} Magic instance
 */
export const getMagic = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!magic) {
    const publishableKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.warn('Magic publishable key not configured. Using demo mode.');
      return null;
    }
    
    magic = new Magic(publishableKey);
  }
  
  return magic;
};

/**
 * Send magic link to user's email
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export const sendMagicLink = async (email) => {
  try {
    const magicInstance = getMagic();
    
    if (!magicInstance) {
      // Demo mode - simulate magic link
      console.log('Demo mode: Simulating magic link for', email);
      return { success: true, token: 'demo_token', isDemo: true };
    }
    
    // Send magic link and get DID token
    const didToken = await magicInstance.auth.loginWithMagicLink({
      email,
      showUI: true, // Show Magic's built-in UI
    });
    
    return { success: true, token: didToken };
  } catch (error) {
    console.error('Magic link error:', error);
    return { success: false, error: error.message || 'Failed to send magic link' };
  }
};

/**
 * Check if user is logged in via Magic
 * @returns {Promise<boolean>}
 */
export const isMagicLoggedIn = async () => {
  try {
    const magicInstance = getMagic();
    if (!magicInstance) return false;
    
    return await magicInstance.user.isLoggedIn();
  } catch (error) {
    console.error('Error checking Magic login status:', error);
    return false;
  }
};

/**
 * Get user metadata from Magic
 * @returns {Promise<{email: string, issuer: string} | null>}
 */
export const getMagicUserMetadata = async () => {
  try {
    const magicInstance = getMagic();
    if (!magicInstance) return null;
    
    const isLoggedIn = await magicInstance.user.isLoggedIn();
    if (!isLoggedIn) return null;
    
    return await magicInstance.user.getMetadata();
  } catch (error) {
    console.error('Error getting Magic user metadata:', error);
    return null;
  }
};

/**
 * Logout user from Magic
 * @returns {Promise<boolean>}
 */
export const logoutMagic = async () => {
  try {
    const magicInstance = getMagic();
    if (!magicInstance) return true;
    
    await magicInstance.user.logout();
    return true;
  } catch (error) {
    console.error('Error logging out from Magic:', error);
    return false;
  }
};

/**
 * Get DID token for API authentication
 * @returns {Promise<string | null>}
 */
export const getMagicToken = async () => {
  try {
    const magicInstance = getMagic();
    if (!magicInstance) return null;
    
    const isLoggedIn = await magicInstance.user.isLoggedIn();
    if (!isLoggedIn) return null;
    
    return await magicInstance.user.getIdToken();
  } catch (error) {
    console.error('Error getting Magic token:', error);
    return null;
  }
};
