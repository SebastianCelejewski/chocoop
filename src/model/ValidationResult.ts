import { ActivityFormState } from "./ActivityFormState";
import { WorkRequestFormState } from "./WorkRequestFormState";

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export type ActivityValidationResult = ValidationErrors<ActivityFormState>;
export type WorkRequestValidationResult = ValidationErrors<WorkRequestFormState>;