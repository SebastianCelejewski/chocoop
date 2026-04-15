export const ActivityOperations = {
  CREATE: "create",
  UPDATE: "update",
  PROMOTE_WORK_REQUEST: "promoteWorkRequest"
} as const;

export type ActivityOperation = typeof ActivityOperations[keyof typeof ActivityOperations];