import path from "path";

const relative = (filenames: string[]) => filenames.map((f) => path.relative(process.cwd(), f)).join(" ");

const lintStagedConfig = {
  "**/*.ts?(x)": () => "pnpm run typecheck",
  "**/*.{js,jsx,mjs,mts,ts,tsx}": (filenames: string[]) => `oxlint --fix ${relative(filenames)}`,
  "**/*.{js,jsx,mjs,mts,ts,tsx,json,css,scss,md,yml,yaml}": (filenames: string[]) =>
    `oxfmt --no-error-on-unmatched-pattern ${relative(filenames)}`,
};

export default lintStagedConfig;
