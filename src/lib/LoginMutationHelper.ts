"use client";

import { ApolloClient, useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from './Mutations';
import { ApolloLink, HttpLink } from "@apollo/client";
import {
NextSSRApolloClient,
ApolloNextAppProvider,
NextSSRInMemoryCache,
SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";


export const PerformLoginMutation = async ({ email, password }) => {
  console.log(email);

function makeClient() {
  const httpLink = new HttpLink({
      // uri: "https://main--time-pav6zq.apollographos.net/graphql",
      uri: "http://localhost:4000/",
  });

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  });
}
makeClient()





  const [login] = useMutation(LOGIN_MUTATION);

  try {
    const response = await login({
      variables: {
        email: email,
        password: password,
      },
    });

    if (response?.data?.login) {
      // La mutation de login s'est bien déroulée
      return response.data.login;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};
