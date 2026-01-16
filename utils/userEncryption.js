import crypto from 'crypto';

/**
 * Encrypts user email and name using AES-128-CBC algorithm
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {string} Encrypted username for database creation
 */
export function generateEncryptedUsername(email, name) {
  // Secret key for AES-128 (16 bytes = 128 bits)
  // In production, store this securely in environment variables
  const SECRET_KEY = process.env.ENCRYPTION_KEY || 'LeadisSecretKey1'; // Must be exactly 16 bytes
  
  // Ensure key is exactly 16 bytes for AES-128
  const key = Buffer.from(SECRET_KEY.padEnd(16, '0').substring(0, 16));
  
  // Generate initialization vector (IV) - 16 bytes for AES
  const iv = crypto.randomBytes(16);
  
  // Combine email and name
  const userData = `${email}|${name}`;
  
  // Create cipher with AES-128-CBC
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(userData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combine IV and encrypted data (IV is needed for decryption)
  const encryptedUsername = iv.toString('hex') + ':' + encrypted;
  
  return encryptedUsername;
}

/**
 * Decrypts the encrypted username back to email and name
 * @param {string} encryptedUsername - The encrypted username
 * @returns {object} Object containing email and name
 */
export function decryptUsername(encryptedUsername) {
  // Secret key for AES-128 (must match the one used for encryption)
  const SECRET_KEY = process.env.ENCRYPTION_KEY || 'LeadisSecretKey1';
  
  // Ensure key is exactly 16 bytes for AES-128
  const key = Buffer.from(SECRET_KEY.padEnd(16, '0').substring(0, 16));
  
  // Split IV and encrypted data
  const parts = encryptedUsername.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  
  // Decrypt the data
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  // Split back into email and name
  const [email, name] = decrypted.split('|');
  
  return { email, name };
}

/**
 * Generates a shorter hash-based username (alternative approach)
 * This creates a deterministic username from email and name
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {string} Hash-based username (32 characters)
 */
export function generateHashedUsername(email, name) {
  const userData = `${email}|${name}`;
  const hash = crypto.createHash('sha256').update(userData).digest('hex');
  return hash.substring(0, 32); // Return first 32 characters
}

// Example usage:
// const username = generateEncryptedUsername('user@example.com', 'John Doe');
// console.log('Encrypted Username:', username);
// const decrypted = decryptUsername(username);
// console.log('Decrypted:', decrypted);
