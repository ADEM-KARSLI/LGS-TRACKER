import type {
  PendingSubjectNode,
  PendingTestNode,
  PendingTopicNode,
  PendingTree,
  TestRecord,
  WeakQuestion,
  WeakQuestionWithTest,
} from "@/types/database";

export function buildQuestionTree(rows: WeakQuestionWithTest[]): PendingTree {
  const subjectMap = new Map<string, Map<string, Map<string, PendingTestNode>>>();

  for (const row of rows) {
    const test = row.test_records as TestRecord;
    const question: WeakQuestion = {
      id: row.id,
      test_id: row.test_id,
      question_no: row.question_no,
      status: row.status,
      created_at: row.created_at,
    };

    if (!subjectMap.has(test.subject)) {
      subjectMap.set(test.subject, new Map());
    }
    const topicMap = subjectMap.get(test.subject)!;

    if (!topicMap.has(test.topic)) {
      topicMap.set(test.topic, new Map());
    }
    const testMap = topicMap.get(test.topic)!;

    if (!testMap.has(test.id)) {
      testMap.set(test.id, { test, count: 0, questions: [] });
    }
    const node = testMap.get(test.id)!;
    node.questions.push(question);
    node.count++;
  }

  const subjects: PendingSubjectNode[] = [...subjectMap.entries()].map(
    ([subject, topicMap]) => {
      const topics: PendingTopicNode[] = [...topicMap.entries()].map(
        ([topic, testMap]) => {
          const tests = [...testMap.values()]
            .map((t) => ({
              ...t,
              questions: t.questions.sort((a, b) => a.question_no - b.question_no),
            }))
            .sort((a, b) => a.test.test_no - b.test.test_no);

          return {
            topic,
            count: tests.reduce((s, t) => s + t.count, 0),
            tests,
          };
        }
      );

      return {
        subject,
        count: topics.reduce((s, t) => s + t.count, 0),
        topics: topics.sort((a, b) => a.topic.localeCompare(b.topic, "tr")),
      };
    }
  );

  subjects.sort((a, b) => a.subject.localeCompare(b.subject, "tr"));

  return {
    total: subjects.reduce((s, sub) => s + sub.count, 0),
    subjects,
  };
}

/** @deprecated use buildQuestionTree */
export const buildPendingTree = buildQuestionTree;
