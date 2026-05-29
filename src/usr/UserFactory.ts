export interface User {
    role: string;
    name: string;
    email: string;
    saveToDatabase(): Promise<void>; 
}

export class StudentUser implements User {
    role = "Student";
    name: string;
    email: string;
    studentID: string; // Student-specific attribute mandatory for UniPass

    constructor(name: string, email: string, studentID: string) {
        this.name = name;
        this.email = email;
        this.studentID = studentID;
    }

    async saveToDatabase(): Promise<void> {
        console.log(`[Database Sync] Saving Student "${this.name}" (ID: ${this.studentID}) to PostgreSQL with Attendee permissions.`);
        return Promise.resolve(); // To be replaced with actual database logic once database integration is implemented.
    }
}

export class OrganizerUser implements User {
    role = "Organizer";
    name: string;
    email: string;
    clubName: string; // Organizer-specific attribute mandatory for UniPass

    constructor(name: string, email: string, clubName: string) {
        this.name = name;
        this.email = email;
        this.clubName = clubName;
    }

    async saveToDatabase(): Promise<void> {
        console.log(`[Database Sync] Saving Organizer Club "${this.clubName}" to PostgreSQL with Event Management permissions.`);
        return Promise.resolve(); // To be replaced with actual database logic once database integration is implemented.
    }
}

export abstract class UserFactory {
    // This is the abstract Factory Method that concrete creators must implement (must have)
    abstract createUser(data: any): User;

    async register(data: any): Promise<User> {
        // Delegate instantiation to the subclass factory method
        const user = this.createUser(data);
        
        // Persist the abstract user to the database 
        await user.saveToDatabase();
        
        console.log(`[Factory Logic] ${user.role} registration complete!`);
        return user;
    }
}

export class StudentFactory extends UserFactory {
    createUser(data: any): User {
        if (!data.studentID) {
            throw new Error("Validation Error: Student ID is required for Student Registration.");
        }
        return new StudentUser(data.name, data.email, data.studentID);
    }
}

export class OrganizerFactory extends UserFactory {
    createUser(data: any): User {
        if (!data.clubName) {
            throw new Error("Validation Error: Club Name is required for Organizer Registration.");
        }
        return new OrganizerUser(data.name, data.email, data.clubName);
    }
}

const factoryMap: Record<string, UserFactory> = {
    student: new StudentFactory(),
    organizer: new OrganizerFactory(),
};

export async function handleSignUp(type: string, registrationData: any): Promise<User> {
    const factory = factoryMap[type.toLowerCase()];

    if (!factory) {
        throw new Error(`Invalid registration user type: "${type}"`);
    }
    return await factory.register(registrationData);
}