import type { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const ssmClient = new SSMClient();
const dynamoDbClient = new DynamoDBClient({});
const envName = process.env.AMPLIFY_BRANCH || 'dev';

const logger = new Logger({
    logLevel: "INFO",
    serviceName: "dynamodb-stream-handler",
});

async function getParameter(name: string): Promise<string> {
    const paramPath = `/pl.sebcel.chocoop/${envName}/${name}`;
    logger.info(`Trying to get parameter ${paramPath} from SSM Parameter Store`);
    const command = new GetParameterCommand({ Name: paramPath });
    const response = await ssmClient.send(command);
    return response.Parameter?.Value || '';
}

const logDataChange = async (event: DynamoDBStreamEvent) => {
    logger.info("Logging the data change");
    for (const record of event.Records) {
        logger.info(`Processing record: ${record.eventID}`);
        logger.info(`Event Type: ${record.eventName}`);
        logger.info(JSON.stringify(record))
    }
    logger.info(`Successfully processed ${event.Records.length} records.`);
}

const rebuildStatistics = async () => {
    logger.info("Rebuilding statistics")
    const tableName = await getParameter('activity-table-name');
    logger.info(`Table name: ${tableName}`)

    const params = {
        TableName: tableName,
        ExclusiveStartKey: undefined as any
    };
    let items;
    do{
        const command = new ScanCommand(params);
        items = await dynamoDbClient.send(command);
        items.Items?.forEach((item: object) => {
          logger.info(JSON.stringify(item))
        });
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey !== "undefined");
    
    logger.info("Rebuilding statistics completed")
}

export const handler: DynamoDBStreamHandler = async (event) => {
    logger.info("Entering dynamoDB function handler")
    await logDataChange(event)
    await rebuildStatistics()

    logger.info("Exiting dynamoDB function handler")
    return {
        batchItemFailures: []
    };
};