#!/bin/bash
# Midnight Development Environment Setup Script
# Usage: bash setup.sh [project-name]

set -e

PROJECT_NAME="${1:-my-midnight-dapp}"
COMPACT_VERSION="0.2.0"
NODE_VERSION="20"

echo "🌙 Midnight Development Environment Setup"
echo "=========================================="
echo ""

# Check Node.js version
check_node() {
    if command -v node &> /dev/null; then
        NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_CURRENT" -ge "$NODE_VERSION" ]; then
            echo "✅ Node.js $(node -v) detected"
            return 0
        fi
    fi
    echo "❌ Node.js $NODE_VERSION+ required"
    echo "   Install: nvm install $NODE_VERSION && nvm use $NODE_VERSION"
    return 1
}

# Check Docker
check_docker() {
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        echo "✅ Docker is running"
        return 0
    fi
    echo "❌ Docker not running"
    echo "   Start Docker Desktop or: sudo systemctl start docker"
    return 1
}

# Install Compact compiler
install_compact() {
    if command -v compact &> /dev/null; then
        COMPACT_CURRENT=$(compact --version 2>/dev/null | head -1)
        echo "✅ Compact compiler installed: $COMPACT_CURRENT"
    else
        echo "📦 Installing Compact compiler v$COMPACT_VERSION..."
        curl --proto '=https' --tlsv1.2 -LsSf \
            "https://github.com/midnightntwrk/compact/releases/download/compact-v$COMPACT_VERSION/compact-installer.sh" | sh
        export PATH="$HOME/.cargo/bin:$PATH"
        echo "✅ Compact compiler installed"
    fi
}

# Create project
create_project() {
    echo ""
    echo "📁 Creating Midnight project: $PROJECT_NAME"
    npx create-next-app@16.1.1 "$PROJECT_NAME" --typescript --tailwind --eslint --app --src-dir
    cd "$PROJECT_NAME"

    # Install Midnight dependencies
    echo "📦 Installing Midnight dependencies..."
    npm install @midnight-ntwrk/dapp-connector-api

    # Create contracts directory
    mkdir -p contracts/managed

    # Create sample contract
    cat > contracts/hello.compact << 'EOF'
pragma language_version 0.17;

export ledger message: Opaque<"string">;

export circuit setMessage(newMessage: Opaque<"string">): [] {
    message = disclose(newMessage);
}
EOF

    # Create .env.local
    cat > .env.local << 'EOF'
NEXT_PUBLIC_MIDNIGHT_NETWORK=testnet
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300
EOF

    echo "✅ Project created: $PROJECT_NAME"
}

# Main
echo "Checking prerequisites..."
check_node || exit 1
check_docker || exit 1
install_compact

echo ""
read -p "Create new project '$PROJECT_NAME'? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_project
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Install Lace wallet in Chrome"
echo "  2. Get tDUST from https://midnight.network/test-faucet/"
echo "  3. Start proof server:"
echo "     docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet"
echo "  4. Run your app:"
echo "     cd $PROJECT_NAME && npm run dev"
