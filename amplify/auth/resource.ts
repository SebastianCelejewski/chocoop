import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true
  },
  userAttributes: {
    nickname: {
      mutable: true,
      required: true
    }
  }
});
