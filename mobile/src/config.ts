// src/config.ts
// Centralized configuration that pulls from environment variables

const ENVIRONMENT = process.env.EXPO_PUBLIC_ENVIRONMENT || 'web-local';
const COMP_IP = process.env.EXPO_PUBLIC_COMP_IP || 'localhost';

let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

if (!process.env.EXPO_PUBLIC_API_URL) {
  if (ENVIRONMENT === 'android-emulator') {
    API_BASE_URL = 'http://10.0.2.2:5000/api';
  } else if (ENVIRONMENT === 'physical-device') {
    API_BASE_URL = `http://${COMP_IP}:5000/api`;
  }
}

export { API_BASE_URL };
