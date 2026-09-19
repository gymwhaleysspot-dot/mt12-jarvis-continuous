from datetime import datetime
from sqlalchemy import String,Integer,Text,DateTime,ForeignKey
from sqlalchemy.orm import Mapped,mapped_column,relationship
from .db import Base
class Case(Base):
 __tablename__="cases"
 id:Mapped[int]=mapped_column(Integer,primary_key=True)
 current_name:Mapped[str]=mapped_column(String(200),nullable=False)
 birth_name:Mapped[str]=mapped_column(String(200),nullable=False)
 birth_year:Mapped[int]=mapped_column(Integer,nullable=False)
 status:Mapped[str]=mapped_column(String(30),default="active",nullable=False)
 created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
 objectives=relationship("Objective",back_populates="case",cascade="all, delete-orphan")
 contacts=relationship("Contact",back_populates="case",cascade="all, delete-orphan")
 leads=relationship("Lead",back_populates="case",cascade="all, delete-orphan")
class Objective(Base):
 __tablename__="objectives"
 id:Mapped[int]=mapped_column(Integer,primary_key=True)
 case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
 relationship_type:Mapped[str]=mapped_column(String(30),nullable=False)
 status:Mapped[str]=mapped_column(String(30),default="searching",nullable=False)
 notes:Mapped[str]=mapped_column(Text,default="")
 case=relationship("Case",back_populates="objectives")
class Contact(Base):
 __tablename__="contacts"
 id:Mapped[int]=mapped_column(Integer,primary_key=True)
 case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
 subject:Mapped[str]=mapped_column(String(200),nullable=False)
 contacted_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
 response:Mapped[str]=mapped_column(Text,default="")
 next_action:Mapped[str]=mapped_column(Text,default="")
 case=relationship("Case",back_populates="contacts")
class Lead(Base):
 __tablename__="leads"
 id:Mapped[int]=mapped_column(Integer,primary_key=True)
 case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
 relationship_type:Mapped[str]=mapped_column(String(30),nullable=False)
 source:Mapped[str]=mapped_column(String(200),nullable=False)
 summary:Mapped[str]=mapped_column(Text,default="")
 status:Mapped[str]=mapped_column(String(30),default="new",nullable=False)
 confidence:Mapped[str]=mapped_column(String(30),default="unrated",nullable=False)
 reference:Mapped[str]=mapped_column(Text,default="")
 created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
 next_action:Mapped[str]=mapped_column(Text,default="")
 case=relationship("Case",back_populates="leads")
class RoadmapItem(Base):
 __tablename__="roadmap_items"
 id:Mapped[int]=mapped_column(Integer,primary_key=True)
 case_id:Mapped[int]=mapped_column(ForeignKey("cases.id"),nullable=False)
 key:Mapped[str]=mapped_column(String(40),nullable=False)
 title:Mapped[str]=mapped_column(String(200),nullable=False)
 authority:Mapped[str]=mapped_column(String(200),nullable=False)
 status:Mapped[str]=mapped_column(String(30),default="not-started",nullable=False)
 notes:Mapped[str]=mapped_column(Text,default="")
 completed_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)
 case=relationship("Case")
class DnaStatus(Base):
 __tablename__="dna_status"
 id:Mapped[int]=mapped_column(Integer,primary_key=True)
 provider:Mapped[str]=mapped_column(String(80),nullable=False)
 status:Mapped[str]=mapped_column(String(80),default="not-started")
 notes:Mapped[str]=mapped_column(Text,default="")
