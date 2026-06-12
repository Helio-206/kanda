import uuid

from tortoise import fields, models


class Account(models.Model):
    """Represents a device/account that can file occurrences."""

    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    device_id = fields.CharField(max_length=255, null=True, unique=True)
    name = fields.CharField(max_length=255, null=True)
    is_admin = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "accounts"

    def __str__(self):
        return self.name or str(self.id)
