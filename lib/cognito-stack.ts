import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import { UserPool, SignInAliases, UserPoolClient } from "@aws-cdk/aws-cognito";

interface CognitoStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
}

class CognitoStack extends Stack {
  public readonly userPool: UserPool;
  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage } = props;

    /**
     * Define User Pool
     */
    const userPool = new UserPool(this, "UserPool", {
      userPoolName: `${prefix}-${stage}-User-Pool`,
      signInAliases: { username: true, email: true },
    });

    /**
     * Create App Client
     */
    const userPoolClient = new UserPoolClient(this, "UserClient", {
      userPoolClientName: `${prefix}-${stage}-User-Client`,
      userPool,
      generateSecret: false,
    });

    /**
     * Assign to gloabal var
     */
    this.userPool = userPool;

    /**
     * Cfn Ouput
     */
    new CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });
    new CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
  }
}

export { CognitoStack };
