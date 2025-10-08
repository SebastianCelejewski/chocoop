import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Measurement: a
      .model({
          dateTime: a.datetime().required(),
          value: a.integer().required(),
          comment: a.string().required()
      })
      .authorization(allow => [allow.owner().to(['create', 'read', 'update', 'delete'])])
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