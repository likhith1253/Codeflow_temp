import { Link } from "react-router-dom";
import { 
  Code2, 
  Zap, 
  Cloud, 
  Terminal, 
  ChevronRight, 
  Languages, 
  Save, 
  Play,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: Languages,
    title: "Multi-Language Support",
    description: "Write code in Python, C, C++, Java, and JavaScript with full syntax highlighting.",
  },
  {
    icon: Play,
    title: "Instant Execution",
    description: "Run your code instantly and see results in real-time with our powerful execution engine.",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description: "Save your code snippets securely in the cloud and access them from anywhere.",
  },
  {
    icon: Save,
    title: "Snippet Library",
    description: "Build your personal library of code snippets for quick reference and reuse.",
  },
];

const codeSnippet = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`;

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-slide-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">Code anywhere, anytime</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
                Write, Run, and
                <span className="gradient-text"> Save Code</span>
                <br />
                in the Cloud
              </h1>
              <p className="mb-8 max-w-lg text-lg text-muted-foreground">
                A powerful online code editor with multi-language support, instant execution, 
                and cloud storage. Start coding in seconds, no setup required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/editor">
                  <Button variant="hero" size="xl">
                    <Terminal className="mr-2 h-5 w-5" />
                    Try Editor
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/editor">
                  <Button variant="outline" size="xl">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Code Preview */}
            <div className="animate-slide-up relative hidden lg:block" style={{ animationDelay: "0.2s" }}>
              <div className="glow-effect overflow-hidden rounded-xl border border-editor-border bg-editor-bg shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/70" />
                  <div className="h-3 w-3 rounded-full bg-warning/70" />
                  <div className="h-3 w-3 rounded-full bg-success/70" />
                  <span className="ml-2 text-xs text-muted-foreground">fibonacci.js</span>
                </div>
                <pre className="p-6 font-mono text-sm leading-relaxed">
                  <code className="text-foreground">{codeSnippet}</code>
                </pre>
              </div>
              {/* Floating elements */}
              <div className="animate-float absolute -right-6 -top-6 rounded-lg border border-primary/30 bg-card/80 p-3 shadow-lg backdrop-blur">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="animate-float absolute -bottom-4 -left-4 rounded-lg border border-accent/30 bg-card/80 p-3 shadow-lg backdrop-blur" style={{ animationDelay: "1s" }}>
                <Code2 className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Everything You Need to <span className="gradient-text">Code</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A complete development environment in your browser with all the tools you need to write, 
              test, and save your code.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Supported <span className="gradient-text">Languages</span>
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-muted-foreground">
              Write code in your favorite programming language with full syntax highlighting and intelligent code completion.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Python", "C", "C++", "Java", "JavaScript"].map((lang) => (
                <div
                  key={lang}
                  className="rounded-xl border border-border bg-secondary/50 px-8 py-4 text-lg font-medium transition-all hover:border-primary/50 hover:bg-secondary"
                >
                  {lang}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-background to-card/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
            Ready to Start <span className="gradient-text">Coding</span>?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Jump into the editor and start writing code immediately. No sign-up required.
          </p>
          <Link to="/editor">
            <Button variant="glow" size="xl">
              <Terminal className="mr-2 h-5 w-5" />
              Launch Editor
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">CodeFlow</span>
          </div>
          <p>© 2024 CodeFlow. Built for developers, by developers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
