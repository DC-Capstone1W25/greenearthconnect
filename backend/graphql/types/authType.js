import { GraphQLObjectType, GraphQLString } from 'graphql';
import UserType from './userType.js';

const AuthType = new GraphQLObjectType({
  name: 'Auth',
  fields: () => ({
    token: { type: GraphQLString },
    user: { type: UserType },
  }),
});

export default AuthType;
