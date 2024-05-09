import React, { ComponentType, useEffect } from 'react';

import { toast } from 'react-toastify';

import { redirectToLogin } from '../modules/auth/actions';
import { useTypedDispatch, useTypedSelector } from '../store/reducers';

export default function requireAuth<P extends {}>(WrappedComponent: ComponentType<P>) {
  const RequireAuth = (props: P) => {
    const dispatch = useTypedDispatch();

    const { accessToken } = useTypedSelector(
      (state) => state.auth,
    );

    const expired = accessToken && accessToken.expiresAt < Date.now();
    const needLogin = expired || !accessToken;

    useEffect(() => {
      if (expired) {
        toast.error('Sisäänkirjautumisesi on vanhentunut. Kirjaudu sisään uudelleen.', {
          autoClose: 10000,
        });
      }
      if (needLogin) {
        dispatch(redirectToLogin());
      }
    }, [needLogin, expired, dispatch]);

    return needLogin ? null : <WrappedComponent {...props} />;
  };

  return RequireAuth;
}
