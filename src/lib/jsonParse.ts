export function safeJsonParse(str: string) {
  if (!str) {return null};

  // Remove code fences like ```json ... ```
  const cleaned = str.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("❌ Failed to parse JSON:", e, cleaned);
    
    return null;
  }
}
