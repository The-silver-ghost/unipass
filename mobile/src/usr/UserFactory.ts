import { User } from './User';

export abstract class UserFactory {
    // The core Factory Method to be overridden by subclasses
    abstract createUser(data: any): User;

    async register(data: any): Promise<User> {
        // 1. Instantiate the user polymorphically
        const user = this.createUser(data);
        
        // 2. Centralized business logic (e.g., hashing passwords or generating standard base tokens)
        console.log(`[Factory Workflow] Running security validation & processing rules for ${user.role}...`);
        
        // 3. Persist the abstract user to storage
        await user.saveToDatabase();
        
        console.log(`[Factory Workflow] Lifecycle sequence finished for ${user.role}!`);
        return user;
    }
}