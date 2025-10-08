import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Measurement: a
      .model({
          dateTime: a.datetime().required(),
          value: a.integer().required(),
          comment: a.string().required()
      })
      .authorization((allow) => [allow.publicApiKey()]),
  Activity: a
      .model({
          user: a.string().required(),
          dateTime: a.datetime().required(),
          type: a.string().required(),
          exp: a.integer().required(),
          comment: a.string().required()
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