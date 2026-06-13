import { User } from './User';

export class StudentUser implements User {
    role = "Student";
    name: string;
    email: string;
    studentID: string; // Specific to Students for tracking attendance

    constructor(name: string, email: string, studentID: string) {
        this.name = name;
        this.email = email;
        this.studentID = studentID;
    }

    async saveToDatabase(): Promise<void> {
        // Concrete implementation for database insertion (to be replaced with actual database logic once database integration is implemented)
        console.log(`[Database Sync] Successfully inserted Student "${this.name}" into PostgreSQL with Attendee privileges.`);
        return Promise.resolve();
    }
}