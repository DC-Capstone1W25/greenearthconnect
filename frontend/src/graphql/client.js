// frontend/src/graphql/client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const isDev = process.env.NODE_ENV !== 'production';
const baseURL = process.env.REACT_APP_BACKEND_URL || (isDev ? 'http://localhost:5000' : '');
const graphqlUri = `${baseURL}/graphql`;

console.log('Using GraphQL endpoint:', graphqlUri);

const httpLink = createHttpLink({ uri: graphqlUri });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: { ...headers, Authorization: token ? `Bearer ${token}` : '' },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
