import type { ApiError } from '@tietokilta/ilmomasiina-components';
import type {
  UserChangePasswordSchema, UserID, UserInviteSchema, UserListResponse,
} from '@tietokilta/ilmomasiina-models';
import adminApiFetch from '../../api';
import type { DispatchAction, GetState } from '../../store/types';
import { RESET, USERS_LOAD_FAILED, USERS_LOADED } from './actionTypes';

export const resetState = () => <const>{
  type: RESET,
};

export const usersLoaded = (users: UserListResponse) => <const>{
  type: USERS_LOADED,
  payload: users,
};

export const usersLoadFailed = (error: ApiError) => <const>{
  type: USERS_LOAD_FAILED,
  payload: error,
};

export type AdminUsersActions =
  | ReturnType<typeof usersLoaded>
  | ReturnType<typeof usersLoadFailed>
  | ReturnType<typeof resetState>;

export const getUsers = () => async (dispatch: DispatchAction, getState: GetState) => {
  const { accessToken } = getState().auth;
  try {
    const response = await adminApiFetch('admin/users', { accessToken }, dispatch);
    dispatch(usersLoaded(response as UserListResponse));
  } catch (e) {
    dispatch(usersLoadFailed(e as ApiError));
  }
};

export const createUser = (data: UserInviteSchema) => async (dispatch: DispatchAction, getState: GetState) => {
  const { accessToken } = getState().auth;

  await adminApiFetch('admin/users', {
    accessToken,
    method: 'POST',
    body: data,
  }, dispatch);
};

export const deleteUser = (id: UserID) => async (dispatch: DispatchAction, getState: GetState) => {
  const { accessToken } = getState().auth;

  await adminApiFetch(`admin/users/${id}`, {
    accessToken,
    method: 'DELETE',
  }, dispatch);
};

export const resetUserPassword = (id: UserID) => async (dispatch: DispatchAction, getState: GetState) => {
  const { accessToken } = getState().auth;

  await adminApiFetch(`admin/users/${id}/resetpassword`, {
    accessToken,
    method: 'POST',
  }, dispatch);
};

export const changePassword = (data: UserChangePasswordSchema) => async (
  dispatch: DispatchAction,
  getState: GetState,
) => {
  const { accessToken } = getState().auth;

  await adminApiFetch('admin/users/self/changepassword', {
    accessToken,
    method: 'POST',
    body: data,
  }, dispatch);
};
