// backend/graphql/index.js
import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import userQueries from './queries/userQueries.js';
import userMutations from './mutations/userMutations.js';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    ...userQueries, 
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...userMutations, 
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
