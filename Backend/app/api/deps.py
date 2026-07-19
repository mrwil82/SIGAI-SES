from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import settings
from app.crud import crud_user
from app.schemas import TokenData
from app.core.logger import set_user_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = await crud_user.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    set_user_id(int(getattr(user, "id_usuario", 0)))
    return user


def require_roles(*allowed_roles):
    """dependecias para requerir roles de usuario en las rutas de FastAPI. Se puede usar como una dependencia en las rutas para restringir el acceso a ciertos roles.
    """
    def _require(current_user = Depends(get_current_user)):
        if getattr(current_user, "rol", None) not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
        return current_user
    return _require
