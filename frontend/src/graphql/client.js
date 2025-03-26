// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// 1. Detect if we're in development mode
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

// 2. If REACT_APP_GRAPHQL_URI is set, use it. Otherwise, if we're in dev, use localhost:5000.
//    In production (if no env var is set), fallback to a relative URL /graphql.
const graphqlUri = process.env.REACT_APP_GRAPHQL_URI
  || (isDev ? 'http://localhost:5000/graphql' : '/graphql');

console.log('Using GraphQL endpoint:', graphqlUri);

const httpLink = createHttpLink({
  uri: graphqlUri,
  // If you need credentials (cookies), uncomment:
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
