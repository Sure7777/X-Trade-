from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String


class Pump_pools(Base):
    __tablename__ = "pump_pools"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, nullable=True, default=0, server_default='0')
    participants_count = Column(Integer, nullable=True, default=0, server_default='0')
    launch_time = Column(String, nullable=False)
    status = Column(String, nullable=True, default='collecting', server_default='collecting')
    expected_profit_pct = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)