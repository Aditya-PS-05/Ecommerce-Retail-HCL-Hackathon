from pymongo import MongoClient
from pymongo.database import Database
from urllib.parse import urlparse
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client: MongoClient = None
db: Database = None


def get_database_name_from_uri(uri: str) -> str:
    parsed = urlparse(uri)
    path = parsed.path
    if path and path.startswith("/"):
        db_name = path[1:].split("?")[0]
        if db_name:
            return db_name
    return "pizza-retail"


def connect_to_mongo():
    global client, db
    if not MONGO_URI:
        raise ValueError("MONGO_URI environment variable is not set")
    client = MongoClient(MONGO_URI)
    db_name = get_database_name_from_uri(MONGO_URI)
    db = client[db_name]
    print(f"Connected to MongoDB: {db_name}")
    return db


def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database() -> Database:
    if db is None:
        connect_to_mongo()
    return db


def get_collection(collection_name: str):
    database = get_database()
    return database[collection_name]
