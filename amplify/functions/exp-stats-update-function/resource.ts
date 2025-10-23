import { defineFunction } from "@aws-amplify/backend";

const envName = process.env.AMPLIFY_BRANCH || 'dev';

export const expStatsUpdateFunction = defineFunction({
    name: "chocoop-exp-stats-update-function-" + envName,
});