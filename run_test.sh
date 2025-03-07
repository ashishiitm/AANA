#!/bin/bash
cd /Users/ashish/AANA
source /Users/ashish/AANA/myenv/bin/activate
python test_pg_connection.py > pg_connection_results.txt 2>&1
echo "Test completed. Results saved to pg_connection_results.txt" 