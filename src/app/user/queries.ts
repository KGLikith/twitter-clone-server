export const queries=`#graphql
    verifyGoogleToken(token: String!): String
    getCurrentUser: User

    getCurrentUserById(id:ID!): User
`