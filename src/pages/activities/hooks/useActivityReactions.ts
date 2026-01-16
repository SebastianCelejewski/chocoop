export type UIReaction = {
  id: string;
  reaction: string;
  user: string;
  activityId: string;
};

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";

const client = generateClient<Schema>();

export function useActivityReactions(activityId?: string) {
  const [reactions, setReactions] = useState<UIReaction[]>([]);

  async function refetch() {
    if (!activityId) return;

    const { data } = await client.models.Reaction.list({
      filter: { activityId: { eq: activityId } },
    });

    setReactions(
      (data ?? []).map(r => ({
        id: r.id,
        reaction: r.reaction,
        user: r.user,
        activityId: r.activityId,
      }))
    );
  }

  useEffect(() => {
    if (!activityId) return;

    const sub = client.models.Reaction.observeQuery({
      filter: { activityId: { eq: activityId } },
    }).subscribe({
      next: ({ items }) => {
        setReactions(
          items.map(r => ({
            id: r.id,
            reaction: r.reaction,
            user: r.user,
            activityId: r.activityId,
          }))
        );
      },
    });

    return () => sub.unsubscribe();
  }, [activityId]);

  return { reactions, refetch };
}