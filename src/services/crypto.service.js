// crypto.service.js
import * as crypto from "crypto";
import bcrypt from "bcryptjs";

const { AES_SECRET } = process.env;

if (!AES_SECRET || AES_SECRET.length !== 32) {
  throw new Error("AES_SECRET must be exactly 32 characters long");
}

// Hesovanje lozinki
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

// Generisanje nasumičnog tokena (npr. za reset lozinke)
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

// AES-256-GCM enkripcija (za phone, message, itd.)
const ALGO = "aes-256-gcm";
const KEY = Buffer.from(AES_SECRET, "utf8");

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

// SHA256 (npr. za API ključeve ili proveru integriteta)
export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}