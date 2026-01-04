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

# Versions (source of truth: https://docs.midnight.network/relnotes/support-matrix and component release notes)
COMPACT_TOOLS_VERSION="0.3.0"
COMPACT_COMPILER_VERSION="0.26.0"
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

install_repo_deps() {
        echo -e "\n${BLUE}Installing repo dependencies...${NC}"
        if [ -f "pnpm-lock.yaml" ]; then
                pnpm install
                print_status "pnpm dependencies installed"
        else
                print_info "No pnpm-lock.yaml found; skipping dependency install"
        fi
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
        print_info "Installing Compact developer tools v${COMPACT_TOOLS_VERSION}..."
        echo ""
        echo "  Running: curl --proto '=https' --tlsv1.2 -LsSf \\"
        echo "    https://github.com/midnightntwrk/compact/releases/download/compact-v${COMPACT_TOOLS_VERSION}/compact-installer.sh | sh"
        echo ""

        # Install via official installer
        if curl --proto '=https' --tlsv1.2 -LsSf \
            "https://github.com/midnightntwrk/compact/releases/download/compact-v${COMPACT_TOOLS_VERSION}/compact-installer.sh" | sh; then
            print_status "Compact developer tools installed"
            # Update to latest compiler
            print_info "Installing latest compiler (expected ${COMPACT_COMPILER_VERSION})..."
            compact update || print_warning "Could not update compiler"
        else
            print_warning "Installation failed. Try manually:"
            echo "    curl --proto '=https' --tlsv1.2 -LsSf \\"
            echo "      https://github.com/midnightntwrk/compact/releases/download/compact-v${COMPACT_TOOLS_VERSION}/compact-installer.sh | sh"
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

print_midnight_links() {
        echo -e "\n${BLUE}Reference links:${NC}"
        echo "  • Midnight docs: https://docs.midnight.network"
        echo "  • Get started: https://docs.midnight.network/getting-started"
    echo "  • Network Support Matrix: https://docs.midnight.network/relnotes/support-matrix"
    echo "  • Release notes (index): https://docs.midnight.network/relnotes/overview"
        echo "  • Compact compiler relnotes: https://docs.midnight.network/relnotes/compact"
        echo "  • Compact tools relnotes: https://docs.midnight.network/relnotes/compact-tools"
        echo "  • Faucet: https://midnight.network/test-faucet"
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
    echo -e "     ${YELLOW}https://midnight.network/test-faucet${NC}"
    echo ""
    echo "  4. Contribute to this repo:"
    echo -e "     ${YELLOW}pnpm lint:md${NC}"
    echo ""
    print_midnight_links
}

# Main execution
main() {
    # Navigate to workspace root (parent of .vscode)
    cd "$(dirname "$0")/.." || exit 1

    check_node
    check_pnpm
    check_docker
    install_repo_deps
    setup_compact_compiler
    setup_proof_server
    print_summary
}

main "$@"
