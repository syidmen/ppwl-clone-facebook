import { app } from "./app";
import { env } from "./env";

const port = Number(env("PORT", "3000"));

app.listen(port);

console.log(`API running at http://localhost:${app.server?.port}`);
