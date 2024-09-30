export const types=`#graphql
    input CreateTweetData {
        content: String!
        imageUrl: String
    }
    type Tweet {
        id: ID!
        content: String!
        imageUrl: String
        user: User!
    }
`