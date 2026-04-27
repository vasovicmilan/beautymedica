import * as crypto from "crypto";
import bcrypt from "bcryptjs";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const { AES_SECRET } = process.env;

if (!AES_SECRET) {
  throw new Error("AES_SECRET is missing in .env");
}

let KEY;
if (AES_SECRET.length === 64 && /^[0-9a-fA-F]+$/.test(AES_SECRET)) {
  KEY = Buffer.from(AES_SECRET, "hex");
} else {
  KEY = Buffer.from(AES_SECRET, "utf8");
}

if (KEY.length !== 32) {
  throw new Error(`AES_SECRET must produce a 32-byte key, got ${KEY.length} bytes. Use 64 hex chars or 32 UTF-8 chars.`);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

const ALGO = "aes-256-gcm";

export function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(payload) {
  const data = Buffer.from(payload, "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}