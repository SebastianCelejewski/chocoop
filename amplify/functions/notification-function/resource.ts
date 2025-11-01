import { defineFunction } from "@aws-amplify/backend";

const envName = process.env.AMPLIFY_BRANCH || 'unknown';

export const notificationFunction = defineFunction({
    name: "chocoop-notification-function-" + envName,
    environment: {
        BRANCH_NAME: process.env.AWS_BRANCH || 'unknown',
    }
});