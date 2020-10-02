#!/usr/bin/env node
require("dotenv").config();

import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import {
  CognitoStack,
  DynamoDBStack,
  AppSyncStack,
  LambdaStack,
  ApiGatewayStack,
} from "./../lib";

/**
 * AWS Account / Region Definition
 */
const {
  PREFIX: prefix = "[STACK PREFIX NAME]",
  STAGE: stage = "[DEPLOYMENT STAGE]",
  CDK_ACCOUNT: accountId = "[AWS ACCOUNT ID]",
  CDK_REGION: region = "ap-southeast-1",
} = process.env;

/**
 * AWS defulat ENV config Definition
 */
const env = {
  account: accountId,
  region: region,
};

const app = new cdk.App();
const cognito = new CognitoStack(app, `${prefix}-${stage}-CognitoStack`, {
  env,
  prefix,
  stage,
});

const dynamodb = new DynamoDBStack(app, `${prefix}-${stage}-DynamoDBStack`, {
  env,
  prefix,
  stage,
});

const appasync = new AppSyncStack(app, `${prefix}-${stage}-AppSyncStack`, {
  env,
  prefix,
  stage,
  userPool: cognito.userPool,
  table: dynamodb.table,
});

const lambda = new LambdaStack(app, `${prefix}-${stage}-LambdaStack`, {
  env,
  prefix,
  stage,
  api: appasync.graphqlApi,
});

new ApiGatewayStack(app, `${prefix}-${stage}-ApiGatewayStack`, {
  env,
  prefix,
  stage,
  lambdaFn: lambda.lambdaFn,
});

app.synth();
