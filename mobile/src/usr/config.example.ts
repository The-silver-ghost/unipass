// src/config.example.ts
// PLACEHOLDER TEMPLATE: Copy this file, rename it to 'config.ts', and adjust your settings.

const ENVIRONMENT: 'web-local' | 'android-emulator' | 'physical-device' = 'web-local';

const COMP_IP = '192.168.1.XX'; // Put your local machine IP here if using a physical device

let API_BASE_URL = 'http://localhost:5000/api';

if (ENVIRONMENT === 'android-emulator') {
    API_BASE_URL = 'http://10.0.2.2:5000/api';
} else if (ENVIRONMENT === 'physical-device') {
    API_BASE_URL = `http://${COMP_IP}:5000/api`;
}

export { API_BASE_URL };