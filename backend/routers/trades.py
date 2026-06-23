import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.trades import TradesService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/trades", tags=["trades"])


# ---------- Pydantic Schemas ----------
class TradesData(BaseModel):
    """Entity data schema (for create/update)"""
    symbol: str
    side: str
    order_type: str
    quantity: float
    price: float
    leverage: int = None
    take_profit: float = None
    stop_loss: float = None
    status: str = None
    pnl: float = None
    is_paper: bool = None
    is_auto: bool = None


class TradesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    symbol: Optional[str] = None
    side: Optional[str] = None
    order_type: Optional[str] = None
    quantity: Optional[float] = None
    price: Optional[float] = None
    leverage: Optional[int] = None
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None
    status: Optional[str] = None
    pnl: Optional[float] = None
    is_paper: Optional[bool] = None
    is_auto: Optional[bool] = None


class TradesResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    symbol: str
    side: str
    order_type: str
    quantity: float
    price: float
    leverage: Optional[int] = None
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None
    status: Optional[str] = None
    pnl: Optional[float] = None
    is_paper: Optional[bool] = None
    is_auto: Optional[bool] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TradesListResponse(BaseModel):
    """List response schema"""
    items: List[TradesResponse]
    total: int
    skip: int
    limit: int


class TradesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[TradesData]


class TradesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: TradesUpdateData


class TradesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[TradesBatchUpdateItem]


class TradesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=TradesListResponse)
async def query_tradess(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query tradess with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying tradess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = TradesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} tradess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying tradess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=TradesListResponse)
async def query_tradess_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query tradess with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying tradess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = TradesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} tradess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying tradess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=TradesResponse)
async def get_trades(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single trades by ID (user can only see their own records)"""
    logger.debug(f"Fetching trades with id: {id}, fields={fields}")
    
    service = TradesService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Trades with id {id} not found")
            raise HTTPException(status_code=404, detail="Trades not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching trades {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=TradesResponse, status_code=201)
async def create_trades(
    data: TradesData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new trades"""
    logger.debug(f"Creating new trades with data: {data}")
    
    service = TradesService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create trades")
        
        logger.info(f"Trades created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating trades: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating trades: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[TradesResponse], status_code=201)
async def create_tradess_batch(
    request: TradesBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple tradess in a single request"""
    logger.debug(f"Batch creating {len(request.items)} tradess")
    
    service = TradesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} tradess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[TradesResponse])
async def update_tradess_batch(
    request: TradesBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple tradess in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} tradess")
    
    service = TradesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} tradess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=TradesResponse)
async def update_trades(
    id: int,
    data: TradesUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing trades (requires ownership)"""
    logger.debug(f"Updating trades {id} with data: {data}")

    service = TradesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Trades with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Trades not found")
        
        logger.info(f"Trades {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating trades {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating trades {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_tradess_batch(
    request: TradesBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple tradess by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} tradess")
    
    service = TradesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} tradess successfully")
        return {"message": f"Successfully deleted {deleted_count} tradess", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_trades(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single trades by ID (requires ownership)"""
    logger.debug(f"Deleting trades with id: {id}")
    
    service = TradesService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Trades with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Trades not found")
        
        logger.info(f"Trades {id} deleted successfully")
        return {"message": "Trades deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting trades {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")