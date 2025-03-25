// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Use environment variable for the GraphQL URI; fallback to a relative path
const graphqlUri = process.env.REACT_APP_GRAPHQL_URI || '/graphql';
console.log('Using GraphQL endpoint:', graphqlUri);

// Create an HTTP link with optional credentials (adjust if needed)
const httpLink = createHttpLink({
  uri: graphqlUri,
  fetchOptions: {
    credentials: 'include', // include cookies if required; remove if not needed
  },
});

// Middleware to attach JWT token from localStorage
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
