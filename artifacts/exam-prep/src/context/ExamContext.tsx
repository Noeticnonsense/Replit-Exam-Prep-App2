import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { MockExam, MockExamResult } from '@workspace/api-client-react/src/generated/api.schemas';

interface ExamContextType {
  examName: string;
  state: string;
  setExamContext: (examName: string, state: string) => void;
  mockExam: MockExam | null;
  setMockExam: (exam: MockExam | null) => void;
  mockExamResult: MockExamResult | null;
  setMockExamResult: (result: MockExamResult | null) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [examName, setExamName] = useState('');
  const [state, setState] = useState('');
  const [mockExam, setMockExam] = useState<MockExam | null>(null);
  const [mockExamResult, setMockExamResult] = useState<MockExamResult | null>(null);

  const setExamContext = (newExamName: string, newState: string) => {
    setExamName(newExamName);
    setState(newState);
  };

  return (
    <ExamContext.Provider value={{ examName, state, setExamContext, mockExam, setMockExam, mockExamResult, setMockExamResult }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExamContext() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExamContext must be used within an ExamProvider');
  }
  return context;
}
