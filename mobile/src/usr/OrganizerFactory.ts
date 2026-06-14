import { User } from './User';
import { UserFactory } from './UserFactory';
import { OrganizerUser } from './OrganizerUser';

export class OrganizerFactory extends UserFactory {
    createUser(data: any): User {
        // Run-time validation check
        if (!data.clubName) {
            throw new Error("Validation Error: 'clubName' field is required to register an Organizer account.");
        }
        return new OrganizerUser(data.name, data.email, data.clubName);
    }
}    