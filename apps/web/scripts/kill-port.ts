import { execSync } from "child_process";

const port = process.argv[2] || "5173";

function killPortOnWindows() {
  const output = execSync(`netstat -ano | findstr :${port}`).toString();
  const pids = new Set<string>();

  for (const line of output.split("\n")) {
    const columns = line.trim().split(/\s+/);
    const localAddress = columns[1];
    const state = columns[3];
    const pid = columns[4];

    if (localAddress?.endsWith(`:${port}`) && state === "LISTENING" && pid && pid !== "0") {
      pids.add(pid);
    }
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "pipe" });
      console.log(`Killed process ${pid} on port ${port}`);
    } catch {
      throw new Error(
        `Gagal menghentikan process ${pid} di port ${port}. Tutup terminal dev lama atau jalankan terminal sebagai administrator.`
      );
    }
  }
}

function killPortOnUnix() {
  const pids = execSync(`lsof -ti :${port}`).toString().trim();

  if (pids) {
    execSync(`kill -9 ${pids.split("\n").join(" ")}`);
    console.log(`Killed process on port ${port}`);
  }
}

try {
  if (process.platform === "win32") {
    killPortOnWindows();
  } else {
    killPortOnUnix();
  }
} catch (error) {
  if (error instanceof Error && error.message.includes("Gagal menghentikan")) {
    console.error(error.message);
    process.exit(1);
  }

  // Port sudah kosong, tidak perlu kill.
}
