import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { app } from "./app";

function toRequest(event: APIGatewayProxyEventV2) {
  const protocol = event.headers["x-forwarded-proto"] ?? "https";
  const host = event.headers.host ?? "localhost";
  const path = event.rawPath ?? "/";
  const query = event.rawQueryString ? `?${event.rawQueryString}` : "";
  const method = event.requestContext.http.method;

  return new Request(`${protocol}://${host}${path}${query}`, {
    method,
    headers: event.headers as HeadersInit,
    body: event.body
      ? event.isBase64Encoded
        ? Buffer.from(event.body, "base64")
        : event.body
      : undefined
  });
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  const response = await app.handle(toRequest(event));
  const headers = Object.fromEntries(response.headers.entries());
  const body = await response.text();

  return {
    statusCode: response.status,
    headers,
    body
  };
}
