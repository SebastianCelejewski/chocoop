import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

import { Stack } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { StartingPosition, EventSourceMapping } from "aws-cdk-lib/aws-lambda";
import { expStatsUpdateFunction } from "./functions/exp-stats-update-function/resource";

const envName = process.env.AWS_BRANCH || 'unknown';

console.log("envName: " + envName);

const backend = defineBackend({
    auth,
    data,
    expStatsUpdateFunction,
});

const { cfnUserPool } = backend.auth.resources.cfnResources;
const activityTable = backend.data.resources.tables["Activity"];
const expStatsTable = backend.data.resources.tables["ExperienceStatistics"];

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

const activityTableParam = new cdk.aws_ssm.StringParameter(
    Stack.of(activityTable),
    "chocoop-activity-table-name-parameter-" + envName,
    {
        parameterName: `/chocoop-activity-table-name-${envName}`,
        stringValue: activityTable.tableName,
    }
);

// const expStatsTableParam = new cdk.aws_ssm.StringParameter(
//     Stack.of(activityTable),
//     "chocoop-exp-stats-table-name-parameter-" + envName,
//     {
//         parameterName: `/chocoop-exp-stats-table-name-${envName}`,
//         stringValue: expStatsTable.tableName,
//     }
// );

const dynamodbActivitiesStreamDataPolicy = new Policy(
    Stack.of(activityTable),
    "chocoop-dynamodb-stream-data-policy-" + envName,
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

const dynamodbActivitiesReadPolicy = new Policy(
    Stack.of(activityTable),
    "chocoop-dynamodb-activities-read-policy-" + envName,
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
        })
    ]})

const dynamodbExpStatsReadWritePolicy = new Policy(
    Stack.of(activityTable),
    "chocoop-dynamodb-exp-stats-readwrite-policy-" + envName,
    {
        statements: [
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan",
            ],
            resources: [expStatsTable.tableArn],
        })
    ]})    
        
const parametersReadPolicy = new Policy(
    Stack.of(activityTable),
    "chocoop-parameters-read-policy-" + envName,
    {
        statements: [
        new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:GetParametersByPath"
            ],
            resources: [
                activityTableParam.parameterArn,
                expStatsTableParam.parameterArn
            ],
        }),
        ],
    }
);

backend.expStatsUpdateFunction.resources.lambda.role?.attachInlinePolicy(parametersReadPolicy);
backend.expStatsUpdateFunction.resources.lambda.role?.attachInlinePolicy(dynamodbActivitiesStreamDataPolicy);
backend.expStatsUpdateFunction.resources.lambda.role?.attachInlinePolicy(dynamodbActivitiesReadPolicy);
backend.expStatsUpdateFunction.resources.lambda.role?.attachInlinePolicy(dynamodbExpStatsReadWritePolicy);

const mapping = new EventSourceMapping(
    Stack.of(activityTable),
    "chocoop-dynamodb-function-stream-mapping-" + envName,
    {
        target: backend.expStatsUpdateFunction.resources.lambda,
        eventSourceArn: activityTable.tableStreamArn,
        startingPosition: StartingPosition.LATEST,
    }
);

mapping.node.addDependency(dynamodbActivitiesStreamDataPolicy);
