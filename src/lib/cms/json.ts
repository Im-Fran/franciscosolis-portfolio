/**
 * Reading and writing the free-form `data` object of a record.
 *
 * Each collection validates its own shape server-side and rejects a field it does not know, but the
 * schema is not exposed to the client — so the interface refuses to guess one and lets the service
 * be the authority. An empty field means "send nothing", and anything else has to parse to a JSON
 * *object*: an array or a bare string would satisfy `JSON.parse` and then be rejected by the API.
 */
export const parseJsonObject = (
  text: string,
): {ok: true; value: Record<string, unknown> | undefined} | {ok: false; error: string} => {
  const trimmed = text.trim();
  if (!trimmed) return {ok: true, value: undefined};

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (cause) {
    return {ok: false, error: cause instanceof Error ? cause.message : "invalid-json"};
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {ok: false, error: "not-an-object"};
  }
  return {ok: true, value: parsed as Record<string, unknown>};
};

/** Pretty-prints a stored object back into the field, or an empty string when there is nothing. */
export const stringifyJson = (value: Record<string, unknown> | null | undefined) =>
  value && Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : "";
