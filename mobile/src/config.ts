// Toggle this switch depending on where you are testing:
// Options: 'web-local' | 'android-emulator' | 'physical-device'
let ENVIRONMENT: string = 'web-local';

// Your computer's local IPv4 address (Only needed if testing on a physical phone via Wi-Fi)
const COMP_IP = '172.20.10.2';

let API_BASE_URL = 'http://localhost:5000/api';

if (ENVIRONMENT === 'android-emulator') {
    API_BASE_URL = 'http://10.0.2.2:5000/api';
}
else if (ENVIRONMENT === 'physical-device') {
    API_BASE_URL = `http://${COMP_IP}:5000/api`;
}

export { API_BASE_URL };