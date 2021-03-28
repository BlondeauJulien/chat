const bcrypt = require('bcryptjs');
const { UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User } = require('../models');
const { JWT_SECRET } = require('../config/env.json');

module.exports = {
  Query: {
    getUsers: async(parent, args, context) => {

      try {
        let user;
        
        if(context.req && context.req.headers.authorization) {
          const token = context.req.headers.authorization.split('Bearer ')[1];
          jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if(err) {
              throw new AuthenticationError('Unauthenticated');
            }
            user = decodedToken;
  
            console.log(user);
          });
        }

        const users = await User.findAll({
          where: { username: {[Op.ne ]: user.username }}
        });
        
        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (parent, args) => {
      const { username, password } = args;
      let errors = {};

      try {
        if(username.trim() === '') errors.username = 'username must not be empty';
        if(password === '') errors.password = 'password must not be empty';

        if(Object.keys(errors).length > 0) {
          throw new UserInputError('bad input', { errors });
        }

        const user = await User.findOne({
          where: { username }
        });

        if(!user) {
          errors.username = 'user not found';
          throw new UserInputError('user not found', { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if(!correctPassword) {
          errors.password = 'password is incorrect';
          throw new AuthenticationError('password is incorrect', { errors });
        }

        const token = jwt.sign({username}, JWT_SECRET, { expiresIn: 60 * 60});

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
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