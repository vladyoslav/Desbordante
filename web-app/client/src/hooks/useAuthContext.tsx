import { useLazyQuery } from '@apollo/client';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@components/AuthContext';
import {
  getUser,
  getUserVariables,
} from '@graphql/operations/queries/__generated__/getUser';
import { GET_USER } from '@graphql/operations/queries/getUser';

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('Cannot use auth context');
  }
  return ctx;
};

export const useUserDatasets = () => {
  const { user } = useAuthContext();
  const [userDatasets, setUserDatasets] = useState(user?.datasets || []);
  const [getUser] = useLazyQuery<getUser, getUserVariables>(GET_USER);
  useEffect(() => {
    if (!user?.id) return;
    getUser({
      variables: { userID: user.id! },
    }).then((res) => {
      setUserDatasets(res.data?.user?.datasets || []);
    });
  }, [user?.id]);
  return { userDatasets, setUserDatasets };
};
