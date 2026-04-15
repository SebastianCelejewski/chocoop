export type WorkRequestFormState = {
  id?: string;
  createdDate: string;
  createdBy: string;
  type: string;
  exp: string;
  urgency: string;
  instructions: string;
  completed: boolean;
  completedAs?: string;
}