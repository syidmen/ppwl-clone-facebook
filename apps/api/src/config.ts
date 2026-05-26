import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const defaultPrefix = "/ppwl-social-media/production";
const parameterPrefix = process.env.SSM_PREFIX ?? defaultPrefix;

const parameterNames = [
  "DATABASE_URL",
  "JWT_SECRET",
  "ADMIN_SECRET_KEY",
  "WEB_ORIGIN",
  "GOOGLE_CLIENT_ID",
  "S3_IMAGE_BUCKET",
  "S3_IMAGE_PREFIX"
].map((name) => `${parameterPrefix}/${name}`);

let loaded = false;

function hasRuntimeConfig() {
  return Boolean(
    process.env.DATABASE_URL &&
      process.env.JWT_SECRET &&
      process.env.ADMIN_SECRET_KEY
  );
}

export async function loadConfig() {
  if (loaded) return;
  if (hasRuntimeConfig()) {
    loaded = true;
    return;
  }

  const response = await ssm.send(
    new GetParametersCommand({
      Names: parameterNames,
      WithDecryption: true
    })
  );

  for (const parameter of response.Parameters ?? []) {
    if (!parameter.Name || !parameter.Value) continue;

    const key = parameter.Name.split("/").pop();
    if (key) process.env[key] = parameter.Value;
  }

  const invalidParameters = response.InvalidParameters ?? [];
  if (invalidParameters.length > 0) {
    console.warn("SSM parameters not found:", invalidParameters.join(", "));
  }

  loaded = true;
}
