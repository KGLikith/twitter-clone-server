import Redis from "ioredis"

const redisClient = new Redis("rediss://default:AWhnAAIjcDE0ZDFiNDE4NDdlMzg0N2Q1YjM2YmNiNTM0ZjMxY2Y0NXAxMA@humorous-stag-26727.upstash.io:6379");

export default redisClient;