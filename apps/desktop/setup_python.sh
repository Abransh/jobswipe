#!/bin/bash

# =============================================================================
# JobSwipe Python Environment Setup Script
# =============================================================================
# This script sets up the Python virtual environment for the desktop automation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
REQUIREMENTS_FILE="$SCRIPT_DIR/requirements.txt"
PYTHON_MIN_VERSION="3.10"

echo -e "${BLUE}🐍 JobSwipe Python Environment Setup${NC}"
echo "======================================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is available
check_python() {
    print_status "Checking Python installation..."

    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        print_error "Python is not installed. Please install Python $PYTHON_MIN_VERSION or higher."
        exit 1
    fi

    # Check Python version
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')

    if [[ "$(printf '%s\n' "$PYTHON_MIN_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$PYTHON_MIN_VERSION" ]]; then
        print_error "Python $PYTHON_VERSION is installed, but version $PYTHON_MIN_VERSION or higher is required."
        exit 1
    fi

    print_status "Found Python $PYTHON_VERSION at $(which $PYTHON_CMD)"
}

# Create virtual environment
create_venv() {
    if [ -d "$VENV_DIR" ]; then
        print_warning "Virtual environment already exists at $VENV_DIR"
        read -p "Do you want to recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Removing existing virtual environment..."
            rm -rf "$VENV_DIR"
        else
            print_status "Skipping virtual environment creation."
            return 0
        fi
    fi

    print_status "Creating Python virtual environment..."
    $PYTHON_CMD -m venv "$VENV_DIR"

    if [ ! -f "$VENV_DIR/bin/python" ] && [ ! -f "$VENV_DIR/Scripts/python.exe" ]; then
        print_error "Failed to create virtual environment"
        exit 1
    fi
}

# Activate virtual environment and install packages
install_packages() {
    print_status "Activating virtual environment and upgrading pip..."

    # Determine activation script path
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        PYTHON_VENV="$VENV_DIR/bin/python"
        PIP_VENV="$VENV_DIR/bin/pip"
    elif [ -f "$VENV_DIR/Scripts/activate" ]; then
        source "$VENV_DIR/Scripts/activate"
        PYTHON_VENV="$VENV_DIR/Scripts/python.exe"
        PIP_VENV="$VENV_DIR/Scripts/pip.exe"
    else
        print_error "Could not find virtual environment activation script"
        exit 1
    fi

    # Upgrade pip
    $PIP_VENV install --upgrade pip setuptools wheel

    # Install requirements
    if [ -f "$REQUIREMENTS_FILE" ]; then
        print_status "Installing Python packages from requirements.txt..."
        $PIP_VENV install -r "$REQUIREMENTS_FILE"
    else
        print_warning "requirements.txt not found. Installing core packages manually..."
        $PIP_VENV install browser-use anthropic pydantic aiohttp beautifulsoup4
    fi
}

# Install playwright browsers
setup_playwright() {
    print_status "Installing Playwright browsers..."

    # Activate virtual environment
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        PYTHON_VENV="$VENV_DIR/bin/python"
    elif [ -f "$VENV_DIR/Scripts/activate" ]; then
        source "$VENV_DIR/Scripts/activate"
        PYTHON_VENV="$VENV_DIR/Scripts/python.exe"
    fi

    # Install Playwright browsers
    $PYTHON_VENV -m playwright install chromium

    print_status "Playwright setup complete"
}

# Validate installation
validate_installation() {
    print_status "Validating installation..."

    # Activate virtual environment
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        PYTHON_VENV="$VENV_DIR/bin/python"
    elif [ -f "$VENV_DIR/Scripts/activate" ]; then
        source "$VENV_DIR/Scripts/activate"
        PYTHON_VENV="$VENV_DIR/Scripts/python.exe"
    fi

    # Test critical imports
    print_status "Testing critical imports..."

    if ! $PYTHON_VENV -c "import browser_use; print('✅ browser-use imported successfully')"; then
        print_error "Failed to import browser-use"
        exit 1
    fi

    if ! $PYTHON_VENV -c "import pydantic; print('✅ pydantic imported successfully')"; then
        print_error "Failed to import pydantic"
        exit 1
    fi

    if ! $PYTHON_VENV -c "import anthropic; print('✅ anthropic imported successfully')"; then
        print_error "Failed to import anthropic"
        exit 1
    fi

    # Test automation script imports (if we're in the right directory structure)
    if [ -d "$SCRIPT_DIR/companies" ]; then
        print_status "Testing automation script imports..."
        cd "$SCRIPT_DIR/companies/linkedin"

        if $PYTHON_VENV -c "
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__ if '__file__' in globals() else '.').resolve().parent.parent / 'base'))
from user_profile import UserProfile
from result_handler import ApplicationResult
print('✅ Automation modules imported successfully')
" 2>/dev/null; then
            print_status "Automation modules validation passed"
        else
            print_warning "Automation modules validation failed (this is expected if base modules are not set up)"
        fi

        cd "$SCRIPT_DIR"
    fi
}

# Show usage instructions
show_usage() {
    echo
    print_status "Setup completed successfully! 🎉"
    echo
    echo "Usage Instructions:"
    echo "=================="
    echo
    echo "1. Activate the virtual environment:"
    if [ -f "$VENV_DIR/bin/activate" ]; then
        echo "   source $VENV_DIR/bin/activate"
    else
        echo "   $VENV_DIR/Scripts/activate"
    fi
    echo
    echo "2. Run automation scripts:"
    echo "   cd companies/linkedin"
    echo "   python run_automation.py"
    echo
    echo "3. Environment variables needed:"
    echo "   JOB_DATA_FILE - Path to job data JSON file"
    echo "   ANTHROPIC_API_KEY - Anthropic API key for AI automation"
    echo
    echo "Virtual environment path: $VENV_DIR"
    echo "Python executable: $VENV_DIR/bin/python"
    echo
}

# Main execution
main() {
    check_python
    create_venv
    install_packages
    setup_playwright
    validate_installation
    show_usage
}

# Run main function
main "$@"