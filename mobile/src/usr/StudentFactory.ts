import { User } from './User';
import { UserFactory } from './UserFactory';
import { StudentUser } from './StudentUser';

export class StudentFactory extends UserFactory {
    createUser(data: any): User {
        // Run-time validation check
        if (!data.studentID) {
            throw new Error("Validation Error: 'studentID' field is required to register a Student account.");
        }
        return new StudentUser(data.name, data.email, data.studentID);
    }
}