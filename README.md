# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

# curl

```sh
# get Posts
$ curl -X POST -H "Content-Type:application/graphql" -H "x-api-key:${X_API_KEY}" -d '{ "query": "query { posts { id } }" }' ${GRAPHQL_API_ENDPOINT} | jq
```

```sh
# Get Post
$ curl -X POST -H "Content-Type:application/graphql" -H "x-api-key:${X_API_KEY}" -d '{ "query": "query { post(id: \"0001\") { id } }" }' ${GRAPHQL_API_ENDPOINT} | jq
```

```sh
# Create Post
$ curl -X POST -H "Content-Type:application/graphql" -H "x-api-key:${X_API_KEY}" -d '{ "query": "mutation createPost{ createPost(post: {id: \"0001\", title: \"hello\", create_time: \"\"}){id}}" }' ${GRAPHQL_API_ENDPOINT} | jq
```

```sh
# Update Post
$ curl -X POST -H "Content-Type:application/graphql" -H "x-api-key:${X_API_KEY}" -d '{ "query": "mutation updatePost{ updatePost(post: {id: \"0001\", title: \"hello\", create_time: \"\"}){id}}" }' ${GRAPHQL_API_ENDPOINT} | jq
```

```sh
# Delete
$ curl -X POST -H "Content-Type:application/graphql" -H "x-api-key:${X_API_KEY}" -d '{ "query": "mutation deletePost{ deletePost(id: \"0001\"){id}}" }' ${GRAPHQL_API_ENDPOINT} | jq
```

# PostMan

URL: Api-Gateway endPoint/resource

Method: Post

header:

- x-api-key: \${x_api_key}

### body

```properties
# posts
{
  "operationName": "query getPosts",
  "queryMethod": "posts",
  "fields": ["id", "title", "create_time"]
}
```

```properties
# post
{
  "operationName": "query getPost($id: ID!)",
  "queryMethod": "post",
  "fields": ["id", "title", "create_time"],
  "variables": {"id": "0001"}
}
```

```properties
# create post
{
  "operationName": "mutation createPost($id: ID!, $title: String, $create_time: String)",
  "queryMethod": "createPost",
  "args": "post",
  "fields": ["id", "title", "create_time"],
  "variables": {"id": "0001", "title": "hello", "create_time": ""}
}
```

```properties
# update post
{
  "operationName": "mutation updatePost($id: ID!, $title: String, $create_time: String)",
  "queryMethod": "updatePost",
  "args": "post",
  "fields": ["id", "title", "create_time"],
  "variables": {"id": "0001", "title": "update", "create_time": ""}
}
```

```properties
# delete post
{
  "operationName": "mutation deletePost($id: ID!)",
  "queryMethod": "deletePost",
  "fields": ["id", "title", "create_time"],
  "variables": {"id": "0001"}
}
```

<!-- Reference -->

[aws_lambda_appsync_api ]: https://www.r3it.com/blog/aws-lambda-to-appsync
[appsync_client_from_lambda]: https://www.edwardbeazer.com/using-appsync-client-from-lambda/
