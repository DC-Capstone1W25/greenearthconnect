import { GraphQLString, GraphQLNonNull } from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserType from '../types/userType.js';
import AuthType from '../types/authType.js';
import User from '../../models/User.js';

/*
mutation {
  registerUser(username: "thedy", email: "thedy@example.com", password: "123456") {
    token
    user {
      _id
      username
      email
    }
  }
}
*/
const registerUser = {
  type: AuthType,
  args: {
    username: { type: new GraphQLNonNull(GraphQLString) },
    email:    { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parent, { username, email, password }) {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with that email');
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the user
    const user = await User.create({ username, email, password: hashedPassword });
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { token, user };
  },
};

/*
mutation {
  loginUser(email: "thedy@example.com", password: "123456") {
    token
    user {
      _id
      username
      email
    }
  }
}
*/
const loginUser = {
  type: AuthType,
  args: {
    email:    { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parent, { email, password }) {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('No user found with that email');
    }
    // Compare passwords
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { token, user };
  },
};

/*
{
  "Authorization": "Bearer <YOUR_TOKEN_HERE>"
}

mutation {
  updateUser(id: "<USER_ID>", username: "thedy_updated", email: "thedy_updated@example.com") {
    _id
    username
    email
  }
}

*/
const updateUser = {
  type: UserType,
  args: {
    id:       { type: new GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLString },
    email:    { type: GraphQLString },
    password: { type: GraphQLString },
  },
  async resolve(parent, { id, username, email, password }, context) {
    // Ensure the user is authenticated
    if (!context.user) {
      throw new Error('Not authenticated');
    }
    // Optionally, enforce that the authenticated user can only update their own record
    if (context.user.userId !== id) {
      throw new Error('Not authorized to update this user');
    }
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    return User.findByIdAndUpdate(id, updateData, { new: true });
  },
};

/*
mutation {
  deleteUser(id: "<USER_ID>") {
    _id
    username
    email
  }
}
*/
const deleteUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parent, { id }, context) {
    // Ensure the user is authenticated
    if (!context.user) {
      throw new Error('Not authenticated');
    }
    // Optionally, enforce that the authenticated user can only delete their own record
    if (context.user.userId !== id) {
      throw new Error('Not authorized to delete this user');
    }
    return User.findByIdAndDelete(id);
  },
};

export default { registerUser, loginUser, updateUser, deleteUser };
