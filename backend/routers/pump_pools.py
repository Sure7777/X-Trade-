import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.pump_pools import Pump_poolsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/pump_pools", tags=["pump_pools"])


# ---------- Pydantic Schemas ----------
class Pump_poolsData(BaseModel):
    """Entity data schema (for create/update)"""
    name: str
    symbol: str
    target_amount: float
    current_amount: float = None
    participants_count: int = None
    launch_time: str
    status: str = None
    expected_profit_pct: float


class Pump_poolsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    name: Optional[str] = None
    symbol: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    participants_count: Optional[int] = None
    launch_time: Optional[str] = None
    status: Optional[str] = None
    expected_profit_pct: Optional[float] = None


class Pump_poolsResponse(BaseModel):
    """Entity response schema"""
    id: int
    name: str
    symbol: str
    target_amount: float
    current_amount: Optional[float] = None
    participants_count: Optional[int] = None
    launch_time: str
    status: Optional[str] = None
    expected_profit_pct: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Pump_poolsListResponse(BaseModel):
    """List response schema"""
    items: List[Pump_poolsResponse]
    total: int
    skip: int
    limit: int


class Pump_poolsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Pump_poolsData]


class Pump_poolsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Pump_poolsUpdateData


class Pump_poolsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Pump_poolsBatchUpdateItem]


class Pump_poolsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Pump_poolsListResponse)
async def query_pump_poolss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query pump_poolss with filtering, sorting, and pagination"""
    logger.debug(f"Querying pump_poolss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Pump_poolsService(db)
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
        logger.debug(f"Found {result['total']} pump_poolss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying pump_poolss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Pump_poolsListResponse)
async def query_pump_poolss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query pump_poolss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying pump_poolss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Pump_poolsService(db)
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
        logger.debug(f"Found {result['total']} pump_poolss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying pump_poolss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Pump_poolsResponse)
async def get_pump_pools(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single pump_pools by ID"""
    logger.debug(f"Fetching pump_pools with id: {id}, fields={fields}")
    
    service = Pump_poolsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Pump_pools with id {id} not found")
            raise HTTPException(status_code=404, detail="Pump_pools not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pump_pools {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Pump_poolsResponse, status_code=201)
async def create_pump_pools(
    data: Pump_poolsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new pump_pools"""
    logger.debug(f"Creating new pump_pools with data: {data}")
    
    service = Pump_poolsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create pump_pools")
        
        logger.info(f"Pump_pools created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating pump_pools: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating pump_pools: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Pump_poolsResponse], status_code=201)
async def create_pump_poolss_batch(
    request: Pump_poolsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple pump_poolss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} pump_poolss")
    
    service = Pump_poolsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} pump_poolss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Pump_poolsResponse])
async def update_pump_poolss_batch(
    request: Pump_poolsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple pump_poolss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} pump_poolss")
    
    service = Pump_poolsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} pump_poolss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Pump_poolsResponse)
async def update_pump_pools(
    id: int,
    data: Pump_poolsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing pump_pools"""
    logger.debug(f"Updating pump_pools {id} with data: {data}")

    service = Pump_poolsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Pump_pools with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Pump_pools not found")
        
        logger.info(f"Pump_pools {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating pump_pools {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating pump_pools {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_pump_poolss_batch(
    request: Pump_poolsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple pump_poolss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} pump_poolss")
    
    service = Pump_poolsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} pump_poolss successfully")
        return {"message": f"Successfully deleted {deleted_count} pump_poolss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_pump_pools(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single pump_pools by ID"""
    logger.debug(f"Deleting pump_pools with id: {id}")
    
    service = Pump_poolsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Pump_pools with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Pump_pools not found")
        
        logger.info(f"Pump_pools {id} deleted successfully")
        return {"message": "Pump_pools deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting pump_pools {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")