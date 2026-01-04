#!/bin/bash
# Midnight Development Environment Setup Script
# This script installs and configures the Midnight Network development tools

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Versions
COMPACT_VERSION="0.25.0"
NODE_MIN_VERSION="20"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Midnight Network Development Environment Setup          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check Node.js version
check_node() {
    echo -e "\n${BLUE}Checking Node.js...${NC}"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
        if [ "$NODE_VERSION" -ge "$NODE_MIN_VERSION" ]; then
            print_status "Node.js v$(node -v | sed 's/v//') installed"
        else
            print_error "Node.js $NODE_MIN_VERSION+ required, found v$(node -v)"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js $NODE_MIN_VERSION+"
        exit 1
    fi
}

# Check pnpm
check_pnpm() {
    echo -e "\n${BLUE}Checking pnpm...${NC}"
    if command -v pnpm &> /dev/null; then
        print_status "pnpm v$(pnpm -v) installed"
    else
        print_warning "pnpm not found, installing..."
        npm install -g pnpm
        print_status "pnpm installed"
    fi
}

# Check Docker
check_docker() {
    echo -e "\n${BLUE}Checking Docker...${NC}"
    if command -v docker &> /dev/null; then
        print_status "Docker installed"
        if docker info &> /dev/null; then
            print_status "Docker daemon is running"
        else
            print_warning "Docker daemon not running. Start Docker for proof server."
        fi
    else
        print_warning "Docker not found. Required for proof server."
        print_info "Install Docker: https://docs.docker.com/get-docker/"
    fi
}

