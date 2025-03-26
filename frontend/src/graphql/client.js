// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// For local dev: fallback to http://localhost:5000/graphql
// For production: if REACT_APP_GRAPHQL_URI is not set, fallback to /graphql
const isDev = process.env.NODE_ENV !== 'production';
const graphqlUri =
  process.env.REACT_APP_GRAPHQL_URI ||
  (isDev ? 'http://localhost:5000/graphql' : '/graphql');

console.log('Using GraphQL endpoint:', graphqlUri);
console.log('NODE_ENV:', process.env.NODE_ENV);

const httpLink = createHttpLink({
  uri: graphqlUri,
  // If you need cookies, uncomment:
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
