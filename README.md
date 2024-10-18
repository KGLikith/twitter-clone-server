# Overview
## Features

- **User Authentication**: Secure authentication using jwt.
- **Data Management**: Utilizes Prisma ORM for efficient database interactions.
- **Caching**: Employs Redis for caching, enhancing performance and response times.
- **Image Storage**: Integrates with AWS S3 for secure storage and retrieval of images.
- **Real-time Updates**: Potential for real-time interactions and notifications.

## Technologies Used

- **GraphQL**: API for flexible data querying and manipulation.
- **Apollo Client**: Manages GraphQL queries and mutations.
- **Prisma**: Database ORM for managing data and migrations.
- **Redis**: Caching solution for improved performance.
- **AWS S3**: Used for storing uploaded images.

## Go to [twitter-clone-client](https://github.com/KGLikith/twitter-clone-client) and to check out the demo

# Run It Locally

### Clone this repository
```
git clone https://github.com/KGLikith/twitter-clone-server.git
```

Add the environment variables to .env

```bash
DATABASE_URL= postgres-db-url
JWT_SECRET= Secret
AWS_ACCESS_KEY_ID= aws-access-key
AWS_SECRET_ACCESS_KEY= aws-access-key-secret
AWS_DEFAULT_REGION= aws-access-region
S3_BUCKET_NAME= aws-s3-bucket-for-storage
REDIS_URL=- upstash-redis-url
```

Then run 
```
npx prisma migrate dev --name some_name
```

Then run
```bash
npm run dev
```

Go to [twitter-clone-client](https://github.com/KGLikith/twitter-clone-client) and follow the instructions
