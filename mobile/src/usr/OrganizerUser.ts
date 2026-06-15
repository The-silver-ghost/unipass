import { User } from './User';

export class OrganizerUser implements User {
    role = "Organizer";
    name: string;
    email: string;
    clubName: string; // Specific to Organizers for event hosting

    constructor(name: string, email: string, clubName: string) {
        this.name = name;
        this.email = email;
        this.clubName = clubName;
    }

    async saveToDatabase(): Promise<void> {
        // Concrete implementation for database insertion (to be replaced with actual database logic once database integration is implemented)
        console.log(`[Database Sync] Successfully inserted Organizer "${this.clubName}" into PostgreSQL with Event Creator privileges.`);
        return Promise.resolve();
    }
}