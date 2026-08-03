import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';
import { Switch, Route, useLocation, Redirect, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import Landing from '@/pages/landing';
import WordWatchApp from '@/pages/app';

const queryClient = new QueryClient();

// REQUIRED — copy verbatim
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#C9A84C",
    colorBackground: "#0f0e0c",
    colorForeground: "#f5f0e8",
    colorInput: "#1a1a16",
    colorInputForeground: "#f5f0e8",
    colorNeutral: "#3a3a32",
    colorMutedForeground: "#a1a1aa",
    colorDanger: "#ef4444",
    fontFamily: "DM Sans, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0f0e0c] border border-[#3a3a32] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl shadow-black/50",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#f5f0e8] font-serif text-2xl",
    headerSubtitle: "text-[#a1a1aa]",
    socialButtonsBlockButtonText: "text-[#f5f0e8] font-medium",
    formFieldLabel: "text-[#f5f0e8] font-medium",
    footerActionLink: "text-[#C9A84C] hover:text-[#C9A84C]/80 font-medium",
    footerActionText: "text-[#a1a1aa]",
    dividerText: "text-[#a1a1aa]",
    identityPreviewEditButton: "text-[#C9A84C]",
    formFieldSuccessText: "text-green-500",
    alertText: "text-red-500",
    logoBox: "flex justify-center",
    logoImage: "h-12 w-auto",
    socialButtonsBlockButton: "border-[#3a3a32] hover:bg-[#1a1a16]",
    formButtonPrimary: "bg-[#C9A84C] hover:bg-[#C9A84C]/80 text-[#0f0e0c] font-serif tracking-wide text-lg",
    formFieldInput: "bg-[#1a1a16] border-[#3a3a32] text-[#f5f0e8]",
    footerAction: "bg-[#0f0e0c]",
    dividerLine: "bg-[#3a3a32]",
    alert: "border-red-500/50 bg-red-500/10",
    otpCodeFieldInput: "border-[#3a3a32] text-[#f5f0e8]",
    formFieldRow: "mb-4",
    main: "mt-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/app" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function AppPage() {
  return (
    <>
      <Show when="signed-in">
        <WordWatchApp />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your account",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Get started today",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/app" component={AppPage} />
            <Route component={() => (
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-serif text-primary">404</h1>
                  <p className="text-muted-foreground">The page you seek has been lost to the archives.</p>
                </div>
              </div>
            )} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;