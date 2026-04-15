export const WorkRequestOperations = {
  CREATE: "create",
  UPDATE: "update"
} as const;

export type WorkRequestOperation = typeof WorkRequestOperations[keyof typeof WorkRequestOperations];