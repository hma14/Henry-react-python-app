# database.py

import os
import pyodbc
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


DATABASE_URL = r"mssql+pyodbc://sa:Bilibalabon12345@lottotry.com,1433/lottotrydb?driver=ODBC+Driver+17+for+SQL+Server"
IMAGE_FOLDER = os.path.join(os.getcwd(), "static", "images")
os.makedirs(IMAGE_FOLDER, exist_ok=True)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

########################3
def get_db_connection_string():
    cwd_dir = Path(__file__).resolve()
    root_dir = cwd_dir

    while root_dir.name not in ("ai.lottotry.com", "") and root_dir.parent != root_dir:
        root_dir = root_dir.parent

    load_dotenv(dotenv_path=root_dir / '.env')
    
    return f'DRIVER={os.getenv("DB_TYPE")};SERVER={os.getenv("DB_SERVER")};DATABASE={os.getenv("DB_NAME")};UID={os.getenv("DB_UID")};PWD={os.getenv("DB_PWD")}'

class Database:
    def __init__(self, table_name):
        """Initialize database connection by loading environment variables."""
        #self._load_env()
        self.connection = self._connect()
        self.table_name = table_name
        
        # Define a whitelist of allowed tables to prevent SQL injection
        self.allowed_tables = {"BC49", "LottoMax", "Lotto649"}
        if self.table_name not in self.allowed_tables:
            raise ValueError(f"Invalid table name: {self.table_name}")

    def _load_env(self):
        """Load environment variables from the project's root directory."""
        cwd_dir = Path(__file__).resolve()
        root_dir = cwd_dir

        while root_dir.name not in ("ai.lottotry.com", "") and root_dir.parent != root_dir:
            root_dir = root_dir.parent

        load_dotenv(dotenv_path=root_dir / '.env')


    def _connect(self):
        
        self._load_env()
        """Establish and return a database connection."""
        try:
            return pyodbc.connect(
                get_db_connection_string()
            )
        except Exception as e:
            print(f"Database connection error: {e}")
            return None

    def fetch_data(self, query_file, params=None):
        """Fetch data from the database using a SQL query file."""
        if not self.connection:
            raise Exception("Database connection is not established.")

        cwd_dir = Path(__file__).resolve().parent
        query_path = cwd_dir / 'ai_preprocess_data' / 'saved_training_data' / query_file

        try:
            with open(query_path, "r") as file:
                query = file.read()

            query = query.replace("{TABLE_NAME}", self.table_name)
            return pd.read_sql(query, self.connection, params=params)
        
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None

    def close(self):
        """Close the database connection."""
        if self.connection:
            self.connection.close()
