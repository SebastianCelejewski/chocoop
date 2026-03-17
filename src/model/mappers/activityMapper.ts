import type { Schema } from "../../../amplify/data/resource";
import type { ActivityEditFormState } from "../../model/ActivityFormState";
import { WorkRequestEditFormState } from "../../model/WorkRequestFormState";
import { AuthUser } from "aws-amplify/auth";
import { toLocalDate, getCurrentDate } from "../../utils/dateUtils";
import reportError from "../../utils/reportError"

function mapActivityModelToActivityEditFormState(model: Schema["Activity"]["type"] | null): ActivityEditFormState | null {
  if (model === null) {
      return null;
  }
  return {
      id: model.id,
      date: toLocalDate(model.date),
      user: model.user,
      type: model.type,
      exp: model.exp.toString(),
      comment: model.comment ?? "",
      requestedAs: model.requestedAs ?? undefined
  }
}

function mapWorkRequestModelToActivityEditFormState(model: Schema["WorkRequest"]["type"] | null, currentUser: AuthUser): ActivityEditFormState | null {
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

function mapWorkRequestModelToWorkRequestFormState(model: Schema["WorkRequest"]["type"] | null): WorkRequestEditFormState | null {
  if (model === null) {
    return null;
  } 

  return{
    id: model.id,
    createdBy: model.createdBy,
    createdDateTime: model.createdDateTime,
    type: model.type,
    exp: model.exp.toString(),
    urgency: model.urgency.toString(),
    instructions: model.instructions
  }
}

function mapActivityEditFormStateToActivityModel(activity: ActivityEditFormState, workRequest: WorkRequestEditFormState | null) {
    if (activity.date === undefined) {
        throw new Error(reportError("State activityDate is undefined during creation of a new activity object"))
    }
    if (activity.user === undefined) {
        throw new Error(reportError("State activityPerson is undefined during creation of a new activity object"))
    }
    if (activity.type === undefined) {
        throw new Error(reportError("State activityType is undefined during creation of a new activity object"))
    }
    if (activity.exp === undefined || isNaN(Number(activity.exp))) {
        throw new Error(reportError("State activityExp is undefined during creation of a new activity object"))
    }
    return {
        id: activity.id,
        date: activity.date,
        user: activity.user,
        type: activity.type,
        exp: Number(activity.exp),
        comment: activity.comment,
        requestedAs: workRequest?.id
    }
}

function mapWorkRequestEditFormStateToWorkRequestModel(newActivityId: string, workRequest: WorkRequestEditFormState | null) {
    if (workRequest === null) {
        throw new Error(reportError("State workRequest is null during creation of a new work request object"))
    }
    if (newActivityId === undefined) {
        throw new Error(reportError("Argument newActivityId is undefined during creation of a new work request object"))
    }
    if (workRequest.id === undefined) {
        throw new Error(reportError("State workRequestId is undefined during creation of a new work request object"))
    }
    if (workRequest.createdDateTime === undefined) {
        throw new Error(reportError("State workRequestCreatedDateTime is undefined during creation of a new work request object"))
    }
    if (workRequest.createdBy === undefined) {
        throw new Error(reportError("State workRequestCreatedBy is undefined during creation of a new work request object"))
    }
    if (workRequest.type === undefined) {
        throw new Error(reportError("State workRequestType is undefined during creation of a new work request object"))
    }
    if (workRequest.exp === undefined || isNaN(Number(workRequest.exp))) {
        throw new Error(reportError("State workRequestExp is undefined during creation of a new work request object"))
    }
    if (workRequest.urgency === undefined || isNaN(Number(workRequest.urgency))) {
        throw new Error(reportError("State workRequestUrgency is undefined during creation of a new work request object"))
    }
    if (workRequest.instructions === undefined) {
        throw new Error(reportError("State workRequestInstructions is undefined during creation of a new work request object"))
    }
    return {
        id: workRequest.id,
        createdDateTime: new Date(workRequest.createdDateTime).toISOString(),
        createdBy: workRequest.createdBy,
        type: workRequest.type,
        exp: Number(workRequest.exp),
        urgency: Number(workRequest.urgency),
        instructions: workRequest.instructions,
        completed: true,
        completedAs: newActivityId
    }
}


export {
    mapActivityModelToActivityEditFormState as activityModelToActivityEditFormState,
    mapWorkRequestModelToActivityEditFormState as workRequestModelToActivityEditFormState,
    mapWorkRequestModelToWorkRequestFormState as workRequestModelToWorkRequestFormState,
    mapActivityEditFormStateToActivityModel as createActivityObjectFromState,
    mapWorkRequestEditFormStateToWorkRequestModel as createWorkRequestObjectFromState
}