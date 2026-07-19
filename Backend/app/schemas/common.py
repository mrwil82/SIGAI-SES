from pydantic import BaseModel, ConfigDict
from typing import TypeVar, Generic, List, Optional

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)

    @classmethod
    def create(cls, items: List[T], total: int, page: int, page_size: int) -> "PaginatedResponse[T]":
        total_pages = max(1, (total + max(1, page_size) - 1) // max(1, page_size))
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        )