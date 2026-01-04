---
description: "Set up testing infrastructure for Compact contracts and Midnight dApps"
---

# Setup Midnight Testing

Configure comprehensive testing for Compact contracts and TypeScript dApp code.

## Project Path

${input:project_path:Path to the project root}

## Testing Scope

${input:scope:What to test - "contracts", "dapp", or "both"}

## Setup Tasks

### 1. Install Dependencies

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom
```

### 2. Configure Vitest

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'test/']
    }
  }
});
```

### 3. Create Test Setup

Create `test/setup.ts`:
```typescript
import '@testing-library/jest-dom';

// Mock Midnight wallet
global.window = global.window || {};
window.midnight = undefined;

// Mock provider factory
export function createMockWallet() {
  return {
    state: vi.fn().mockResolvedValue({ enabledWalletApiVersion: '1.0' }),
    enable: vi.fn().mockResolvedValue(undefined),
    walletAPI: vi.fn().mockResolvedValue({
      signTransaction: vi.fn(),
      submitTransaction: vi.fn()
    })
  };
}
```

### 4. Contract Test Template

Create `test/contracts/example.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyContract', () => {
  beforeEach(() => {
    // Setup contract instance
  });

  describe('Circuit: myCircuit', () => {
    it('should handle valid input', async () => {
      // Test with valid witness data
    });

    it('should reject invalid input', async () => {
      // Test assertion failures
    });
  });
});
```

### 5. Component Test Template

Create `test/components/WalletConnect.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletConnect } from '@/components/WalletConnect';
import { createMockWallet } from '../setup';

describe('WalletConnect', () => {
  it('shows connect button when not connected', () => {
    render(<WalletConnect />);
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
  });

  it('handles missing wallet gracefully', async () => {
    window.midnight = undefined;
    render(<WalletConnect />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText(/install.*wallet/i)).toBeInTheDocument();
  });
});
```

### 6. Add NPM Scripts

Update `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Deliverables

- [ ] Vitest configuration file
- [ ] Test setup with mocks
- [ ] Example contract tests
- [ ] Example component tests
- [ ] Coverage configuration
- [ ] NPM scripts
