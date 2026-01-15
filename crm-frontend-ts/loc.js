// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

const exts = [".ts", ".tsx", ".js", ".jsx"];
const excludeDirs = ["node_modules"];
const excludeFiles = [
  /\.env/,
  /\.log$/,
  /\.md$/,
  /package(-lock)?\.json/,
  /\.config\./,
];

let totalLines = 0;

function countLinesInFile(filePath) {
  const contents = fs.readFileSync(filePath, "utf-8");
  return contents.split("\n").length;
}

function walk(dir) {
  if (excludeDirs.some((d) => dir.includes(d))) return;

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else {
      const ext = path.extname(file);
      if (exts.includes(ext) && !excludeFiles.some((r) => r.test(file))) {
        totalLines += countLinesInFile(fullPath);
      }
    }
  }
}

walk(".");

console.log(`Total lines of code: ${totalLines}`);
