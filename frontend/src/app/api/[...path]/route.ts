import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function proxyRequest(request: NextRequest, path: string) {
  const url = `${BACKEND_URL}/api/${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Forward authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward body for non-GET requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    } catch {
      // No body
    }
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Backend server unavailable' },
      { status: 503 }
    );
  }
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params;
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = searchParams ? `${pathString}?${searchParams}` : pathString;
  return proxyRequest(request, fullPath);
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params;
  return proxyRequest(request, path.join('/'));
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params;
  return proxyRequest(request, path.join('/'));
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params;
  return proxyRequest(request, path.join('/'));
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params;
  return proxyRequest(request, path.join('/'));
}
