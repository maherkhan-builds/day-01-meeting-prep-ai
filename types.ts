export interface MeetingInputs {
  topic: string;
  attendees: string;
  role: string;
  goal: string;
}

export interface Objection {
  objection: string;
  response: string;
}

export interface MeetingPrepOutput {
  keyTalkingPoints: string[];
  smartQuestions: string[];
  potentialObjections: Objection[];
  openingLine: string;
}