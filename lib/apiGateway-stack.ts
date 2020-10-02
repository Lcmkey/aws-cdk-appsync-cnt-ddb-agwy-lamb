import { App, Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import {
  LambdaRestApi,
  IntegrationResponse,
  LambdaIntegration,
  MethodLoggingLevel,
  EndpointType,
} from "@aws-cdk/aws-apigateway";
import { Function } from "@aws-cdk/aws-lambda";

interface ApiGatewayStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
  readonly lambdaFn: Function;
}

class ApiGatewayStack extends Stack {
  constructor(scope: App, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    /**
     * Get Var from props
     */
    const { prefix, stage, lambdaFn } = props;

    const eventsRestApi = new LambdaRestApi(this, "events_rest_api", {
      restApiName: `${prefix}-${stage}-rest-api`,
      proxy: false,
      endpointTypes: [EndpointType.REGIONAL],
      handler: lambdaFn,
      deployOptions: {
        stageName: stage,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      description: "Codescrum events REST API",
    });

    /**
     * Default integrations response
     */
    const badRequestResponse: IntegrationResponse = {
      statusCode: "400",
    };

    const internalServerResponse: IntegrationResponse = {
      statusCode: "500",
    };

    const okResponse: IntegrationResponse = { statusCode: "200" };

    const integrationResponses = [
      badRequestResponse,
      internalServerResponse,
      okResponse,
    ];

    /**
     * Integrate API Gateway with lambda functions: lambdaFn(graphql/)
     */
    const events_integration = new LambdaIntegration(lambdaFn, {
      integrationResponses: integrationResponses,
    });

    /**
     * Add a resource or endpoint to interact with events data, we called "graphql"
     */
    const events_resource = eventsRestApi.root.addResource("graphql");

    /**
     * Adding Methods integrations to the API Gateway
     */
    events_resource.addMethod("POST", events_integration);
  }
}

export { ApiGatewayStack };
