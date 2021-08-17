const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    hello(name: String): String
    user: User
    errorLogs: [Error!]!
  }

  type User {
    id: ID!
    username: String
    password: String
    firstLetterOfUsername: String
  }

  type Error {
    field: String!
    message: String!
  }

  type RegisterResponse {
    user: User
  }

  input UserInfo {
    username: String!
    password: String!
    age: Int
  }

  type Mutation {
    register(userInfo: UserInfo!): RegisterResponse!
    login(userInfo: UserInfo!): String!
  }

  type Subscription {
    newUser: User!
  }
`;

module.exports = {
  typeDefs,
};
