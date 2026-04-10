export type OperationResult =
  | { success: true; data: string }
  | { success: false; message: string; details?: unknown };

export function success(data: string): OperationResult {
  return { success: true, data: data};
}

export function failure(message: string, details?: unknown): OperationResult {
  return { success: false, message, details };
}  