import type { SignupForEditResponse } from '@tietokilta/ilmomasiina-models';
import { ApiError } from '../../api';
import { createStateContext } from '../../utils/stateContext';

export type State = Partial<SignupForEditResponse> & {
  pending: boolean;
  error?: ApiError;
  editToken: string;
  registrationClosed: boolean;
};

export const { Provider, useStateContext, createThunk } = createStateContext<State>();
