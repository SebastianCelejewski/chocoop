import type { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { SNSClient } from "@aws-sdk/client-sns";
import { Sns } from "aws-cdk-lib/aws-ses-actions";

const ssmClient = new SSMClient();
const snsClient = new SNSClient();
const envName = process.env.BRANCH_NAME || 'unknown';

const logger = new Logger({
    logLevel: "INFO",
    serviceName: "chocoop-notification-function",
});

const logDataChange = async (event: DynamoDBStreamEvent) => {
    logger.info("Logging the data change");
    logger.info(`Successfully processed ${event.Records.length} records.`);
}

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    logger.info("Entering dynamoDB function handler")

    for (const record of event.Records) {
        logger.info(JSON.stringify(record))
    }

    return {
        batchItemFailures: []
    };
};