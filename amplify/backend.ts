import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

import { Stack } from "aws-cdk-lib";
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