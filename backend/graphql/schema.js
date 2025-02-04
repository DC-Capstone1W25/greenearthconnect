import { GraphQLObjectType, GraphQLSchema } from 'graphql';


const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields:{
    // ...put other Queries here
  },
  
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {

    // ...put other Mutations here
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation, 
})