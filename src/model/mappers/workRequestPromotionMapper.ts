import type { Schema } from "../../../amplify/data/resource";
import type { ActivityFormState } from "../../model/ActivityFormState";
import { AuthUser } from "aws-amplify/auth";
import { toLocalDate, getCurrentDate } from "../../utils/dateUtils";
import reportError from "../../utils/reportError"

function mapWorkRequestModelToActivityFormState(model: Schema["WorkRequest"]["type"] | null, currentUser: AuthUser): ActivityFormState | null {
  if (model === null) {
      return null;
  }

  return {
    date: getCurrentDate(),
    user: currentUser.userId,
    type: model.type,
    exp: model.exp.toString(),
    comment: "",
    requestedAs: model.id
  };
}

export {
    mapWorkRequestModelToActivityFormState as workRequestModelToActivityFormState
}