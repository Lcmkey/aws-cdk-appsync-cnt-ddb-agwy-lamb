import {
  Construct,
  Stack,
  StackProps,
  CfnOutput,
  RemovalPolicy,
} from "@aws-cdk/core";
import {
  TableProps,
  AttributeType,
  BillingMode,
  Table,
  StreamViewType,
} from "@aws-cdk/aws-dynamodb";

interface DynamoDBStackStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
}

class DynamoDBStack extends Stack {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props: DynamoDBStackStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage } = props;

    /**
     * Define Dynaomo DB
     */
    const table = new Table(this, "Table", {
      tableName: `${prefix}-${stage}-Table`,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      // sortKey: {
      //   name: "create_time",
      //   type: AttributeType.STRING,
      // },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
      stream: StreamViewType.NEW_IMAGE,
    });

    /**
     * Assign to gloabal var
     */
    this.table = table;
  }
}

export { DynamoDBStack };
