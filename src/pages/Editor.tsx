import { useState, useEffect } from "react";
import { Play, Save, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import EditorComponent from "@/components/EditorComponent";
import OutputConsole from "@/components/OutputConsole";
import SnippetList from "@/components/SnippetList";
import { saveSnippet, getAllSnippets, deleteSnippet, Snippet } from "@/lib/snippets";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "arduino", label: "Arduino" },
];

const defaultCode: Record<string, string> = {
  javascript: `// JavaScript Example
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
  python: `# Python Example
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`,
  c: `// C Example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  php: `<?php
// PHP Example
function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet("World") . "\\n";
?>`,
  ruby: `# Ruby Example
def greet(name)
  "Hello, #{name}!"
end

puts greet("World")`,
  go: `// Go Example
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  arduino: `// Arduino Example (C++ based)
// Note: This compiles as C++ code

void setup() {
    // Initialize serial communication
    // Serial.begin(9600);
}

void loop() {
    // Main code here
}

int main() {
    // For testing without Arduino hardware
    setup();
    return 0;
}`,
};

const EditorPage = () => {
  const [code, setCode] = useState(defaultCode.javascript);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(true);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    setIsLoadingSnippets(true);
    try {
      const data = await getAllSnippets();
      setSnippets(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load snippets",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSnippets(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!selectedSnippetId) {
      setCode(defaultCode[newLanguage] || "");
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setIsError(false);
    setExecutionTime(undefined);
    
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("execute-code", {
        body: { language, code },
      });

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (error) {
        setIsError(true);
        setOutput(error.message || "An error occurred while executing the code");
        return;
      }

      if (data.error) {
        setIsError(true);
        setOutput(data.error);
      } else {
        setOutput(data.output || "Program executed successfully (no output)");
      }
    } catch (error: any) {
      setIsError(true);
      setOutput(error.message || "Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = async () => {
    if (!snippetTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your snippet",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveSnippet(snippetTitle, code, language);
      toast({
        title: "Success",
        description: "Snippet saved successfully!",
      });
      setSaveDialogOpen(false);
      setSnippetTitle("");
      loadSnippets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save snippet",
        variant: "destructive",
      });
    }
  };

  const handleSelectSnippet = (snippet: Snippet) => {
    setSelectedSnippetId(snippet.id);
    setCode(snippet.code);
    setLanguage(snippet.language);
    setOutput("");
    setIsError(false);
    setExecutionTime(undefined);
  };

  const handleDeleteSnippet = async (id: string) => {
    try {
      await deleteSnippet(id);
      toast({
        title: "Success",
        description: "Snippet deleted successfully!",
      });
      if (selectedSnippetId === id) {
        setSelectedSnippetId(undefined);
        setCode(defaultCode[language] || "");
      }
      loadSnippets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete snippet",
        variant: "destructive",
      });
    }
  };

  const handleNewSnippet = () => {
    setSelectedSnippetId(undefined);
    setCode(defaultCode[language] || "");
    setOutput("");
    setIsError(false);
    setExecutionTime(undefined);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />
      
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
          </Button>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSnippetId && (
            <Button variant="ghost" size="sm" onClick={handleNewSnippet}>
              New File
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSaveDialogOpen(true)}
            disabled={isRunning}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={handleRun} disabled={isRunning} variant="success">
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0 overflow-hidden lg:w-12"
          )}
        >
          {sidebarOpen ? (
            <>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-medium">Snippets</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SnippetList
                  snippets={snippets}
                  onSelect={handleSelectSnippet}
                  onDelete={handleDeleteSnippet}
                  selectedId={selectedSnippetId}
                  isLoading={isLoadingSnippets}
                />
              </div>
            </>
          ) : (
            <div className="hidden lg:flex lg:flex-col lg:items-center lg:pt-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Editor and Output */}
        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex-1 p-3">
            <EditorComponent
              code={code}
              language={language}
              onChange={(value) => setCode(value || "")}
            />
          </div>
          <div className="h-64 p-3 lg:h-auto lg:w-[400px]">
            <OutputConsole
              output={output}
              isLoading={isRunning}
              isError={isError}
              executionTime={executionTime}
            />
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Snippet</DialogTitle>
            <DialogDescription>
              Give your code snippet a name to save it to your library.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Snippet title..."
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditorPage;
