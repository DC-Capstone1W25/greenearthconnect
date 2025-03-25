// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Use an environment variable for the GraphQL endpoint
// Fallback to a relative URL if not defined.
const graphqlUri = process.env.REACT_APP_GRAPHQL_URI || '/graphql';
console.log('Using GraphQL endpoint:', graphqlUri);

const httpLink = createHttpLink({
  uri: graphqlUri,
  // If you don't need cookies or other credentials, remove fetchOptions
  // fetchOptions: { credentials: 'include' },
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
