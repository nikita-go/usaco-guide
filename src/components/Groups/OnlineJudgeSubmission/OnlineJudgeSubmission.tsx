import type firebaseType from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useFirebaseApp } from '../../../hooks/useFirebase';
import { Submission, SubmissionType } from '../../../models/groups/problem';
import TestCaseResult from './TestCaseResult';

const OnlineJudgeSubmission = ({
  submissionDoc,
}: {
  submissionDoc: firebaseType.DocumentReference;
}): JSX.Element => {
  const [submission, setSubmission] = useState<
    (Submission & { type: SubmissionType.ONLINE_JUDGE }) | null
  >(null);
  const firebaseApp = useFirebaseApp();

  useEffect(() => {
    if (!submissionDoc || !firebaseApp) {
      setSubmission(null);
      return;
    }

    const unsub = onSnapshot(submissionDoc, doc => {
      console.log(submissionDoc.id, doc.data());
      setSubmission(
        doc.data() as Submission & { type: SubmissionType.ONLINE_JUDGE }
      );
    });
    return unsub;
  }, [submissionDoc, firebaseApp]);

  if (!submission) return null;

  return (
    <div>
      <div>
        {submission.gradingStatus === 'waiting' &&
          'Waiting for an available grading server...'}
        {submission.gradingStatus === 'in_progress' && 'Grading in progress'}
        {submission.gradingStatus === 'done' &&
          (submission.compilationError ? 'Compilation Error' : 'Done')}
      </div>
      {submission.compilationError === true && (
        <pre className="text-red-800 dark:text-red-200">
          {submission.compilationErrorMessage}
        </pre>
      )}
      {submission.compilationError === false && (
        <div>
          {submission.testCases.map(tc => (
            <TestCaseResult data={tc} key={tc.caseId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnlineJudgeSubmission;
