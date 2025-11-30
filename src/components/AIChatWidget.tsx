import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "model";
    text: string;
}

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiKeyMissing, setApiKeyMissing] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Initialize Gemini
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        if (!apiKey) {
            console.warn("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
            setApiKeyMissing(true);
        }
    }, [apiKey]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || apiKeyMissing) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // User requested gemini-2.5-flash. If unavailable, this will throw an error which we now display.
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Construct history for context
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const chat = model.startChat({
                history: history,
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();

            setMessages((prev) => [...prev, { role: "model", text: text }]);
        } catch (error: any) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage = error.message || "Unknown error occurred";
            setMessages((prev) => [
                ...prev,
                { role: "model", text: `Error: ${errorMessage}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isOpen]);

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
                size="icon"
            >
                <MessageCircle className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Card className={cn(
            "fixed bottom-4 right-4 z-50 flex flex-col shadow-xl transition-all duration-300",
            isMinimized ? "h-14 w-72" : "h-[500px] w-[350px] sm:w-[400px]"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 border-b">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Gemini Assistant
                </CardTitle>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>

            {!isMinimized && (
                <>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                            {apiKeyMissing && (
                                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-xs">
                                    API Key missing. Please check console for details.
                                </div>
                            )}
                            {messages.length === 0 && !apiKeyMissing && (
                                <div className="text-center text-muted-foreground text-sm mt-10">
                                    <p>Hi! I'm your AI assistant.</p>
                                    <p>Ask me anything about your code.</p>
                                </div>
                            )}
                            <div className="space-y-4">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex w-full",
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-foreground"
                                            )}
                                        >
                                            {msg.role === "model" ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                                    <ReactMarkdown
                                                        components={{
                                                            code(props) {
                                                                const { children, className, ...rest } = props
                                                                const match = /language-(\w+)/.exec(className || '')
                                                                return match ? (
                                                                    <code className={className} {...rest}>
                                                                        {children}
                                                                    </code>
                                                                ) : (
                                                                    <code className={className} {...rest}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-lg px-3 py-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-3 border-t">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex w-full items-center gap-2"
                        >
                            <Input
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading || apiKeyMissing}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || apiKeyMissing}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </>
            )}
        </Card>
    );
};

export default AIChatWidget;
