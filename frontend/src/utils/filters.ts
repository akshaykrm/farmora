export type Filter = Record<string, string | number | null>;

export function overrideFilters(filter?: Filter, override?: Filter) {
  const opts = filter || {};
  if (override) {
    for (const k in override) {
      opts[k] = override[k];
    }
  }

  return opts;
}
