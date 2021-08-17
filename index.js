const path = require('path');
require('dotenv').config({
  path: (typeof process.env.DOTENV_PATH !== 'undefined')
    ? path.resolve(process.cwd(), process.env.DOTENV_PATH)
    : path.resolve(process.cwd(), '.env'),
});

const { ApolloServer, PubSub } = require("apollo-server");

// Error handling
const {
  ERRORS,
  ERROR_AUTHENTICATION_DATA_IS_MISSING,
  errorDescriptor
} = require('./errors');
const { formatError } = require('./errors/formatError');

const EVENTS = require('./src/events');
const { typeDefs } = require('./src/schema');
const bcrypt = require("bcrypt-nodejs");

const checkPassword = require('./src/checkPassword'); 

const users = [
  {
    id: 1,
    username: 'Pero',
    password: '$2a$12$O1TQA8DweDP8RmnU89yHSeGALT.hm6DWBEQQ/iqgsqDO4AAwMhSZa',
    admin: true,
  },
  {
    id: 2,
    username: 'user2',
    password: '$2a$12$jittI0x967FVh0m5DUcWT.W0cn2tiSZx13i.ApKlSqm9ABVEsJV/W',
    admin: false,
  },
];


const resolvers = {
  Subscription: {
    newUser: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(EVENTS.NEW_USER)
    }
  },
  User: {
    firstLetterOfUsername: parent => {
      return parent.username ? parent.username[0] : null;
    }
    // username: parent => { return parent.username;
    // }
  },
  Query: {
    hello: (parent, { name }) => {
      return `hey ${name}`;
    },
    user: () => ({
      id: 1,
      username: "tom"
    }),
    errorLogs: () => ([
      {
        field: "username",
        message: "bad"
      },
      {
        field: "username2",
        message: "bad2"
      }
    ])
  },
  Mutation: {
    login: async (parent, { userInfo: { username, password } }, context) => {
      // check the password
      const result = await checkPassword(username, password, users);

      if (!result) {
        throw new Error(errorDescriptor(ERROR_AUTHENTICATION_DATA_IS_MISSING));
      } else {
        return EVENTS.LOGIN_SUCCESS;
      }

    },
    register: (_, { userInfo: { username, password } }, { pubsub }) => {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      const user = {
        id: 1,
        username: username,
        password: password        
      };

      users.push(user);

      pubsub.publish(EVENTS.NEW_USER, {
        newUser: user
      });

      return EVENTS.REGISTRATION_SUCCESS;
      
    }
  }
};

const pubsub = new PubSub();

const timer = setInterval(() => {
  pubsub.publish(EVENTS.PING, {
    listenForPing: `${Date.now()}`,
  });
}, 3000);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub }),
  // customFormatErrorFn: formatError,
  formatError,
});

const port = process.env.PORT;
server.listen(port)
  .then(({ url }) => console.log(`Server started at ${url}`));
