import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Sidebar } from "@/components/layout/Sidebar";
import DirectoryPage from "@/pages/directory";
import UploadPage from "@/pages/upload";
import ReviewQueuePage from "@/pages/review-queue";
import ReviewDetailPage from "@/pages/review-detail";
import CreditorsNewPage from "@/pages/creditors-new";
import ActivityPage from "@/pages/activity";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
    }
  }
});

function Router() {
  return (
    <Sidebar>
      <Switch>
        <Route path="/" component={DirectoryPage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/review-queue" component={ReviewQueuePage} />
        <Route path="/review-queue/:id" component={ReviewDetailPage} />
        <Route path="/creditors/new" component={CreditorsNewPage} />
        <Route path="/activity" component={ActivityPage} />
        <Route component={NotFound} />
      </Switch>
    </Sidebar>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
