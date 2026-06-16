import { User } from './User';
import { UserFactory } from './UserFactory';
import { OrganizerUser } from './OrganizerUser';

export class OrganizerFactory extends UserFactory {
    createUser(data: any): User {
        // Enforce validations specific to organizers
        if (!data.name || !data.email || !data.password) {
            throw new Error("Validation Error: Please fill up all required fields for your club profile.");
        }
        
        // Return a fresh Organizer object prepared to make a network execution call
        return new OrganizerUser(data.name, data.email, data.password);
    }
}