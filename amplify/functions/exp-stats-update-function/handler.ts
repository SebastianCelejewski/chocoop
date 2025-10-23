import type { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { DynamoDBClient, ScanCommand, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, AttributeValue } from "@aws-sdk/client-dynamodb";
var uuid = require('uuid');

const ssmClient = new SSMClient();
const dynamoDbClient = new DynamoDBClient({});
const envName = process.env.AMPLIFY_BRANCH || 'dev';

const logger = new Logger({
    logLevel: "INFO",
    serviceName: "chocoop-exp-stats-update-function",
});

async function getParameter(parameterPath: string): Promise<string> {
    const command = new GetParameterCommand({ Name: parameterPath });
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
    const activityTableName = await getParameter(`/chocoop-activity-table-name-${envName}`);
    const expStatsTableName = await getParameter(`/chocoop-exp-stats-table-name-${envName}`);

    const params = {
        TableName: activityTableName,
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

    console.log("Starting sending data to DynamoDB")
    for (const [day, value] of dailyData) {
        console.log("Data for day: " + day);

        for (const user of userNames) {
            if (value.has(user as string)) {
                console.log("Data for user: " + user + " exp: " + value.get(user as string));
                const partitionKey = `DAY-${day}-${user}`

                var putItemParams : PutItemCommandInput = {
                    TableName: expStatsTableName,
                    Item: {
                        "id": { S: partitionKey },
                        "periodType": { S: "DAY" },
                        "period": { S: day },
                        "user": { S: user as string },
                        "exp": { N: String(value.get(user as string)) }
                    },
                    ReturnConsumedCapacity: "TOTAL",
                };

                console.log("Putting item");
                console.log("Put item params: " + JSON.stringify(putItemParams));

                const putItemRequest = new PutItemCommand(putItemParams);
                const putItemResponse : PutItemCommandOutput = await dynamoDbClient.send(putItemRequest);

                console.log("Item put");

                console.log("Put item response: " + JSON.stringify(putItemResponse));
            } 
        }
    }

    logger.info("Sending data to DynamoDB completed")

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