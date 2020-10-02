import { Construct, Stack, StackProps, Duration } from "@aws-cdk/core";
import { GraphqlApi } from "@aws-cdk/aws-appsync";
import { LayerVersion, Function, Runtime, Code } from "@aws-cdk/aws-lambda";
import * as path from "path";

interface LambdaStackStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
  readonly api: GraphqlApi;
}

class LambdaStack extends Stack {
  public readonly lambdaFn: Function;

  constructor(scope: Construct, id: string, props: LambdaStackStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage, api } = props;

    /**
     * Lambda Layer
     */
    const lambdaLayer = new LayerVersion(this, `presignedUrlLayer`, {
      layerVersionName: `${prefix}-${stage}-Layer`,
      //   code: Code.fromAsset(
      //     path.resolve(__dirname, "..", "src", "layer", "nodejs"),
      //   ),
      code: Code.asset("src/layer"),
      // compatibleRuntimes: [Runtime.PROVIDED],
      compatibleRuntimes: [Runtime.NODEJS_10_X, Runtime.NODEJS_12_X],
      license: "Sam Leung",
      description: `${prefix}-${stage}-Layer`,
    });

    /**
     * Create Lambda Function (NodeJs)
     */
    const lambda = new Function(this, "Event-Handler", {
      functionName: `${prefix}-${stage}-Event-Handler`,
      runtime: Runtime.NODEJS_12_X,
      code: Code.asset("dist/src/lambda-nodejs"),
      handler: "app.handler",
      memorySize: 128,
      timeout: Duration.seconds(10),
      environment: {
        APPSYNC_API_KEY: api.apiKey || "",
        APPSYNC_API_ENDPOINT_URL: api.graphqlUrl,
      },
      description:
        "Request handler to get information about events. Triggered by API Gateway.",
      layers: [lambdaLayer],
    });

    /**
     * Lambda Layer (Python)
     */
    // const lambda_layer = new LayerVersion(this, "lambda_requests_layer", {
    //   layerVersionName: `${prefix}-${stage}-Layer`,
    //   code: Code.asset("src/layer/python/requests.zip"),
    //   compatibleRuntimes: [Runtime.PYTHON_3_8],
    //   license: "MIT",
    //   description: "A layer for requests library dependency",
    // });

    // /**
    //  * Create Lambda Function
    //  */
    // const lambda = new Function(this, "Event-Handler", {
    //   functionName: `${prefix}-${stage}-Event-Handler`,
    //   runtime: Runtime.PYTHON_3_8,
    //   code: Code.asset("src/lambda-python"),
    //   handler: "app.handler",
    //   memorySize: 128,
    //   environment: {
    //     APPSYNC_API_KEY: api.apiKey || "",
    //     APPSYNC_API_ENDPOINT_URL: api.graphqlUrl,
    //   },
    //   description:
    //     "Request handler to get information about events. Triggered by API Gateway.",
    //   layers: [lambda_layer],
    // });

    /**
     * Assign to gloabal var
     */
    this.lambdaFn = lambda;
  }
}

export { LambdaStack };
