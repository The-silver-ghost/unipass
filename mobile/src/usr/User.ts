export interface User {
    role: string;
    name: string;
    email: string;
    
    saveToDatabase(): Promise<void>;
}