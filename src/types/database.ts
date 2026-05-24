export type UserRole = "student" | "parent";

export type WeakQuestionStatus =
  | "pending"
  | "understood"
  | "unsure"
  | "critical"
  | "resolved";

export type ReviewOutcome = "understood" | "unsure" | "critical";

export interface PendingSubjectNode {
  subject: string;
  count: number;
  topics: PendingTopicNode[];
}

export interface PendingTopicNode {
  topic: string;
  count: number;
  tests: PendingTestNode[];
}

export interface PendingTestNode {
  test: TestRecord;
  count: number;
  questions: WeakQuestion[];
}

export interface PendingTree {
  total: number;
  subjects: PendingSubjectNode[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  username?: string | null;
  grade?: string | null;
  parent_id?: string | null;
  created_at: string;
}

export interface TestRecord {
  id: string;
  student_id: string;
  subject: string;
  topic: string;
  source: string;
  test_no: number;
  page_no?: number | null;
  total_questions: number;
  correct_count: number;
  created_at: string;
}

export interface WeakQuestion {
  id: string;
  test_id: string;
  question_no: number;
  status: WeakQuestionStatus;
  created_at: string;
  updated_at?: string;
}

export interface WeakQuestionWithTest extends WeakQuestion {
  test_records: TestRecord;
}

export interface StudyResource {
  id: string;
  parent_id: string;
  student_id: string;
  grade: string;
  subject: string;
  source: string;
  created_at: string;
}

export interface QuestionGroup {
  test: TestRecord;
  questions: WeakQuestion[];
}
