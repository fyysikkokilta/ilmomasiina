const quote = (filenames: string[]) => filenames.map((f) => JSON.stringify(f)).join(" ");

const lintStagedConfig = {
  "**/*.ts?(x)": () => "pnpm run typecheck",
  "**/*.{js,jsx,mjs,mts,ts,tsx}": (filenames: string[]) => `oxlint --fix ${quote(filenames)}`,
  "**/*.{js,jsx,mjs,mts,ts,tsx,json,css,scss,md,yml,yaml}": (filenames: string[]) =>
    `oxfmt --no-error-on-unmatched-pattern ${quote(filenames)}`,
};

export default lintStagedConfig;
