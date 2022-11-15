const { User } = require('../models');

const resolvers = {
  Query: {
    users: async () => {
      // Populate the classes and professor subdocuments when querying for schools
      return await User.find({}).populate('savedBooks')
    },
    user: async (userID) => {
        return await User.findOne({_id: userID}).populate('savedBooks')
    }
  }
};

module.exports = resolvers;
