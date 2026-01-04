# Testing Patterns Reference

Common testing patterns for TypeScript and Midnight projects.

## Unit Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('FeatureName', () => {
  // Shared setup
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('methodName', () => {
    it('should do something when given valid input', () => {
      const result = instance.methodName('valid');
      expect(result).toBe('expected');
    });

    it('should throw when given invalid input', () => {
      expect(() => instance.methodName(null)).toThrow('Invalid input');
    });
  });
});
```

## Assertion Patterns

```typescript
// Equality
expect(value).toBe(5);                    // Strict equality (===)
expect(object).toEqual({ a: 1 });         // Deep equality
expect(object).toStrictEqual({ a: 1 });   // Strict deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeGreaterThanOrEqual(5);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(0.3, 5);        // Floating point

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');
expect(string).toHaveLength(5);

// Arrays
expect(array).toContain(item);
expect(array).toContainEqual({ id: 1 });  // Deep equality
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('nested.key', 'value');
expect(object).toMatchObject({ partial: true });

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('message');
expect(() => fn()).toThrow(ErrorClass);
expect(async () => await asyncFn()).rejects.toThrow();

// Promises
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

## Mocking

```typescript
// Function mocks
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockReturnValueOnce('first').mockReturnValueOnce('second');
mockFn.mockResolvedValue('async value');
mockFn.mockImplementation((x) => x * 2);

// Verify calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('lastArg');

// Spy on existing method
const spy = vi.spyOn(object, 'method');
spy.mockReturnValue('mocked');

// Mock module
vi.mock('./module', () => ({
  exportedFn: vi.fn(() => 'mocked'),
}));

// Mock partial module
vi.mock('./module', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    onlyThisFn: vi.fn(),
  };
});
```

## Async Testing

```typescript
// Async/await
it('handles async operations', async () => {
  const result = await fetchData();
  expect(result).toBe('data');
});

// Promises
it('returns a promise', () => {
  return expect(fetchData()).resolves.toBe('data');
});

// Fake timers
it('handles timers', async () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

## Test Data Patterns

```typescript
// Factory functions
function createUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    email: `user-${Date.now()}@test.com`,
    name: 'Test User',
    createdAt: new Date(),
    ...overrides,
  };
}

// Fixtures
const fixtures = {
  validUser: createUser({ name: 'Valid User' }),
  adminUser: createUser({ name: 'Admin', role: 'admin' }),
};

// Parameterized tests
it.each([
  { input: 1, expected: 2 },
  { input: 2, expected: 4 },
  { input: 3, expected: 6 },
])('doubles $input to $expected', ({ input, expected }) => {
  expect(double(input)).toBe(expected);
});

// Table-driven tests
const testCases = [
  ['empty string', '', false],
  ['valid email', 'test@example.com', true],
  ['invalid email', 'not-an-email', false],
] as const;

it.each(testCases)('%s: validates %s as %s', (_, input, expected) => {
  expect(isValidEmail(input)).toBe(expected);
});
```

## Snapshot Testing

```typescript
// Basic snapshot
it('renders correctly', () => {
  const result = renderComponent();
  expect(result).toMatchSnapshot();
});

// Inline snapshot
it('returns expected structure', () => {
  const result = processData(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "id": "123",
      "status": "complete",
    }
  `);
});

// Property matchers for dynamic values
expect(user).toMatchSnapshot({
  id: expect.any(String),
  createdAt: expect.any(Date),
});
```

## Error Testing

```typescript
// Sync errors
it('throws for invalid input', () => {
  expect(() => validate(null)).toThrow('Input required');
  expect(() => validate(null)).toThrow(ValidationError);
});

// Async errors
it('rejects with error', async () => {
  await expect(asyncValidate(null)).rejects.toThrow('Input required');
});

// Error properties
it('throws with correct error details', () => {
  try {
    riskyOperation();
    expect.fail('Should have thrown');
  } catch (error) {
    expect(error).toBeInstanceOf(CustomError);
    expect(error.code).toBe('ERR_001');
    expect(error.details).toMatchObject({ field: 'value' });
  }
});
```

## Integration Test Setup

```typescript
// Setup/teardown for database tests
describe('Database Integration', () => {
  beforeAll(async () => {
    await db.connect();
    await db.migrate();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.truncateAll();
    await db.seed();
  });

  it('creates and retrieves user', async () => {
    const user = await createUser({ email: 'test@example.com' });
    const found = await findUserById(user.id);
    expect(found).toMatchObject({ email: 'test@example.com' });
  });
});
```
