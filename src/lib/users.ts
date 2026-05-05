export interface User {
  username: string;
  passwordHex: string;
}

export const USERS: User[] = [
  { username: 'admin', passwordHex: 'a1b2c3d4' },
  { username: 'user1', passwordHex: '112233aa' },
  { username: 'guest', passwordHex: '00000000' },
];

export function validateUserCredentials(username: string, passwordHex: string): boolean {
  return USERS.some(u => u.username === username && u.passwordHex === passwordHex);
}
