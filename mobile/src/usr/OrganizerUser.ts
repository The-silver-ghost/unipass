import { API_BASE_URL } from '../config';
import { User } from './User';

export class OrganizerUser implements User {
    id?: string;
    role = "organizer"; 
    name: string; // This maps to the Club / Society Name in Stage 2
    email: string;
    passwordHash: string;

    constructor(name: string, email: string, passwordHash: string) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    async saveToDatabase(): Promise<void> {
        console.log(`[Web Client Test] Sending organizer payload to backend...`);
        const backendUrl = `${API_BASE_URL}/register`; 

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: this.role,
                    name: this.name, // Will be inserted into full_name in the DB
                    email: this.email,
                    password: this.passwordHash
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error code: ${response.status}`);
            }

            const responseData = await response.json();
            console.log(`[Web Client Test] Success Response from Server:`, responseData);
            this.id = responseData.userId;

        } catch (error: any) {
            console.error(`[Organizer Network Error] Details:`, error.message);
            if (typeof alert !== 'undefined') alert(`Registration failed: ${error.message}`);
            throw error;
        }
    }
}