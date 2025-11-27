import { supabase } from "@/integrations/supabase/client";

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export async function saveSnippet(title: string, code: string, language: string): Promise<Snippet | null> {
  const { data, error } = await supabase
    .from("snippets")
    .insert({ title, code, language })
    .select()
    .single();

  if (error) {
    console.error("Error saving snippet:", error);
    throw error;
  }

  return data;
}

export async function getAllSnippets(): Promise<Snippet[]> {
  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching snippets:", error);
    throw error;
  }

  return data || [];
}

export async function deleteSnippet(id: string): Promise<void> {
  const { error } = await supabase
    .from("snippets")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting snippet:", error);
    throw error;
  }
}
