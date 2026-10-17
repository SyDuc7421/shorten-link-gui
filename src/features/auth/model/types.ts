import { z } from 'zod';

export const tokenPairSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
});

/** Password length the API accepts (bcrypt's limit), counted in UTF-8 bytes. */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX_BYTES = 72;

/** Accented letters and emoji take 2–4 bytes, so 40 characters can already be too long. */
export function isPasswordWithinMax(password: string) {
  return new TextEncoder().encode(password).length <= PASSWORD_MAX_BYTES;
}

export type TokenPair = z.infer<typeof tokenPairSchema>;

export interface Credentials {
  email: string;
  password: string;
}
