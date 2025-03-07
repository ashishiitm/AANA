import psycopg2
import pandas as pd

class PostgresConnector:
    def __init__(self, dbname, user, password, host, port):
        self.conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )

    def execute_query(self, query):
        """Execute a SQL query and return the result as a DataFrame."""
        return pd.read_sql(query, self.conn)

    def close(self):
        """Close the database connection."""
        self.conn.close()