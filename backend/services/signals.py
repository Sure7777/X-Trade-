import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.signals import Signals

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class SignalsService:
    """Service layer for Signals operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Signals]:
        """Create a new signals"""
        try:
            obj = Signals(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created signals with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating signals: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Signals]:
        """Get signals by ID"""
        try:
            query = select(Signals).where(Signals.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching signals {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of signalss"""
        try:
            query = select(Signals)
            count_query = select(func.count(Signals.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Signals, field):
                        query = query.where(getattr(Signals, field) == value)
                        count_query = count_query.where(getattr(Signals, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Signals, field_name):
                        query = query.order_by(getattr(Signals, field_name).desc())
                else:
                    if hasattr(Signals, sort):
                        query = query.order_by(getattr(Signals, sort))
            else:
                query = query.order_by(Signals.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching signals list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Signals]:
        """Update signals"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Signals {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated signals {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating signals {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete signals"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Signals {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted signals {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting signals {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Signals]:
        """Get signals by any field"""
        try:
            if not hasattr(Signals, field_name):
                raise ValueError(f"Field {field_name} does not exist on Signals")
            result = await self.db.execute(
                select(Signals).where(getattr(Signals, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching signals by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Signals]:
        """Get list of signalss filtered by field"""
        try:
            if not hasattr(Signals, field_name):
                raise ValueError(f"Field {field_name} does not exist on Signals")
            result = await self.db.execute(
                select(Signals)
                .where(getattr(Signals, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Signals.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching signalss by {field_name}: {str(e)}")
            raise