export type WorkRequestFormState = {
  id?: string;
  createdDateTime?: string;
  createdBy?: string;
  type: string;
  exp: string;
  urgency: string;
  instructions: string;
  completed: boolean;
  completedAs?: string;
}