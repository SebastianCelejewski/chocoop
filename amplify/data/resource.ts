import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
    Activity: a
        .model({
            id: a.id().required(),
            user: a.string().required(),
            dateTime: a.datetime().required(),
            type: a.string().required(),
            exp: a.integer().required(),
            comment: a.string().required(),
            requestedAs: a.string(),
            reactions: a.hasMany("Reaction", "id")
        })
        .authorization((allow) => [allow.publicApiKey()]),
    WorkRequest: a
        .model({
            id: a.id().required(),
            createdBy: a.string().required(),
            createdDateTime: a.datetime().required(),
            type: a.string().required(),
            exp: a.integer().required(),
            urgency: a.integer().required(),
            instructions: a.string().required(),
            completed: a.boolean().required(),
            completedAs: a.string()
        })
        .authorization((allow) => [allow.publicApiKey()]),
    ExperienceStatistics: a
        .model({
            periodType: a.string().required(),
            period: a.string().required(),
            user: a.string().required(),
            exp: a.integer().required()
        })
        .authorization((allow) => [allow.publicApiKey()]),
    Reaction: a
        .model({
            id: a.id().required(),
            activityId: a.belongsTo("Activity", "id"),
            user: a.string().required(),
            reaction: a.string().required()
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