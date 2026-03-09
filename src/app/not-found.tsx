"use client";

import { ArrowLeft, Home, Ghost } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  const handleHomeClick = () => {
    window.location.href = "/";
  };

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center px-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ghost className="h-16 w-16 text-foreground-muted" />
          </EmptyMedia>
          <EmptyTitle className="text-4xl font-bold gradient-text">
            404
          </EmptyTitle>
          <EmptyDescription className="text-lg">
            The page you&apos;re looking for doesn&apos;t exist. It may have
            been moved or deleted.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={handleHomeClick}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-background px-5 py-2.5 text-sm font-medium transition-all hover:bg-primary-light group"
            >
              <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
              Go Home
            </button>

            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 rounded-lg border border-primary text-primary px-5 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Go Back
            </button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
