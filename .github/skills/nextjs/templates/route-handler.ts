// Route Handler Template
// Location: app/api/[resource]/route.ts

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
    const items = await db.item.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await db.item.count();

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
    const item = await db.item.create({
      data: result.data,
    });

    return json(item, 201);
  } catch (err) {
    console.error('POST /api/items error:', err);
    return error('Failed to create item', 500);
  }
}

// --- For /api/items/[id]/route.ts ---

// GET /api/items/[id] - Get single item
export async function GET_BY_ID(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const item = await db.item.findUnique({
      where: { id },
    });

    if (!item) {
      return error('Item not found', 404);
    }

    return json(item);
  } catch (err) {
    console.error('GET /api/items/[id] error:', err);
    return error('Failed to fetch item', 500);
  }
}

// PUT /api/items/[id] - Update item
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return error(result.error.errors[0].message, 400);
    }

    // Update in database
    const item = await db.item.update({
      where: { id },
      data: result.data,
    });

    return json(item);
  } catch (err) {
    console.error('PUT /api/items/[id] error:', err);
    return error('Failed to update item', 500);
  }
}

// DELETE /api/items/[id] - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await db.item.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE /api/items/[id] error:', err);
    return error('Failed to delete item', 500);
  }
}

// Placeholder for db - replace with your database client
declare const db: {
  item: {
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    count: () => Promise<number>;
  };
};
