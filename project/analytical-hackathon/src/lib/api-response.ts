import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function apiError(
  message: string,
  status = 500,
  details?: string,
  extras?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
      ...(extras || {}),
    },
    { status },
  );
}
