// client/mutations.js
import { gql } from '@apollo/client';

export const SIGNUP_MUTATION = gql`
  mutation Signup($lastName: String!, $name: String!,$email: String!, $password: String!) {
    signup(lastName: $lastName, name: $name, email: $email, password: $password) {
      token
    }
  }
`;
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;