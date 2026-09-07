export function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = codeBlock ? codeBlock[1].trim() : trimmed;
  return JSON.parse(jsonText) as T;
}
