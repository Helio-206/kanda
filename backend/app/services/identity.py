import secrets
from typing import Optional

from app.models.account import Account


def generate_tracking_code(prefix: str = "K", length: int = 8) -> str:
    """Generate a short tracking code used to allow anonymous tracking of a report.

    The implementation uses a URL-safe token sliced to the requested length.
    """
    token = secrets.token_urlsafe(length)
    # keep alphanum only, uppercase for readability
    code = "".join([c for c in token if c.isalnum()]).upper()[:length]
    return f"{prefix}{code}"


async def get_device_account(device_id: Optional[str] = None) -> Account:
    """Fetch or create an Account representing a device. If device_id is None a new device account is created."""
    if device_id:
        existing = await Account.get_or_none(device_id=device_id)
        if existing:
            return existing

    # create a new device account with a generated device_id
    generated = device_id or secrets.token_hex(12)
    account = await Account.create(device_id=generated)
    return account


async def get_admin_account() -> Account:
    admin = await Account.get_or_none(is_admin=True)
    if admin:
        return admin
    return await Account.create(name="admin", is_admin=True)
