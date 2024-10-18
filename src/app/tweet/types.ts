export const types=`#graphql
    input CreateTweetData {
        content: String!
        imageUrl: String
    }
    input CreateCommentData
    {
        content: String!
        tweetId: ID!
    }
    type Comment {
        id: ID!
        content: String!
        tweet: Tweet!
        likes: [String]
        user: User!
    }
    type Tweet {
        id: ID!
        content: String!
        imageUrl: String
        user: User!
        comments: [Comment]!
        likes: [String]!
    }
`