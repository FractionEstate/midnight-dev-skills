# Next.js Server Actions

## Defining Server Actions

### Inline in Server Component

```tsx
// app/posts/page.tsx
export default function PostsPage() {
  async function createPost(formData: FormData) {
    'use server';

    const title = formData.get('title') as string;
    await db.post.create({ data: { title } });
    revalidatePath('/posts');
  }

  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Separate Actions File

```tsx
// app/actions/posts.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const validated = PostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const post = await prisma.post.create({
    data: validated.data,
  });

  revalidatePath('/posts');
  redirect(`/posts/${post.id}`);
}
```

## Using Server Actions in Client Components

```tsx
// components/post-form.tsx
'use client';

import { createPost } from '@/app/actions/posts';
import { useActionState } from 'react';

export function PostForm() {
  const [state, action, pending] = useActionState(createPost, null);

  return (
    <form action={action}>
      <input name="title" placeholder="Title" disabled={pending} />
      {state?.error?.title && <p className="text-red-500">{state.error.title}</p>}

      <textarea name="content" placeholder="Content" disabled={pending} />

      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

## Optimistic Updates

```tsx
'use client';

import { useOptimistic } from 'react';
import { likePost } from '@/app/actions/posts';

export function LikeButton({ postId, likes }: { postId: string; likes: number }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(likes, (state) => state + 1);

  async function handleLike() {
    addOptimisticLike(null);
    await likePost(postId);
  }

  return (
    <form action={handleLike}>
      <button type="submit">❤️ {optimisticLikes}</button>
    </form>
  );
}
```

## Progressive Enhancement

```tsx
// Works without JavaScript enabled
export function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteItem.bind(null, id)}>
      <button type="submit">Delete</button>
    </form>
  );
}

// Action with bound arguments
async function deleteItem(id: string) {
  'use server';
  await db.item.delete({ where: { id } });
  revalidatePath('/items');
}
```

## Error Handling

```tsx
'use server';

import { z } from 'zod';

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitForm(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = Object.fromEntries(formData);
    const validated = schema.parse(data);

    await db.create({ data: validated });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    return { error: 'Something went wrong' };
  }
}
```

## Authentication Pattern

```tsx
'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function protectedAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // User is authenticated
  await db.post.create({
    data: {
      title: formData.get('title') as string,
      authorId: session.user.id,
    },
  });

  revalidatePath('/posts');
}
```

## File Upload

```tsx
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file || file.size === 0) {
    return { error: 'No file provided' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), 'public/uploads', filename);

  await writeFile(path, buffer);

  return { url: `/uploads/${filename}` };
}
```

## Best Practices

1. **Always validate input** with Zod or similar
2. **Use `revalidatePath`/`revalidateTag`** after mutations
3. **Return typed state** for form feedback
4. **Handle errors gracefully** with try/catch
5. **Use `bind()`** to pass additional arguments
6. **Keep actions focused** - one action per operation
