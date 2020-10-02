require("es6-promise").polyfill();
require("isomorphic-fetch");

const AWS = require("aws-sdk");
const AWSAppSyncClient = require("aws-appsync").default;
const { AUTH_TYPE } = require("aws-appsync");
const gql = require("graphql-tag");
// const { v4: uuidv4 } = require("uuid");

const appsyncUrl = process.env.APPSYNC_API_ENDPOINT_URL;
const xApiKey = process.env.APPSYNC_API_KEY;

AWS.config.update({
  region: "us-east-1",
});

/**
 * graphql client.  We define it outside of the lambda function in order for it to be reused during subsequent calls
 */
let client: any = {};

/**
 * initializes our graphql client
 */
const initializeClient = () => {
  client = new AWSAppSyncClient({
    url: appsyncUrl,
    region: "us-east-1",
    auth: {
      //   type: AUTH_TYPE.AWS_IAM,
      //   credentials: AWS.config.credentials,
      //   type: AppSyncConfig.authenticationType,
      //   apiKey: AppSyncConfig.apiKey,
      type: AUTH_TYPE.API_KEY,
      apiKey: xApiKey,
    },
    disableOffline: true,
  });
};

/**
 * used to parse different types of query results to return only the item.
 * @param operationName
 * @param data
 */
function parseResults(operationName: string, data: any) {
  if (operationName.includes("List")) {
    return data[`l${operationName.substring(1, operationName.length)}`];
  }
  if (operationName.includes("GetOrders")) {
    return data[`g${operationName.substring(1, operationName.length)}`];
  }
  return data[operationName];
}

/**
 * generic query function.  A way to quickly reuse query statements
 * @param operationName
 * @param queryMethod
 * @param args
 * @param fields
 * @param variables
 */
const executeQuery = async (
  operationName: string,
  queryMethod: string,
  args: string,
  fields: Array<string> = [],
  variables: any = {},
) => {
  if (!Object.keys(client).length) {
    initializeClient();
  }

  let response;

  let params = Object.keys(variables).length
    ? `${Object.keys(variables).map((v) => v.replace("$", "") + ":" + "$" + v)}`
    : "";

  params = Boolean(args) ? `(${args}:{${params}})` : `(${params})`;
  params = params === "()" ? "" : params;

  const query = `${operationName} { ${queryMethod}${params} { ${fields.join(
    ",",
  )} } }`;

  try {
    if (operationName.includes("query")) {
      response = await client.query({
        query: gql(query),
        variables,
        fetchPolicy: "network-only",
      });
    } else {
      response = await client.mutate({
        mutation: gql(query),
        variables,
        fetchPolicy: "no-cache",
      });
    }

    return response;
    // return parseResults(operationName, response.data);
  } catch (err) {
    console.log("Error while trying to query");
    console.log(err);
    throw JSON.stringify(err);
  }
};

/**
 * Main Handler
 * @param event
 * @param context
 */
const handler = async (event: any = {}, context: any = {}) => {
  const {
    operationName,
    queryMethod,
    args,
    fields = [],
    variables = {},
  } = JSON.parse(event.body);

  const result = await executeQuery(
    operationName,
    queryMethod,
    args,
    fields,
    variables,
  );

  const response = {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };

  return response;
};

export { handler };
