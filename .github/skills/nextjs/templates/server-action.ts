'use server';

// Server Action Template
// Location: app/actions/[resource].ts

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
export async function createItem(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
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
    const item = await db.item.create({
      data: result.data,
    });

    // Revalidate cache
    revalidateTag('items');
    revalidatePath('/items');

    return success(item);
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
    const item = await db.item.update({
      where: { id },
      data: result.data,
    });

    revalidateTag('items');
    revalidateTag(`item-${id}`);

    return success(item);
  } catch (error) {
    console.error('updateItem error:', error);
    return failure('Failed to update item');
  }
}

/**
 * Delete an item
 */
export async function deleteItem(id: string): Promise<ActionState> {
  try {
    await db.item.delete({
      where: { id },
    });

    revalidateTag('items');
    revalidatePath('/items');

    return success();
  } catch (error) {
    console.error('deleteItem error:', error);
    return failure('Failed to delete item');
  }
}

/**
 * Action with redirect
 */
export async function createAndRedirect(formData: FormData): Promise<never> {
  const title = formData.get('title') as string;

  const item = await db.item.create({
    data: { title },
  });

  revalidateTag('items');
  redirect(`/items/${item.id}`);
}

// ============================================
// Usage Example in Client Component
// ============================================

/*
'use client';

import { useActionState } from 'react';
import { createItem } from '@/app/actions/items';

export function CreateItemForm() {
  const [state, formAction, isPending] = useActionState(createItem, {
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="title" required />
      {state.fieldErrors?.title && (
        <p className="text-red-500">{state.fieldErrors.title[0]}</p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>

      {state.error && <p className="text-red-500">{state.error}</p>}
      {state.success && <p className="text-green-500">Created!</p>}
    </form>
  );
}
*/

// Placeholder for db
declare const db: {
  item: {
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
};
