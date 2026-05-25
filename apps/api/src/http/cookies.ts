import type { Request, Response } from "express";
import { env } from "../config/env";

export function parseCookies(request: Request) {
  const header = request.headers.cookie;

  if (!header) {
    return {};
  }

  return Object.fromEntries(
    header.split(";").map((cookie) => {
      const [rawName, ...rawValue] = cookie.trim().split("=");
      return [rawName, decodeURIComponent(rawValue.join("="))];
    })
  ) as Record<string, string>;
}

export function setHttpOnlyCookie(response: Response, name: string, value: string, maxAgeSeconds: number) {
  const secure = env.NODE_ENV === "production";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${maxAgeSeconds}`
  ];

  if (secure) {
    parts.push("Secure");
  }

  response.setHeader("Set-Cookie", [...getSetCookie(response), parts.join("; ")]);
}

export function setReadableCookie(response: Response, name: string, value: string, maxAgeSeconds: number) {
  const secure = env.NODE_ENV === "production";
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Strict", `Max-Age=${maxAgeSeconds}`];

  if (secure) {
    parts.push("Secure");
  }

  response.setHeader("Set-Cookie", [...getSetCookie(response), parts.join("; ")]);
}

export function clearCookie(response: Response, name: string) {
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", [...getSetCookie(response), `${name}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`]);
}

function getSetCookie(response: Response) {
  const current = response.getHeader("Set-Cookie");

  if (!current) {
    return [];
  }

  return Array.isArray(current) ? current.map(String) : [String(current)];
}
