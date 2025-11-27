import { useState } from "react";
import { Code, Clock, ChevronRight, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
}

interface SnippetListProps {
  snippets: Snippet[];
  onSelect: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
  isLoading: boolean;
}

const languageColors: Record<string, string> = {
  python: "bg-yellow-500/20 text-yellow-400",
  c: "bg-blue-500/20 text-blue-400",
  cpp: "bg-blue-600/20 text-blue-300",
  java: "bg-orange-500/20 text-orange-400",
  javascript: "bg-amber-500/20 text-amber-400",
};

const SnippetList = ({
  snippets,
  onSelect,
  onDelete,
  selectedId,
  isLoading,
}: SnippetListProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading snippets...</span>
        </div>
      </div>
    );
  }

  if (snippets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">No snippets yet</p>
          <p className="text-xs text-muted-foreground/70">
            Save your code to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-2">
        {snippets.map((snippet) => (
          <div
            key={snippet.id}
            className={cn(
              "group relative cursor-pointer rounded-lg border border-transparent p-3 transition-all duration-200",
              selectedId === snippet.id
                ? "border-primary bg-primary/10"
                : "hover:border-border hover:bg-secondary/50"
            )}
            onClick={() => onSelect(snippet)}
            onMouseEnter={() => setHoveredId(snippet.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Code className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate text-sm font-medium text-foreground">
                  {snippet.title}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                    languageColors[snippet.language] || "bg-muted text-muted-foreground"
                  )}
                >
                  {snippet.language}
                </span>
                {hoveredId === snippet.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(snippet.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
            </div>
            <ChevronRight
              className={cn(
                "absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-opacity",
                selectedId === snippet.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"
              )}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SnippetList;
