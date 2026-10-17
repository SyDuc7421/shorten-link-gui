import { z } from 'zod';

export const tokenPairSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
});

export type TokenPair = z.infer<typeof tokenPairSchema>;

export interface Credentials {
  email: string;
  password: string;
}
