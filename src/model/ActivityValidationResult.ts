import { ActivityFormState } from "./ActivityFormState";

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;
export type ActivityValidationResult = ValidationErrors<ActivityFormState>;