import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import client from '../lib/apolloClient'; // Importez le client Apollo
import { gql } from '@apollo/client';



export const authOptions: NextAuthOptions = {
    
    session: {
    strategy: "jwt",
    maxAge: 1800, //30 min
},
providers: [
    CredentialsProvider({
        name: "Sign in",
        credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
        // Appeler le composant de mutation de connexion avec les informations d'identification
        

        
          if (!credentials?.email || !credentials.password) {
            return null;
          }
  
          const  user = await   client.mutate({
            mutation: gql`
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                  token
                  id
                  lastName
                  name
                  email
                  
                }
              }
          `, // Remplacez par votre mutation GraphQL
            variables: {
              email: credentials.email,
              password: credentials.password,
            },
          }).then((result) => {
            // console.log(result.data);
            return result.data.login
          }).catch((error) => {
            console.error('Error performing login:', error.message); // Affichez le message d'erreur complet
            console.log('Error Details:', error.networkError.result); // Affichez les détails de l'erreur réseau
          
            console.error('Error performing login:', error);
          });
  
         console.log(user);
  
          return {
            token:user.token,
            id:user.id,
              lastName: user.lastName,
              name: user.name,
            email: user.email,
            // randomKey: "Hey cool",
          };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      console.log("Session Callback", { session, token });
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
    jwt: ({ token, user }) => {
      console.log("JWT Callback", { token, user });
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
        };
      }
      return token;
    },
}
};
