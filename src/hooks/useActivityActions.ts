import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import reportError from "../utils/reportError";

const client = generateClient<Schema>();

export function useActivityActions() {
  async function deleteActivity(id: string) {
    try {
      await client.models.Activity.delete({ id });
    } catch (error) {
      throw new Error(reportError("Error deleting activity: " + error));
    }
  }

  async function addReaction(input: {
    activityId: string;
    userId: string;
    reaction: string;
  }) {
    try {
      const result = await client.models.Reaction.create({
        activityId: input.activityId,
        user: input.userId,
        reaction: input.reaction,
      });

      if (!result.data) {
        reportError("Failed to create reaction: " + JSON.stringify(result));
      }
    } catch (error) {
      throw new Error(reportError("Error creating reaction: " + error));
    }
  }

  return {
    deleteActivity,
    addReaction,
  };
}