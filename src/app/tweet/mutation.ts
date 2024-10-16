export const mutations = `#graphql
    createTweet(payload: CreateTweetData!): Tweet
    LikeTweet(tweetId: ID!): Boolean
    UnlikeTweet(tweetId: ID!): Boolean
    deleteTweet(tweetId: ID!): Boolean
`