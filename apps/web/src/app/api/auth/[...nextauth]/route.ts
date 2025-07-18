
/**
 * @fileoverview Deprecated NextAuth route - redirects to new auth system
 * @description This route has been replaced with custom JWT authentication
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      error: 'NextAuth has been replaced with custom JWT authentication',
      message: 'Please use /api/auth/login, /api/auth/register, /api/auth/logout, or /api/auth/me',
    },
    { status: 410 } // Gone
  );
}

export async function POST() {
  return NextResponse.json(
    { 
      error: 'NextAuth has been replaced with custom JWT authentication',
      message: 'Please use /api/auth/login, /api/auth/register, /api/auth/logout, or /api/auth/me',
    },
    { status: 410 } // Gone
  );
}
