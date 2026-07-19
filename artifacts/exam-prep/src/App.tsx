import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ExamProvider } from '@/context/ExamContext';
import { Shell } from '@/components/layout/Shell';

import Home from '@/pages/Home';
import ExamInfo from '@/pages/ExamInfo';
import StudyGuide from '@/pages/StudyGuide';
import MockExam from '@/pages/MockExam';
import Results from '@/pages/Results';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/exam-info" component={ExamInfo} />
      <Route path="/study-guide" component={StudyGuide} />
      <Route path="/mock-exam" component={MockExam} />
      <Route path="/results" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ExamProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Shell>
              <Router />
            </Shell>
          </WouterRouter>
        </ExamProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
