// Toggle this switch depending on where you are testing:
const ENVIRONMENT = 'android-emulator';

const ENVIRONMENT = process.env.EXPO_PUBLIC_ENVIRONMENT || 'physical-device';
const COMP_IP = process.env.EXPO_PUBLIC_COMP_IP || '192.168.0.208';

let API_BASE_URL = 'http://localhost:5000/api';

if (ENVIRONMENT === 'android-emulator') {
    API_BASE_URL = 'http://10.0.2.2:5000/api';
} 
else if (ENVIRONMENT === 'physical-device') {
    API_BASE_URL = `http://${COMP_IP}:5000/api`;
}

export { API_BASE_URL };