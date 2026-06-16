import { User } from './User';
import { UserFactory } from './UserFactory';
import { StudentFactory } from './StudentFactory';
import { OrganizerFactory } from './OrganizerFactory';

// Map identifying strings to initialized concrete factories
const factoryRegistry: Record<string, UserFactory> = {
    student: new StudentFactory(),
    organizer: new OrganizerFactory()
};

/**
 * Controller endpoint handler for processing new user account registrations.
 * @param roleType - The type of user requesting sign-up ("student" or "organizer")
 * @param registrationPayload - The object literal containing form parameters
 */
export async function handleRegistration(roleType: string, registrationPayload: any): Promise<User> {
    const activeFactory = factoryRegistry[roleType.toLowerCase()];

    // Fail early if an invalid or unsupported role type is requested
    if (!activeFactory) {
        throw new Error(`Controller Route Error: Unsupported registration type: "${roleType}"`);
    }

    const newUser = await activeFactory.register(registrationPayload);
    
    return newUser;
}