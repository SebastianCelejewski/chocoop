import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import type { AuthUser } from "aws-amplify/auth";

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return user;
}
