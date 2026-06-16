import { API_BASE_URL } from '../config';
import { User } from './User';

export class StudentUser implements User {
    role = "student";
    name: string;
    email: string;
    studentID: string; // Specific to Students for tracking attendance
    passwordHash: string; 

    constructor(name: string, email: string, studentID: string, passwordHash: string) {
        this.name = name;
        this.email = email;
        this.studentID = studentID;
        this.passwordHash = passwordHash;
    }

    async saveToDatabase(): Promise<void> {
        console.log(`[PostgreSQL Pipeline] Initializing write context for: ${this.email}`);

        const backendUrl =  `${API_BASE_URL}/register`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); 

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: this.role,
                    name: this.name,
                    email: this.email,
                    studentID: this.studentID,
                    password: this.passwordHash
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error code: ${response.status}`);
            }

            const responseData = await response.json();
            console.log(`[Web Client Test] Success Response from Server:`, responseData);

        } catch (error: any) {
            console.error(`[Network Error] Details:`, error.message);
            // This will trigger an alert box right in your web browser interface
            alert(`Connection to server failed: ${error.message}`);
            throw error;
        }
    }
}

