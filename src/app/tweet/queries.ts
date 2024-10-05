export const queries=`#graphql
    getAllTweets: [Tweet],
    getTweet(id: ID!): Tweet
    getSignedURLForTweet(imageName:String!,imageType: String!): String
`