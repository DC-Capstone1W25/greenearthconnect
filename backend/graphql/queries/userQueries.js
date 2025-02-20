// backend/graphql/queries/userQueries.js
import { GraphQLList, GraphQLID } from 'graphql';
import UserType from '../types/userType.js';
import User from '../../models/User.js';

const userQueries = {
  // Query to get all users
  /*
  query {
    getUsers {
      _id
      username
      email
    }
  }
  */
  getUsers: {
    type: new GraphQLList(UserType),
    resolve(parent, args) {
      return User.find({});
    },
  },
  // Query to get a user by ID
  /*
  query {
    getUser(id: "<USER_ID>") {
      _id
      username
      email
    }
  }
  */
  getUser: {
    type: UserType,
    args: { id: { type: GraphQLID } },
    resolve(parent, args) {
      return User.findById(args.id);
    },
  },
};  

export default userQueries;
