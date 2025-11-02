import { ApiError } from "@tietokilta/ilmomasiina-client";
import type {
  UserChangePasswordSchema,
  UserID,
  UserInviteSchema,
  UserListResponse,
} from "@tietokilta/ilmomasiina-models";
import adminApiFetch from "../../api";
import storeSlice from "../../utils/storeSlice";
import type { Root } from "../store";

export interface AdminUsersState {
  users: UserListResponse | null;
  loadError?: ApiError;
}

const initialState: AdminUsersState = {
  users: null,
};

export type AdminUsersSlice = AdminUsersState & {
  resetState: () => void;
  getUsers: () => Promise<void>;
  createUser: (data: UserInviteSchema) => Promise<void>;
  deleteUser: (id: UserID) => Promise<void>;
  resetUserPassword: (id: UserID) => Promise<void>;
  changePassword: (data: UserChangePasswordSchema) => Promise<void>;
};

export const adminUsersSlice = storeSlice<Root>()("adminUsers", (set, get, store, getSlice, setSlice, resetState) => ({
  ...initialState,
  resetState,

  getUsers: async () => {
    const { accessToken } = get().auth;
    try {
      const response = await adminApiFetch<UserListResponse>("admin/users", { accessToken });
      setSlice({ users: response, loadError: undefined });
    } catch (e) {
      setSlice({ users: null, loadError: e as ApiError });
    }
  },

  createUser: async (data: UserInviteSchema) => {
    const { accessToken } = get().auth;
    await adminApiFetch("admin/users", {
      accessToken,
      method: "POST",
      body: data,
    });
  },
  deleteUser: async (id: UserID) => {
    const { accessToken } = get().auth;
    await adminApiFetch(`admin/users/${id}`, {
      accessToken,
      method: "DELETE",
    });
  },

  resetUserPassword: async (id: UserID) => {
    const { accessToken } = get().auth;
    await adminApiFetch(`admin/users/${id}/resetpassword`, {
      accessToken,
      method: "POST",
    });
  },
  changePassword: async (data: UserChangePasswordSchema) => {
    const { accessToken } = get().auth;
    await adminApiFetch("admin/users/self/changepassword", {
      accessToken,
      method: "POST",
      body: data,
    });
  },
}));
