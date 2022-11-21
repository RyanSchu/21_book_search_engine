const { UserInputError, AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      // Populate the classes and professor subdocuments when querying for schools
      return await User.find({}).populate('savedBooks')
    },
    user: async (userID) => {
        return await User.findOne({_id: userID}).populate('savedBooks')
    },
    me: async (parent, args, context) => {
      console.log('made it')
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      const correctPw = await user.isCorrectPassword(password);

      if (!user || !correctPw) {
        throw new AuthenticationError('Either profile or password is incorrect.');
      }
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    
    // Add a third argument to the resolver to access data in our `context`
    saveBook: async (parent, { authors, description, title, bookId, link}, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks:  { authors, description, title, bookId, link} },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('You need to be logged in!');
    },
    // Set up mutation so a logged in user can only remove their profile and no one else's
    removeBook: async (parent, {bookId}, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $pull: { savedBooks:  { bookId: {$eq: bookId}} },
          },
          {
            new: true,
          }
        );}
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;

// type Mutation {
//   login: Auth
//   addUser: Auth
//   saveBook: User
//   removeBook: User
// }