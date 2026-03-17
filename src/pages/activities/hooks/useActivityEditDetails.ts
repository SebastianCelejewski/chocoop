import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import type { ActivityFormState } from "../../../model/ActivityFormState";
import { WorkRequestFormState } from "../../../model/WorkRequestFormState";
import { AuthUser } from "aws-amplify/auth";
import { ActivityOperations, ActivityOperation } from "../../../model/ActivityOperation";

const client = generateClient<Schema>();
const currentDateTimeUTC = new Date()
const timeZoneOffset = currentDateTimeUTC.getTimezoneOffset()
const currentDateTimeLocal = new Date(currentDateTimeUTC.getTime() - timeZoneOffset * 60 * 1000)
const currentDate = currentDateTimeLocal.toISOString().split("T")[0]

export function useActivityEditDetails(operation?: ActivityOperation, objectId?: string, currentUser?: AuthUser) {

  const [activity, setActivity] = useState<ActivityFormState | null>(null);
  const [workRequest, setWorkRequest] = useState<WorkRequestFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!operation || !currentUser) {
      setActivity(null);
      setWorkRequest(null);
      setLoading(false);
      return;
    }

    if ((operation === ActivityOperations.UPDATE || operation === ActivityOperations.PROMOTE_WORK_REQUEST) && !objectId) {
      setActivity(null);
      setWorkRequest(null);
      setLoading(false);
      return;
    }

    let aborted = false;

    const createEmptyActivity = async function () {
      setActivity({
        date: currentDate,
        user: currentUser.userId,
        type: "",
        exp: "",
        comment: "",
        requestedAs: undefined
      });
      setLoading(false);
      setError(null);
    }

    const loadActivity = async function(id: string) {
      try {
        setLoading(true);
        setError(null);

        const { data } = await client.models.Activity.get({ id: id });
        if (!aborted) setActivity(activityModelToActivityFormState(data));
      } catch (err) {
        if (!aborted) setError(err as Error);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    const loadWorkRequest = async function(id: string, currentUser: AuthUser) {
      try {
        setLoading(true);
        setError(null);

        const { data } = await client.models.WorkRequest.get({ id: id });
        if (!aborted) {
          setActivity(workRequestModelToActivityFormState(data, currentUser));
          setWorkRequest(workRequestModelToWorkRequestFormState(data));
        }
      } catch (err) {
        if (!aborted) setError(err as Error);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    if (operation === ActivityOperations.CREATE) {
      createEmptyActivity();
    } else if (operation === ActivityOperations.UPDATE) {
      if (!objectId) {
        throw new Error("Argument objectId is missing");
      }
      loadActivity(objectId);
    } else if (operation === ActivityOperations.PROMOTE_WORK_REQUEST) {
      if (!objectId) {
        throw new Error("Argument objectId is missing");
      }
      loadWorkRequest(objectId, currentUser);
    } else {
      throw new Error("Unsupported operation: " + operation);
    }

    return () => {
      aborted = true;
    };
  }, [objectId, operation, currentUser]);

  return { activity, setActivity, workRequest, loading, error };
}

function activityModelToActivityFormState(model: Schema["Activity"]["type"] | null): ActivityFormState | null {
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

function workRequestModelToActivityFormState(model: Schema["WorkRequest"]["type"] | null, currentUser: AuthUser): ActivityFormState | null {
  if (model === null) {
      return null;
  }

  return {
    date: currentDate,
    user: currentUser.userId,
    type: model.type,
    exp: model.exp.toString(),
    comment: "",
    requestedAs: model.id
  };
}

function workRequestModelToWorkRequestFormState(model: Schema["WorkRequest"]["type"] | null): WorkRequestFormState | null {
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

function toLocalDate(date: string) {
    const activityDateFromDatabaseAsDate = Date.parse(date)
    const activityDateLocal = new Date(activityDateFromDatabaseAsDate - timeZoneOffset * 60 * 1000)
    return activityDateLocal.toISOString().split("T")[0]
}
