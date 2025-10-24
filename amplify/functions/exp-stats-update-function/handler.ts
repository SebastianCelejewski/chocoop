import type { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { DynamoDBClient, ScanCommand, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, AttributeValue } from "@aws-sdk/client-dynamodb";

const ssmClient = new SSMClient();
const dynamoDbClient = new DynamoDBClient({});
const envName = process.env.AWS_BRANCH || 'unknown';

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

async function putData(tableName: string, periodType: string, period: string, user: string, exp: number) {
    console.log("Putting data for user: " + user + " exp: " + exp);
    const partitionKey = `${periodType}-${period}-${user}`;

    var putItemParams: PutItemCommandInput = {
        TableName: tableName,
        Item: {
            "id": { S: partitionKey },
            "periodType": { S: periodType },
            "period": { S: period },
            "user": { S: user as string },
            "exp": { N: String(exp) }
        },
        ReturnConsumedCapacity: "TOTAL",
    };

    console.log("Putting item");
    console.log("Put item params: " + JSON.stringify(putItemParams));

    const putItemRequest = new PutItemCommand(putItemParams);
    const putItemResponse: PutItemCommandOutput = await dynamoDbClient.send(putItemRequest);

    console.log("Item put");

    console.log("Put item response: " + JSON.stringify(putItemResponse));
}

const rebuildStatistics = async () => {
    logger.info("Rebuilding statistics")
    const activityTableName = await getParameter(`/chocoop/activity-table-name-${envName}`,);
    const expStatsTableName = await getParameter(`/chocoop/exp-stats-table-name-${envName}`);

    const params = {
        TableName: activityTableName,
        ExclusiveStartKey: undefined as any
    };

    var userNames = new Set<string>();
    var dailyData = new Map<string, Map<string, number>>();
    var monthlyData = new Map<string, Map<string, number>>();

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
            
            console.log("Checking dateTime, user and exp");
            if (dateTime === undefined || user === undefined || exp === undefined) {
                console.log("Invalid data fetched from the database. Check dateTime, user and exp");
                console.log(JSON.stringify(item));
                return
            }

            const day = dateTime.substring(0,10);
            const month = dateTime.substring(0, 7);

            console.log("Current day: " + day + ", current month: " + month);

            console.log("Preparing daily data");
            if (!(dailyData.has(day))) {
                dailyData.set(day, new Map<string, number>());
            } 
            const dailyMap = dailyData.get(day) || new Map<string, number>();
            if (!(dailyMap.has(user))) {
                dailyMap.set(user, 0);
            }
            
            console.log("Preparing monthly data");
            if (!(monthlyData.has(month))) {
                monthlyData.set(month, new Map());
            } 
            const monthlyMap = monthlyData.get(month) || new Map<string, number>();
            if (!(monthlyMap.has(user))) {
                monthlyMap.set(user, 0);
            }

            console.log("Collecting daily data")

            dailyMap.set(user, (dailyMap.get(user) || 0) + parseInt(exp || "0"));
            dailyData.set(day, dailyMap);

            console.log("Collecting monthly data")

            monthlyMap.set(user, (monthlyMap.get(user) || 0) + parseInt(exp || "0"));
            monthlyData.set(month, monthlyMap);

            console.log("Collecting list of users")

            userNames.add(user);
        });
        params.ExclusiveStartKey = response.LastEvaluatedKey;
    } while (typeof response.LastEvaluatedKey !== "undefined");
    
    console.log("Data loading completed")

    console.log("Starting sending daily data to DynamoDB")
    for (const [day, value] of dailyData) {
        for (const user of userNames) {
            if (value.has(user)) {
                const exp = value.get(user as string) || 0;
                await putData(expStatsTableName, "DAY", day, user, exp);
            } 
        }
    }
    logger.info("Sending daily data to DynamoDB completed")

    console.log("Starting sending monthly data to DynamoDB")
    for (const [month, value] of monthlyData) {
        for (const user of userNames) {
            if (value.has(user)) {
                const exp = value.get(user as string) || 0
                await putData(expStatsTableName, "MONTH", month, user, exp);
            } 
        }
    }
    logger.info("Sending monthly data to DynamoDB completed")

    logger.info("Rebuilding statistics completed")

    
}

export const handler: DynamoDBStreamHandler = async (event) => {
    logger.info("Entering dynamoDB function handler")
    console.log("envName: " + envName);
    console.log("process.env.AWS_BRANCH: " + process.env.AWS_BRANCH);
    console.log("process.env.AMPLIFY_BRANCH: " + process.env.AMPLIFY_BRANCH);
    console.log("Env: " + JSON.stringify(process.env))
    
    await logDataChange(event)
    await rebuildStatistics()

    logger.info("Exiting dynamoDB function handler")
    return {
        batchItemFailures: []
    };
};