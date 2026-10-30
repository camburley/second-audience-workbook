const ATTRIBUTION_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content",
  "utm_term", "a2_ref", "experiment_id",
] as const;

export function courseUrl(search: string): string {
  const destination = new URL("https://audiencetwo.com/second-audience");
  const params = new URLSearchParams(search);
  for (const key of ATTRIBUTION_KEYS) {
    const values = params.getAll(key);
    if (values.length !== 1) continue;
    const value = values[0].trim();
    if (value && value.length <= 256) destination.searchParams.set(key, value);
  }
  return destination.toString();
}
