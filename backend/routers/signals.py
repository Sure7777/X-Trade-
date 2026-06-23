import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.signals import SignalsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/signals", tags=["signals"])


# ---------- Pydantic Schemas ----------
class SignalsData(BaseModel):
    """Entity data schema (for create/update)"""
    symbol: str
    direction: str
    entry_price: float
    take_profit: float
    stop_loss: float
    confidence: float
    signal_type: str
    status: str = None
    volume_spike: float = None
    whale_activity: bool = None


class SignalsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    symbol: Optional[str] = None
    direction: Optional[str] = None
    entry_price: Optional[float] = None
    take_profit: Optional[float] = None
    stop_loss: Optional[float] = None
    confidence: Optional[float] = None
    signal_type: Optional[str] = None
    status: Optional[str] = None
    volume_spike: Optional[float] = None
    whale_activity: Optional[bool] = None


class SignalsResponse(BaseModel):
    """Entity response schema"""
    id: int
    symbol: str
    direction: str
    entry_price: float
    take_profit: float
    stop_loss: float
    confidence: float
    signal_type: str
    status: Optional[str] = None
    volume_spike: Optional[float] = None
    whale_activity: Optional[bool] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SignalsListResponse(BaseModel):
    """List response schema"""
    items: List[SignalsResponse]
    total: int
    skip: int
    limit: int


class SignalsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[SignalsData]


class SignalsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: SignalsUpdateData


class SignalsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[SignalsBatchUpdateItem]


class SignalsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=SignalsListResponse)
async def query_signalss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query signalss with filtering, sorting, and pagination"""
    logger.debug(f"Querying signalss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = SignalsService(db)
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
        )
        logger.debug(f"Found {result['total']} signalss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying signalss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=SignalsListResponse)
async def query_signalss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query signalss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying signalss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = SignalsService(db)
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
        logger.debug(f"Found {result['total']} signalss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying signalss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=SignalsResponse)
async def get_signals(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single signals by ID"""
    logger.debug(f"Fetching signals with id: {id}, fields={fields}")
    
    service = SignalsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Signals with id {id} not found")
            raise HTTPException(status_code=404, detail="Signals not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching signals {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=SignalsResponse, status_code=201)
async def create_signals(
    data: SignalsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new signals"""
    logger.debug(f"Creating new signals with data: {data}")
    
    service = SignalsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create signals")
        
        logger.info(f"Signals created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating signals: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating signals: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[SignalsResponse], status_code=201)
async def create_signalss_batch(
    request: SignalsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple signalss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} signalss")
    
    service = SignalsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} signalss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[SignalsResponse])
async def update_signalss_batch(
    request: SignalsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple signalss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} signalss")
    
    service = SignalsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} signalss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=SignalsResponse)
async def update_signals(
    id: int,
    data: SignalsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing signals"""
    logger.debug(f"Updating signals {id} with data: {data}")

    service = SignalsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Signals with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Signals not found")
        
        logger.info(f"Signals {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating signals {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating signals {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_signalss_batch(
    request: SignalsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple signalss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} signalss")
    
    service = SignalsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} signalss successfully")
        return {"message": f"Successfully deleted {deleted_count} signalss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_signals(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single signals by ID"""
    logger.debug(f"Deleting signals with id: {id}")
    
    service = SignalsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Signals with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Signals not found")
        
        logger.info(f"Signals {id} deleted successfully")
        return {"message": "Signals deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting signals {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")