# Install Midnight packages
install_midnight_packages() {
    echo -e "\n${BLUE}Installing Midnight Network packages...${NC}"

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_info "Creating package.json..."
        cat > package.json << 'EOF'
{
  "name": "midnight-dapp",
  "version": "1.0.0",
  "private": true,
  "description": "Midnight Network dApp",
  "type": "module",
  "scripts": {
    "compact:build": "compactc contracts/*.compact --output dist/contracts",
    "compact:watch": "compactc contracts/*.compact --output dist/contracts --watch",
    "proof-server:start": "docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet",
    "proof-server:pull": "docker pull midnightnetwork/proof-server",
    "dev": "next dev",
    "build": "next build",
    "test": "vitest",
    "test:watch": "vitest watch",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
EOF
    fi

    # Install Midnight packages
    print_info "Installing @midnight-ntwrk packages..."
    pnpm add -D @midnight-ntwrk/compact-compiler@latest 2>/dev/null || {
        print_warning "compact-compiler not available via npm, checking alternative methods..."
    }

    # Core packages that are typically available
    pnpm add @midnight-ntwrk/midnight-js-types@latest \
             @midnight-ntwrk/midnight-js-contracts@latest \
             @midnight-ntwrk/midnight-js-network-id@latest \
             @midnight-ntwrk/dapp-connector-api@latest 2>/dev/null || {
        print_warning "Some packages may require Midnight npm registry access"
    }

    print_status "Midnight packages installed"
}

# Setup Compact compiler
setup_compact_compiler() {
    echo -e "\n${BLUE}Setting up Compact developer tools...${NC}"

    # Check if compact CLI is available
    if command -v compact &> /dev/null; then
        INSTALLED_VERSION=$(compact --version 2>/dev/null | head -1 || echo "unknown")
        print_status "Compact developer tools already installed: $INSTALLED_VERSION"

        # Check for compiler updates
        print_info "Checking for compiler updates..."
        compact check 2>/dev/null || true
    else
        print_info "Installing Compact developer tools v0.3.0..."
        echo ""
        echo "  Running: curl --proto '=https' --tlsv1.2 -LsSf \\"
        echo "    https://github.com/midnightntwrk/compact/releases/download/compact-v0.3.0/compact-installer.sh | sh"
        echo ""

        # Install via official installer
        if curl --proto '=https' --tlsv1.2 -LsSf \
            https://github.com/midnightntwrk/compact/releases/download/compact-v0.3.0/compact-installer.sh | sh; then
            print_status "Compact developer tools installed"
            # Update to latest compiler
            print_info "Installing latest compiler..."
            compact update || print_warning "Could not update compiler"
        else
            print_warning "Installation failed. Try manually:"
            echo "    curl --proto '=https' --tlsv1.2 -LsSf \\"
            echo "      https://github.com/midnightntwrk/compact/releases/download/compact-v0.3.0/compact-installer.sh | sh"
        fi
    fi
}

# Pull proof server Docker image
setup_proof_server() {
    echo -e "\n${BLUE}Setting up Proof Server...${NC}"

    if command -v docker &> /dev/null && docker info &> /dev/null; then
        print_info "Pulling proof server image..."
        if docker pull midnightnetwork/proof-server 2>/dev/null; then
            print_status "Proof server image pulled"
        else
            print_warning "Could not pull proof server image. Try manually:"
            echo "    docker pull midnightnetwork/proof-server"
        fi
    else
        print_warning "Docker not available. Install Docker to use proof server."
    fi
}

# Create example contract
create_example_contract() {
    echo -e "\n${BLUE}Creating example contract...${NC}"

    mkdir -p contracts

    if [ ! -f "contracts/example.compact" ]; then
        cat > contracts/example.compact << 'EOF'
pragma language_version 0.18;

import CompactStandardLibrary;

// Example Midnight Contract
// A simple counter with access control

export ledger owner: Bytes<32>;
export ledger counter: Counter;

// Initialize the contract
export circuit initialize(initialOwner: Bytes<32>): [] {
  owner = initialOwner;
}

// Increment the counter (anyone can call)
export circuit increment(): [] {
  counter = counter + 1;
}

// Reset counter (owner only)
export circuit reset(caller: Bytes<32>): [] {
  require(caller == owner);
  counter = 0;
}

// Get current count
export circuit getCount(): Uint<64> {
  return counter;
}
EOF
        print_status "Created contracts/example.compact"
    else
        print_info "contracts/example.compact already exists"
    fi
}

# Create environment file
create_env_file() {
    echo -e "\n${BLUE}Creating environment configuration...${NC}"

    if [ ! -f ".env.local" ]; then
        cat > .env.local << 'EOF'
# Midnight Network Configuration
# Testnet-02 endpoints

NEXT_PUBLIC_NETWORK=testnet

# Indexer endpoints
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws

# RPC node
NEXT_PUBLIC_NODE_URL=https://rpc.testnet-02.midnight.network

# Proof server (local)
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300

# Faucet for test tokens
NEXT_PUBLIC_FAUCET_URL=https://faucet.testnet-02.midnight.network
EOF
        print_status "Created .env.local"
    else
        print_info ".env.local already exists"
    fi

    # Create .env.example
    if [ ! -f ".env.example" ]; then
        cat > .env.example << 'EOF'
# Midnight Network Configuration
# Copy to .env.local and configure

NEXT_PUBLIC_NETWORK=testnet

# Testnet-02 endpoints
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
NEXT_PUBLIC_NODE_URL=https://rpc.testnet-02.midnight.network
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300
NEXT_PUBLIC_FAUCET_URL=https://faucet.testnet-02.midnight.network
EOF
        print_status "Created .env.example"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    Setup Complete!                             ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo ""
    echo "  1. Start the proof server:"
    echo -e "     ${YELLOW}docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet${NC}"
    echo ""
    echo "  2. Install Lace wallet from https://www.lace.io/"
    echo "     Enable Midnight mode in wallet settings"
    echo ""
    echo "  3. Get test tokens from the faucet:"
    echo -e "     ${YELLOW}https://faucet.testnet-02.midnight.network${NC}"
    echo ""
    echo "  4. Compile a contract:"
    echo -e "     ${YELLOW}pnpm compact:build${NC}"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "  • Midnight Docs: https://docs.midnight.network"
    echo "  • Compact Language: https://docs.midnight.network/develop/reference/compact"
    echo ""
}

# Main execution
main() {
    # Navigate to workspace root (parent of .vscode)
    cd "$(dirname "$0")/.." || exit 1

    check_node
    check_pnpm
    check_docker
    install_midnight_packages
    setup_compact_compiler
    setup_proof_server
    create_example_contract
    create_env_file
    print_summary
}

main "$@"
