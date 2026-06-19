import { pauseDebug } from '../utils/debugPause';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer';
}

class UserSession {
  private user: SessionUser | null = null;

  public async setUser(user: SessionUser) {
    this.user = user;
    console.log(`[UserSession] Active user session set for: ${user.name} (${user.role})`);
    await pauseDebug({
      pattern: "Singleton Pattern (User Session)",
      action: "Accessing and setting global state on UserSession singleton instance",
      sessionUser: user
    });
  }

  public getUser(): SessionUser | null {
    return this.user;
  }

  public clear() {
    this.user = null;
    console.log(`[UserSession] User session cleared`);
  }
}

export const userSession = new UserSession();
