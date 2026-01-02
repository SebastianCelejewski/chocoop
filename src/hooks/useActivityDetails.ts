import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export function useActivityDetails(activityId: string | null) {
  const [activity, setActivity] = useState<Schema["Activity"]["type"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activityId) {
      setActivity(null);
      setLoading(false);
      return;
    }

    let aborted = false;
    const id = activityId; 

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const { data } = await client.models.Activity.get({ id: id });
        if (!aborted) setActivity(data ?? null);
      } catch (err) {
        if (!aborted) setError(err as Error);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    load();
    return () => {
      aborted = true;
    };
  }, [activityId]);

  return { activity, loading, error };
}