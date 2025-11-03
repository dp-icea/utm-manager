import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/shared/lib/lang";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/shared/ui/toaster";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  </ LanguageProvider>
);
