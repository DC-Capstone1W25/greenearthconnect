// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Determine the GraphQL URI:
// If REACT_APP_GRAPHQL_URI is set (at build time), use that.
// Otherwise, if running in a browser, use the current origin.
const graphqlUri =
  process.env.REACT_APP_GRAPHQL_URI ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}/graphql`
    : '/graphql');

console.log('Using GraphQL endpoint:', graphqlUri);

const httpLink = createHttpLink({
  uri: graphqlUri,
  // Optionally, set fetchOptions if you need to include credentials
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
