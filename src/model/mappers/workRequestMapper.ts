import type { Schema } from "../../../amplify/data/resource";
import { WorkRequestFormState } from "../WorkRequestFormState";
import { toLocalDate } from "../../utils/dateUtils";
import reportError from "../../utils/reportError"

function mapWorkRequestModelToWorkRequestFormState(model: Schema["WorkRequest"]["type"] | null): WorkRequestFormState | null {
  if (model === null) {
      return null;
  }
  return {
      id: model.id,
      createdDateTime: toLocalDate(model.createdDateTime),
      createdBy: model.createdBy,
      type: model.type,
      exp: model.exp.toString(),
      urgency: model.urgency.toString(),
      instructions: model.instructions ?? "",
      completed: model.completed,
      completedAs: model.completedAs ?? undefined
  }
}

function mapWorkRequestFormStateToWorkRequestModel(workRequest: WorkRequestFormState | null) {
    if (workRequest === null) {
        throw new Error(reportError("State workRequest is null during creation of a new work request object"))
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
        completed: workRequest.completed,
        completedAs: workRequest.completedAs
    }
}

function mapWorkRequestFormStateAndActivityFormStateToWorkRequestModel(newActivityId: string, workRequest: WorkRequestFormState | null) {
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
    mapWorkRequestModelToWorkRequestFormState,
    mapWorkRequestFormStateToWorkRequestModel,
    mapWorkRequestFormStateAndActivityFormStateToWorkRequestModel
}