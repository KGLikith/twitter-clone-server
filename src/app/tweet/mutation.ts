export const mutations = `#graphql
    createTweet(payload: CreateTweetData!): Tweet
    LikeTweet(tweetId: ID!): Boolean
    UnlikeTweet(tweetId: ID!): Boolean
    deleteTweet(tweetId: ID!): Boolean
    createComment(payload: CreateCommentData!): Comment
    deleteComment(commentId: ID!): Boolean
    likeComment(commentId: ID!): Boolean
    unlikeComment(commentId: ID!): Boolean
`