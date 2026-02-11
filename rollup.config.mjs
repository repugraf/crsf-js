import typescript from "@rollup/plugin-typescript";

const config = [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/esm/index.mjs",
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        sourceMap: true,
        declaration: true,
        declarationMap: true,
        declarationDir: "dist/esm/types",
        outDir: "dist/esm",
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/cjs/index.cjs",
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        sourceMap: true,
        declaration: true,
        declarationMap: true,
        declarationDir: "dist/cjs/types",
        outDir: "dist/cjs",
      }),
    ],
  },
];

export default config;
