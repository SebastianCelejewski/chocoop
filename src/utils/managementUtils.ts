import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, ListUsersCommand, UserType } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../amplify_outputs.json';

import User from "../model/User";

async function fetchAllUsers() {
    const session = await fetchAuthSession()
    const client = new CognitoIdentityProviderClient({ 
        region: outputs.auth.aws_region,
        credentials: session.credentials
    })
    const command = new ListUsersCommand({
        UserPoolId: outputs.auth.user_pool_id,
        AttributesToGet: ["nickname"]
    })
    const response = await client.send(command)
    const convertedUsers = response.Users?.map((user: UserType) => convertToLocalUser(user)) || [];
    const usersAsKeyValues = convertedUsers.map((user: User) => [user.id, user] as [string, User])
    const sortedUsers = usersAsKeyValues.sort((a, b) => a[1].nickname.localeCompare(b[1].nickname))
    return new Map<string, User>(sortedUsers)
}

function convertToLocalUser(userType: UserType) : User {
    if (userType.Username === undefined || userType.Username === null) {
        throw new Error("Username is null")
    }
    const id = userType.Username

    if (userType.Attributes === undefined || userType.Attributes === null) {
        throw new Error("Attributes are null")
    }

    const nickName = userType.Attributes.find((attribute) => attribute.Name === "nickname")?.Value
    if (nickName === undefined) {
        throw new Error("Nickname is null")
    }

    return new User(id, nickName);
}

export { fetchAllUsers };