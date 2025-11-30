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
  // Top Tier (Most Reliable)
  { value: "javascript", label: "JavaScript (Node.js)" },
  { value: "python", label: "Python 3.8.1" },
  { value: "java", label: "Java (OpenJDK 13.0.1)" },
  { value: "c", label: "C (GCC 9.2.0)" },
  { value: "cpp", label: "C++ (GCC 9.2.0)" },
  
  // Second Tier (Very Reliable)
  { value: "csharp", label: "C# (Mono 6.6.0.161)" },
  { value: "go", label: "Go 1.13.5" },
  { value: "ruby", label: "Ruby 2.7.0" },
  { value: "php", label: "PHP 7.4.1" },
  { value: "bash", label: "Bash 5.0.0" }
];

const defaultCode: Record<string, string> = {
  // Top Tier (Most Reliable)
  javascript: `// JavaScript (Node.js) Example
// Fast execution, excellent for web development
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Example: Calculate factorial
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

console.log(greet("World"));
console.log(\`Factorial of 5: \${factorial(5)}\`);`,

  python: `# Python 3.8.1 Example
# Reliable execution, great for learning

def greet(name):
    return f"Hello, {name}!"

# Example: List comprehension
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]

print(greet("World"))
print(f"Squares: {squares}")`,

  java: `// Java (OpenJDK 13.0.1) Example
// Excellent for algorithms and data structures
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example: Simple algorithm
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        System.out.println("Sum of numbers: " + sum);
    }
}`,

  c: `// C (GCC 9.2.0) Example
// Fast compilation, great for system programming
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Example: Simple pointer usage
    int x = 42;
    int *ptr = &x;
    printf("Value of x: %d\\n", *ptr);
    
    return 0;
}`,

  cpp: `// C++ (GCC 9.2.0) Example
// Great for algorithms and performance
#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello, World!" << std::endl;
    
    // Example: Using STL
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::cout << "Vector elements: ";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`,

  // Second Tier (Very Reliable)
  csharp: `// C# (Mono 6.6.0.161) Example
// Great for .NET development
using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        
        // Example: LINQ query
        int[] numbers = { 1, 2, 3, 4, 5 };
        var evenNumbers = numbers.Where(n => n % 2 == 0);
        Console.WriteLine("Even numbers: " + string.Join(", ", evenNumbers));
    }
}`,

  go: `// Go 1.13.5 Example
// Fast compilation, simple concurrency
package main

import (
    "fmt"
    "sync"
)

func main() {
    fmt.Println("Hello, World!")
    
    // Example: Goroutines
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go func(n int) {
            defer wg.Done()
            fmt.Printf("Goroutine %d\\n", n)
        }(i)
    }
    wg.Wait()
}`,

  ruby: `# Ruby 2.7.0 Example
# Clean syntax, great for scripting

def greet(name)
  "Hello, #{name}!"
end

# Example: Using blocks and ranges
numbers = (1..5).to_a
squares = numbers.map { |n| n ** 2 }

puts greet("World")
puts "Squares: #{squares.join(', ')}"`,

  php: `<?php
// PHP 7.4.1 Example
// Great for web development
function greet($name) {
    return "Hello, $name!";
}

// Example: Working with arrays
$fruits = ["apple", "banana", "cherry"];
$uppercased = array_map('strtoupper', $fruits);

echo greet("World") . "\\n";
print_r($uppercased);
?>`,

  bash: `#!/bin/bash
# Bash 5.0.0 Example
# Excellent for shell scripting


greet() {
    local name=$1
    echo "Hello, $name!"
}


# Example: Command substitution and loops
echo "Current directory: $(pwd)"
echo "Files in directory:"
for file in *; do
    if [ -f "$file" ]; then
        echo "- $file"
    fi
done


greet "World"`
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

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setCode(defaultCode[value] || '');
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
