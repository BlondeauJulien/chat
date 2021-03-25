const bcrypt = require('bcryptjs');
const { UserInputError } = require('apollo-server');

const { User } = require('../models');

module.exports = {
  Query: {
    getUsers: async() => {
      try {
        const users = await User.findAll();
        
        return users;
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    register: async (parent, args, context, info) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {}

      try {
        if(email.trim() === '') errors.email = 'Email must not be empty';
        if(username.trim() === '') errors.username = 'Email must not be empty';
        if(password.trim() === '') errors.password = 'Email must not be empty';
        if(confirmPassword.trim() === '') errors.confirmPassword = 'Email must not be empty';
        if(confirmPassword !== password) errors.confirmPassword = 'Your password doesn\'t match the confirmation';

/*         const userByUsername = await User.findOne({ where: { username }});
        const userByEmail = await User.findOne({ where: { email }});

        if(userByUsername) errors.username = 'User already exist';
        if(userByEmail) errors.email = 'An account already exist with this email'; */



        if(Object.keys(errors).length > 0) {
          throw errors
        }

        password = await bcrypt.hash(password, 12)

        const user = await User.create({
          username, email, password
        });

        return user;

      } catch (err) {
        console.log(err)
        if (err.name === 'SequelizeUniqueConstraintError') {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} is already taken`)
          )
        } else if (err.name === 'SequelizeValidationError') {
          err.errors.forEach((e) => (errors[e.path] = e.message))
        }
        throw new UserInputError('Bad input', { errors })
      }
    }
  }
};