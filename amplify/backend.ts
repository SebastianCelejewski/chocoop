import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

import { Stack } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { StartingPosition, EventSourceMapping } from "aws-cdk-lib/aws-lambda";
import { myDynamoDBFunction } from "./functions/dynamoDB-function/resource";

const backend = defineBackend({
    auth,
    data,
    myDynamoDBFunction,
});

const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.policies = {
    passwordPolicy: {
        minimumLength: 6,
        requireLowercase: false,
        requireNumbers: false,
        requireSymbols: false,
        requireUppercase: false,
        temporaryPasswordValidityDays: 20,
    },
};

const activityTable = backend.data.resources.tables["Activity"];
const policy = new Policy(
    Stack.of(activityTable),
    "MyDynamoDBFunctionStreamingPolicy",
    {
        statements: [
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    "dynamodb:DescribeStream",
                    "dynamodb:GetRecords",
                    "dynamodb:GetShardIterator",
                    "dynamodb:ListStreams",
                ],
                resources: ["*"],
            }),
        ],
    }
);
backend.myDynamoDBFunction.resources.lambda.role?.attachInlinePolicy(policy);

const mapping = new EventSourceMapping(
    Stack.of(activityTable),
    "MyDynamoDBFunctionTodoEventStreamMapping",
    {
        target: backend.myDynamoDBFunction.resources.lambda,
        eventSourceArn: activityTable.tableStreamArn,
        startingPosition: StartingPosition.LATEST,
    }
);

mapping.node.addDependency(policy);

/* SSM parameter holding a name of DynamiDB table that can be fetched by the Lambda function */

const envName = process.env.AMPLIFY_BRANCH || 'dev';
const activityTableParam = new cdk.aws_ssm.StringParameter(
    Stack.of(activityTable),
    "ActivityTableName",
    {
        parameterName: `/pl.sebcel.chocoop/${envName}/activity-table-name`,
        stringValue: activityTable.tableName,
    }
);

const allowSignLambdaToAccessAccountTablePolicy = new Policy(
    Stack.of(activityTable),
    "chocoop-allowSignLambdaToAccessActivityTablePolicy",
    {
        statements: [
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:Query",
                "dynamodb:Scan",
            ],
            resources: [activityTable.tableArn],
        }),
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:GetParametersByPath"
            ],
            resources: [
                activityTableParam.parameterArn,
            ],
        }),
        ],
    }
);

backend.myDynamoDBFunction.resources.lambda.role?.attachInlinePolicy(allowSignLambdaToAccessAccountTablePolicy);