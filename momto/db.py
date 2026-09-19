from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
DATA_DIR=Path("data"); DATA_DIR.mkdir(exist_ok=True)
engine=create_engine(f"sqlite:///{DATA_DIR/'momto.sqlite3'}",future=True)
SessionLocal=sessionmaker(bind=engine,autoflush=False,autocommit=False,expire_on_commit=False)
class Base(DeclarativeBase): pass
