export const queries=`#graphql
    getAllTweets: [Tweet]
    getTweet(id: ID!): Tweet
    getUserTweets(userId: ID!): [Tweet]
    getSignedURLForTweet(imageName:String!,imageType: String!): String
`