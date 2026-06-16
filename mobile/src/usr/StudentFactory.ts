import { User } from './User';
import { UserFactory } from './UserFactory';
import { StudentUser } from './StudentUser';

export class StudentFactory extends UserFactory {
    createUser(data: any): User {
        // Enforce basic registration constraints before generating data streams
        if (!data.name || !data.email) {
            throw new Error("Validation Error: Profile parameters 'name' and 'email' cannot be blank.");
        }
        if (!data.studentID) {
            throw new Error("Validation Error: 'studentID' field must be provided for student profile routing.");
        }
        if (!data.password) {
            throw new Error("Validation Error: Password credentials are required for account generation.");
        }

        // Return a fresh concrete object prepared to make a database execution call
        return new StudentUser(data.name, data.email, data.studentID, data.password);
    }
}