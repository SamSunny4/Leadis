/**
 * User Encryption Utility
 * Uses AES-128 encryption for generating secure usernames from email and name
 * Browser-compatible using Web Crypto API
 */

// Secret key for AES-128 (16 bytes = 128 bits)
// In production, store this securely in environment variables
const SECRET_KEY = 'LeadisSecretKey1'; // Must be exactly 16 bytes

/**
 * Convert string to ArrayBuffer
 * @param {string} str - String to convert
 * @returns {ArrayBuffer} ArrayBuffer representation
 */
function stringToArrayBuffer(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Convert ArrayBuffer to hex string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} Hex string representation
 */
function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to ArrayBuffer
 * @param {string} hex - Hex string to convert
 * @returns {Uint8Array} Uint8Array representation
 */
function hexToArrayBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Get AES key from secret
 * @returns {Promise<CryptoKey>} AES-CBC key
 */
async function getAESKey() {
  const keyData = stringToArrayBuffer(SECRET_KEY.padEnd(16, '0').substring(0, 16));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a deterministic IV from input data
 * Uses first 16 bytes of SHA-256 hash of the input
 * @param {string} data - Input data to derive IV from
 * @returns {Promise<Uint8Array>} 16-byte IV
 */
async function generateDeterministicIV(data) {
  const dataBuffer = stringToArrayBuffer(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  // Take first 16 bytes of the hash as IV
  return new Uint8Array(hashBuffer.slice(0, 16));
}

/**
 * Encrypts user email and name using AES-128-CBC algorithm
 * Uses deterministic IV derived from input for consistent results
 * @param {string} email - User's email address
 * @param {string} name - User's name (child's name)
 * @returns {Promise<string>} Encrypted username for database creation
 */
export async function generateEncryptedUsername(email, name) {
  try {
    // Combine email and name (normalized)
    const userData = `${email.toLowerCase().trim()}|${name.trim()}`;
    
    // Generate deterministic IV from input data (ensures same input = same output)
    const iv = await generateDeterministicIV(userData + SECRET_KEY);
    
    const dataBuffer = stringToArrayBuffer(userData);
    
    // Get AES key
    const key = await getAESKey();
    
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      key,
      dataBuffer
    );
    
    // Combine IV and encrypted data (IV is needed for decryption)
    const ivHex = arrayBufferToHex(iv);
    const encryptedHex = arrayBufferToHex(encrypted);
    const encryptedUsername = `${ivHex}:${encryptedHex}`;
    
    return encryptedUsername;
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback to hash-based username
    return await generateHashedUsername(email, name);
  }
}

/**
 * Decrypts the encrypted username back to email and name
 * @param {string} encryptedUsername - The encrypted username
 * @returns {Promise<{email: string, name: string}>} Object containing email and name
 */
export async function decryptUsername(encryptedUsername) {
  try {
    // Split IV and encrypted data
    const parts = encryptedUsername.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted username format');
    }
    
    const iv = hexToArrayBuffer(parts[0]);
    const encrypted = hexToArrayBuffer(parts[1]);
    
    // Get AES key
    const key = await getAESKey();
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      encrypted
    );
    
    // Convert to string and split
    const decoder = new TextDecoder();
    const userData = decoder.decode(decrypted);
    const [email, name] = userData.split('|');
    
    return { email, name };
  } catch (error) {
    console.error('Decryption error:', error);
    return { email: '', name: '' };
  }
}

/**
 * Generates a shorter hash-based username (deterministic approach)
 * This creates a deterministic username from email and name
 * @param {string} email - User's email address
 * @param {string} name - User's name (child's name)
 * @returns {Promise<string>} Hash-based username (32 characters)
 */
export async function generateHashedUsername(email, name) {
  const userData = `${email.toLowerCase().trim()}|${name.trim()}`;
  const dataBuffer = stringToArrayBuffer(userData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashHex = arrayBufferToHex(hashBuffer);
  return hashHex.substring(0, 32); // Return first 32 characters
}

/**
 * Check if user credentials exist in localStorage
 * @returns {{email: string, childName: string, username: string} | null} User credentials or null
 */
export function getUserCredentials() {
  try {
    const credentials = localStorage.getItem('leadis_user_credentials');
    return credentials ? JSON.parse(credentials) : null;
  } catch (error) {
    console.error('Error reading user credentials:', error);
    return null;
  }
}

/**
 * Save user credentials to localStorage
 * @param {string} email - User's email
 * @param {string} childName - Child's name
 * @param {string} username - Encrypted username
 * @returns {boolean} Success status
 */
export function saveUserCredentials(email, childName, username) {
  try {
    const credentials = {
      email: email.toLowerCase().trim(),
      childName: childName.trim(),
      username,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('leadis_user_credentials', JSON.stringify(credentials));
    return true;
  } catch (error) {
    console.error('Error saving user credentials:', error);
    return false;
  }
}

/**
 * Clear user credentials from localStorage
 * @returns {boolean} Success status
 */
export function clearUserCredentials() {
  try {
    localStorage.removeItem('leadis_user_credentials');
    return true;
  } catch (error) {
    console.error('Error clearing user credentials:', error);
    return false;
  }
}

/**
 * Check if user is logged in (has valid credentials)
 * @returns {boolean} True if user has credentials
 */
export function isUserLoggedIn() {
  const credentials = getUserCredentials();
  return credentials !== null && credentials.email && credentials.childName && credentials.username;
}
// console.log('Decrypted:', decrypted);
