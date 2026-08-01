const RESTRICTED_NAME_PATTERN = /[\\/:*?"<>|#^[\]]/;

export function getNameValidationError(value: string): string | null {
  const match = value.match(RESTRICTED_NAME_PATTERN);
  return match ? `"${match[0]}" isn't allowed in names. Try "-" or "_" instead.` : null;
}