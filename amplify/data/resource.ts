import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
    Activity: a
        .model({
            user: a.string().required(),
            dateTime: a.datetime().required(),
            type: a.string().required(),
            exp: a.integer().required(),
            comment: a.string().required(),
            requestedAs: a.string().optional()
        })
        .authorization((allow) => [allow.publicApiKey()]),
    WorkRequest: a
        .model({
            createdBy: a.string().required(),
            createdDateTime: a.datetime().required(),
            type: a.string().required(),
            exp: a.integer().required(),
            urgency: a.integer().required(),
            instructions: a.string().required(),
            completed: a.boolean().optional(),
            completedAs: a.string().optional()
        })
    .authorization((allow) => [allow.publicApiKey()]),
});

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "apiKey",
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
      },
  });

export type Schema = ClientSchema<typeof schema>;