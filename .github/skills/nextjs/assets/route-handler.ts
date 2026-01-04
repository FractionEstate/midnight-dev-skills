// @ts-nocheck
// Next.js Route Handler Template
// Location: app/api/[resource]/route.ts
// REST API endpoints with validation and error handling

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const createSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
});

const updateSchema = createSchema.partial();

// Types
interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper: Standard JSON response
function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

// Helper: Error response
function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// GET /api/items - List all items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch from database
    // const items = await db.item.findMany({
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { createdAt: 'desc' },
    // });
    // const total = await db.item.count();

    const items: unknown[] = [];
    const total = 0;

    return json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/items error:', err);
    return error('Failed to fetch items', 500);
  }
}

// POST /api/items - Create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return error(result.error.errors[0].message, 400);
    }

    // Create in database
    // const item = await db.item.create({
    //   data: result.data,
    // });

    return json({ ...result.data }, 201);
  } catch (err) {
    console.error('POST /api/items error:', err);
    return error('Failed to create item', 500);
  }
}

// For dynamic routes: app/api/items/[id]/route.ts

// GET /api/items/[id]
export async function GETById(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  // const item = await db.item.findUnique({
  //   where: { id },
  // });

  const item = null;

  if (!item) {
    return error('Item not found', 404);
  }

  return json(item);
}

// PUT /api/items/[id]
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const body = await request.json();

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return error(result.error.errors[0].message, 400);
  }

  // const item = await db.item.update({
  //   where: { id },
  //   data: result.data,
  // });

  return json({ id, ...result.data });
}

// DELETE /api/items/[id]
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  // await db.item.delete({
  //   where: { id },
  // });

  return new NextResponse(null, { status: 204 });
}
