import type { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { DynamoDBClient, ScanCommand, AttributeValue } from "@aws-sdk/client-dynamodb";

const ssmClient = new SSMClient();
const dynamoDbClient = new DynamoDBClient({});
const envName = process.env.AMPLIFY_BRANCH || 'dev';

const logger = new Logger({
    logLevel: "INFO",
    serviceName: "dynamodb-stream-handler",
});

async function getParameter(name: string): Promise<string> {
    const paramPath = `/pl.sebcel.chocoop/${envName}/${name}`;
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

    const params = {
        TableName: tableName,
        ExclusiveStartKey: undefined as any
    };

    var userNames = new Set();
    var dailyData = new Map();

    console.log("Data loading started")
    let response;
    do {
        const request = new ScanCommand(params);
        response = await dynamoDbClient.send(request);
        response.Items?.forEach((item: Record<string, AttributeValue>) => {
            logger.info(JSON.stringify(item))
            const dateTime = item["dateTime"]["S"];
            const user = item["user"]["S"];
            const exp = item["exp"]["N"];
            
            const day = dateTime?.substring(0,10);

            if (!(dailyData.has(day))) {
                dailyData.set(day, new Map());
            } 
            const dailyMap = dailyData.get(day);
            if (!(dailyMap.has(user))) {
                dailyMap.set(user, 0);
            }

            dailyMap.set(user, dailyMap.get(user) + parseInt(exp || "0"));
            dailyData.set(day, dailyMap);
            userNames.add(user);
        });
        params.ExclusiveStartKey = response.LastEvaluatedKey;
    } while (typeof response.LastEvaluatedKey !== "undefined");
    
    console.log("Data loading completed")

    dailyData.forEach((value: Map<string, number>, key: string) => {
        console.log("Loaded day: " + key);
        userNames.forEach((user: unknown) => {
            if (value.has(user as string)) {
                console.log("User: " + user + " exp: " + value.get(user as string));
            } 
        });
    });
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