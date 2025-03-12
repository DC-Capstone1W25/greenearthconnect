// frontend/src/graphql/mutations.js
import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const REGISTER_USER =
  gql`
  mutation registerUser($username: String!, $email: String!, $password: String!) {
    registerUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser(
    $id: String!
    $username: String
    $email: String
    $password: String
  ) {
    updateUser(id: $id, username: $username, email: $email, password: $password) {
      _id
      username
      email
    }
  }
`;