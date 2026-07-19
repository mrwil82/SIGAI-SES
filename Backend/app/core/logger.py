import logging
import uuid
import functools
from contextvars import ContextVar
from typing import Optional, Any, Callable

request_id_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
user_id_var: ContextVar[Optional[int]] = ContextVar("user_id", default=None)


def get_request_id() -> Optional[str]:
    return request_id_var.get()


def set_request_id(rid: str) -> None:
    request_id_var.set(rid)


def get_user_id() -> Optional[int]:
    return user_id_var.get()


def set_user_id(uid: Optional[int]) -> None:
    user_id_var.set(uid)


class ContextLogger(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        extra = kwargs.get("extra", {})
        rid = get_request_id()
        uid = get_user_id()
        if rid:
            extra["request_id"] = rid
        if uid:
            extra["user_id"] = uid
        kwargs["extra"] = extra
        return msg, kwargs


def get_logger(name: str) -> ContextLogger:
    return ContextLogger(logging.getLogger(name), {})


def log_crud(func: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator for CRUD functions that logs entry, success, and errors."""
    logger = get_logger(func.__module__)

    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        func_name = func.__qualname__
        logger.debug(f"CRUD ENTRY | {func_name}", extra={"args": str(kwargs)})
        try:
            result = await func(*args, **kwargs)
            logger.debug(f"CRUD SUCCESS | {func_name}")
            return result
        except Exception as e:
            logger.error(f"CRUD ERROR | {func_name} | {str(e)}", exc_info=True)
            raise

    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        func_name = func.__qualname__
        logger.debug(f"CRUD ENTRY | {func_name}", extra={"args": str(kwargs)})
        try:
            result = func(*args, **kwargs)
            logger.debug(f"CRUD SUCCESS | {func_name}")
            return result
        except Exception as e:
            logger.error(f"CRUD ERROR | {func_name} | {str(e)}", exc_info=True)
            raise

    import asyncio
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    return sync_wrapper