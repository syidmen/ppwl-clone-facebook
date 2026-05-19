import type { UserDTO } from "@ppwl/shared";
import { googleLogin, login, register, updateMe } from "./auth.api";

type LoginBody = {
  email: string;
  password: string;
};

type RegisterBody = {
  name: string;
  username: string;
  email: string;
  password: string;
};

type AuthResult = {
  user: UserDTO;
  accessToken: string;
};

type UpdateProfileBody = {
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  password?: string;
};

function toAuthResult(result: { user: UserDTO; token: string }): AuthResult {
  return {
    user: result.user,
    accessToken: result.token,
  };
}

export async function loginUser(body: LoginBody): Promise<AuthResult> {
  return toAuthResult(await login(body));
}

export async function registerUser(body: RegisterBody): Promise<AuthResult> {
  return toAuthResult(await register(body));
}

export async function loginWithGoogle(token: string): Promise<AuthResult> {
  return toAuthResult(await googleLogin(token));
}

export async function updateProfile(
  token: string,
  body: UpdateProfileBody,
): Promise<UserDTO> {
  if (!token) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  return updateMe(token, body);
}
