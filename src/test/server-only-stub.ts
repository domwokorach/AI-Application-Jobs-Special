// Vitest runs in plain Node, where the real `server-only` package (bundled and aliased by
// Next.js itself at build time) isn't resolvable. This stub is aliased in vitest.config.ts so
// `import "server-only"` in application code is a no-op under tests, exactly like it already is
// under Next's own build.
export {};
