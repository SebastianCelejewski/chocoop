export type OperationResult =
  | { success: true }
  | { success: false; message: string; details?: unknown };