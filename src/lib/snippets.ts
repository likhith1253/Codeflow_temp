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

export async function upsertSnippet(
  snippet: Partial<Snippet> & { title: string; code: string; language: string }
): Promise<Snippet | null> {
  // If we have an ID, we're updating. If not, we're inserting.
  // However, Supabase upsert requires the primary key to be present to update.
  // If we don't have an ID, we should just insert.
  
  if (snippet.id) {
    const { data, error } = await supabase
      .from("snippets")
      .upsert({
        id: snippet.id,
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting snippet:", error);
      throw error;
    }
    return data;
  } else {
    // Fallback to saveSnippet if no ID (create new)
    return saveSnippet(snippet.title, snippet.code, snippet.language);
  }
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
