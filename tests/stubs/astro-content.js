// Stand-in for Astro's `astro:content` virtual module, which is only available
// inside a build. Anything that genuinely needs content collections belongs in
// the integration test, where a real build runs.

export const getCollection = async () => {
  throw new Error('getCollection is unavailable in unit tests — cover it in tests/integration instead');
};
