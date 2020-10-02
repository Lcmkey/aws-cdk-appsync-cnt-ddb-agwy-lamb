import {
  Construct,
  Stack,
  StackProps,
  CfnOutput,
  Duration,
  Expiration,
} from "@aws-cdk/core";
import { UserPool } from "@aws-cdk/aws-cognito";
import {
  GraphqlApi,
  FieldLogLevel,
  UserPoolDefaultAction,
  MappingTemplate,
  Schema,
  AuthorizationType,
  PrimaryKey,
  Values,
} from "@aws-cdk/aws-appsync";
import { Table } from "@aws-cdk/aws-dynamodb";

interface AppSyncStackStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
  readonly userPool: UserPool;
  readonly table: Table;
}

class AppSyncStack extends Stack {
  public readonly graphqlApi: GraphqlApi;

  constructor(scope: Construct, id: string, props: AppSyncStackStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage, userPool, table } = props;

    /**
     * Define Dynaomo DB
     */
    const api = new GraphqlApi(this, "Graphql-API", {
      name: `${prefix}-${stage}-API`,
      schema: Schema.fromAsset("graphql/schema.graphql"),
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
            defaultAction: UserPoolDefaultAction.ALLOW,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.API_KEY,
            apiKeyConfig: {
              name: `${prefix}-${stage}-API-Key`,
              expires: Expiration.after(Duration.days(365)),
              description: "Api key desc",
            },
          },
        ],
      },
      xrayEnabled: true,
    });

    /**
     * Graphql Data-Source
     */
    const datasource = api.addDynamoDbDataSource(`DataSource`, table);

    /**
     * Graphql Resolvers
     */
    datasource.createResolver({
      typeName: "Query",
      fieldName: "posts",
      requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    });
    datasource.createResolver({
      typeName: "Query",
      fieldName: "post",
      requestMappingTemplate: MappingTemplate.dynamoDbGetItem("id", "id"),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });
    datasource.createResolver({
      typeName: "Mutation",
      fieldName: "createPost",
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition("id").is("post.id"),
        Values.projecting("post"),
      ),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });
    datasource.createResolver({
      typeName: "Mutation",
      fieldName: "updatePost",
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition("id").is("post.id"),
        Values.projecting("post"),
      ),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });
    datasource.createResolver({
      typeName: "Mutation",
      fieldName: "deletePost",
      requestMappingTemplate: MappingTemplate.dynamoDbDeleteItem("id", "id"),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    /**
     * String template, for test only
     */
    const queryMappingTemplate = `
      {
        "version": "2017-02-28",
        "operation": "Query",
        "query": {
          "expression": "#id = :id AND #createTime BETWEEN :start AND :end",
          "expressionNames": {
            "#id": "id"
            "#createTime": "create_time"
          },
          "expressionValues": {
            ":id": $util.dynamodb.toDynamoDBJson($ctx.args.id),
            ":start": $util.dynamodb.toDynamoDBJson($ctx.args.start),
            ":end": $util.dynamodb.toDynamoDBJson($ctx.args.end)
          }
        }
      }
    `;

    datasource.createResolver({
      typeName: "Query",
      fieldName: "query",
      requestMappingTemplate: MappingTemplate.fromString(queryMappingTemplate),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    });

    /**
     * Assign to gloabal var
     */
    this.graphqlApi = api;
  }
}

export { AppSyncStack };
