import os
import pyodbc
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

class Database:
    def __init__(self):
        """Initialize database connection by loading environment variables."""
        self._load_env()
        self.connection = self._connect()

    def _load_env(self):
        """Load environment variables from the project's root directory."""
        cwd_dir = Path(__file__).resolve()
        root_dir = cwd_dir

        while root_dir.name not in ("ai.lottotry.com", "") and root_dir.parent != root_dir:
            root_dir = root_dir.parent

        load_dotenv(dotenv_path=root_dir / '.env')

        self.DB_UID = os.getenv("DB_UID")
        self.DB_PWD = os.getenv("DB_PWD")
        self.DB_SERVER = os.getenv("DB_SERVER")
        self.DB_NAME = os.getenv("DB_NAME")
        self.DB_TYPE = os.getenv("DB_TYPE")

    def _connect(self):
        """Establish and return a database connection."""
        try:
            return pyodbc.connect(
                f'DRIVER={self.DB_TYPE};SERVER={self.DB_SERVER};DATABASE={self.DB_NAME};UID={self.DB_UID};PWD={self.DB_PWD}'
            )
        except Exception as e:
            print(f"Database connection error: {e}")
            return None

    def fetch_data(self, query_file, params=None):
        """Fetch data from the database using a SQL query file."""
        if not self.connection:
            raise Exception("Database connection is not established.")

        cwd_dir = Path(__file__).resolve().parent.parent
        query_path = cwd_dir / 'ai_preprocess_data' / 'saved_training_data' / query_file

        try:
            with open(query_path, "r") as file:
                query = file.read()

            return pd.read_sql(query, self.connection, params=params)
        
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None

    def close(self):
        """Close the database connection."""
        if self.connection:
            self.connection.close()
