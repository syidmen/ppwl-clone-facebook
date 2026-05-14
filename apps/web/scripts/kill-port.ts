import { execSync } from "child_process";

const port = process.argv[2] || "5173";

try {
  const pids = execSync(`lsof -ti :${port}`).toString().trim();
  if (pids) {
    execSync(`kill -9 ${pids.split("\n").join(" ")}`);
    console.log(`Killed process on port ${port}`);
  }
} catch {
  // Port sudah kosong, tidak perlu kill
}
