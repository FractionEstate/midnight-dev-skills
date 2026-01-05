// @ts-nocheck
// Next.js Server Action Template
// Location: app/actions/[resource].ts
// Type-safe server mutations with validation and revalidation

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// ============================================
// Types
// ============================================

type ActionState<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ============================================
// Validation Schemas
// ============================================

const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().optional(),
  categoryId: z.string().cuid().optional(),
});

const updateItemSchema = createItemSchema.partial();

// ============================================
// Helper Functions
// ============================================

function success<T>(data?: T): ActionState<T> {
  return { success: true, data };
}

function failure(error: string, fieldErrors?: Record<string, string[]>): ActionState {
  return { success: false, error, fieldErrors };
}

// ============================================
// Server Actions
// ============================================

/**
 * Create a new item
 * Usage with useActionState hook
 */
export async function createItem(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // Parse form data
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
    categoryId: formData.get('categoryId'),
  };

  // Validate
  const result = createItemSchema.safeParse(rawData);
  if (!result.success) {
    return failure(
      'Validation failed',
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  try {
    // Create in database
    // const item = await db.item.create({
    //   data: result.data,
    // });

    // Revalidate cache
    revalidateTag('items');
    revalidatePath('/items');

    return success(/* item */);
  } catch (error) {
    console.error('createItem error:', error);
    return failure('Failed to create item');
  }
}

/**
 * Update an existing item
 */
export async function updateItem(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData);

  const result = updateItemSchema.safeParse(rawData);
  if (!result.success) {
    return failure(
      'Validation failed',
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  try {
    // const item = await db.item.update({
    //   where: { id },
    //   data: result.data,
    // });

    revalidateTag('items');
    revalidatePath(`/items/${id}`);

    return success(/* item */);
  } catch (error) {
    console.error('updateItem error:', error);
    return failure('Failed to update item');
  }
}

/**
 * Delete an item with redirect
 */
export async function deleteItem(id: string): Promise<void> {
  // await db.item.delete({
  //   where: { id },
  // });

  revalidateTag('items');
  redirect('/items');
}
