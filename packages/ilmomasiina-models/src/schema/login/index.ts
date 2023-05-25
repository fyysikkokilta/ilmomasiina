import { Static, Type } from '@sinclair/typebox';

/** Request body for login. */
export const adminLoginBody = Type.Object({
  email: Type.String({
    description: 'Email address.',
  }),
  password: Type.String({
    description: 'Plaintext password.',
  }),
});
export const adminRenewTokenBody = Type.Object({
  accessToken: Type.String({
    description: 'JWT access token. Used in `Authorization` header to authorize requests.',
  }),
});
/** Response schema for a successful login. */
export const adminLoginResponse = Type.Object({
  accessToken: Type.String({
    description: 'JWT access token. Used in `Authorization` header to authorize requests.',
  }),
});

/** Request body for login. */
export type AdminLoginBody = Static<typeof adminLoginBody>;
/** Request body for renewLogin */
export type AdminRenewLoginBody = Static<typeof adminRenewTokenBody>;
/** Response schema for a successful login. */
export type AdminLoginResponse = Static<typeof adminLoginResponse>;
