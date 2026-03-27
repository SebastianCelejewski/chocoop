export type OperationResult =
  | { success: true }
  | { success: false; message: string; details?: unknown };

export function success(): OperationResult {
  return { success: true};
}

export function failure(message: string, details?: unknown): OperationResult {
  return { success: false, message, details };
}  