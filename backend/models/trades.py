from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String


class Trades(Base):
    __tablename__ = "trades"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    side = Column(String, nullable=False)
    order_type = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    leverage = Column(Integer, nullable=True, default=1, server_default='1')
    take_profit = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    status = Column(String, nullable=True, default='open', server_default='open')
    pnl = Column(Float, nullable=True, default=0, server_default='0')
    is_paper = Column(Boolean, nullable=True, default=False, server_default='false')
    is_auto = Column(Boolean, nullable=True, default=False, server_default='false')
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)