import { loadConfig } from "./config";

let appPromise: Promise<typeof import("./app").app> | undefined;

async function getApp() {
  await loadConfig();

  if (!appPromise) {
    appPromise = import("./app").then((module) => module.app);
  }

  return appPromise;
}

function getMethod(event: any) {
  return event.requestContext?.http?.method ?? event.httpMethod ?? "GET";
}

function getRequestUrl(event: any) {
  const host = event.headers?.host ?? event.headers?.Host ?? "localhost";
  const path = event.rawPath ?? event.path ?? "/";
  const query = event.rawQueryString ? `?${event.rawQueryString}` : "";

  return `https://${host}${path}${query}`;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.WEB_ORIGIN ?? "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true"
  };
}

export async function handler(event: any) {
  await loadConfig();

  const method = getMethod(event);

  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        ...corsHeaders(),
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Max-Age": "86400"
      },
      body: ""
    };
  }

  const app = await getApp();
  const hasBody = Boolean(event.body) && method !== "GET" && method !== "HEAD";

  const response = await app.handle(
    new Request(getRequestUrl(event), {
      method,
      headers: event.headers ?? {},
      body: hasBody
        ? Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
        : undefined
    })
  );

  return {
    statusCode: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      ...corsHeaders()
    },
    body: await response.text(),
    isBase64Encoded: false
  };
}
