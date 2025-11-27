import { Terminal, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutputConsoleProps {
  output: string;
  isLoading: boolean;
  isError: boolean;
  executionTime?: number;
}

const OutputConsole = ({ output, isLoading, isError, executionTime }: OutputConsoleProps) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-editor-border bg-console-bg">
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Output</span>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="flex items-center gap-1 text-xs text-warning">
              <Loader2 className="h-3 w-3 animate-spin" />
              Running...
            </span>
          )}
          {!isLoading && output && !isError && (
            <span className="flex items-center gap-1 text-xs text-success">
              <CheckCircle className="h-3 w-3" />
              Success
            </span>
          )}
          {!isLoading && isError && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <XCircle className="h-3 w-3" />
              Error
            </span>
          )}
          {executionTime !== undefined && !isLoading && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {executionTime}ms
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Executing code...</span>
            </div>
          </div>
        ) : output ? (
          <pre
            className={cn(
              "whitespace-pre-wrap font-mono text-sm leading-relaxed",
              isError ? "text-destructive" : "text-foreground"
            )}
          >
            {output}
          </pre>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-muted-foreground">
              Click "Run" to execute your code
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;
