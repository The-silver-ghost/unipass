export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer';
}

class UserSession {
  private user: SessionUser | null = null;

  public setUser(user: SessionUser) {
    this.user = user;
    console.log(`[UserSession] Active user session set for: ${user.name} (${user.role})`);
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
