#!/bin/bash
echo "Activating virtual environment..."
source /Users/ashish/AANA/myenv/bin/activate

echo "Python version:"
python --version

echo "Installing psycopg (version 3)..."
pip install psycopg

echo "Installation complete. Testing import..."
python -c "import psycopg; print('psycopg import successful')"

echo "Done." 