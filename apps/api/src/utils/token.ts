import { jwt } from '@elysiajs/jwt';

export const jwtConfig = jwt({
  name: 'jwt',
  secret: process.env.JWT_SECRET || 'wN8SD1YJfqqGVPp72snQV8SsmbUDlsu2gotb98gUfO0',
});