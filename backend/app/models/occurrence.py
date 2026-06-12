import uuid
from enum import Enum

from tortoise import fields, models


class Status(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class Occurrence(models.Model):
    """Main occurrence report model."""

    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    lat = fields.FloatField()
    lon = fields.FloatField()
    images = fields.JSONField(default=list)
    status = fields.CharEnumField(Status, default=Status.PENDING)

    # tracking / anonymous identity
    tracking_code = fields.CharField(max_length=64, null=True, unique=True)

    # relations
    device = fields.ForeignKeyField(
        "models.Account", related_name="occurrences", null=True
    )
    entity = fields.ForeignKeyField(
        "models.Entity", related_name="occurrences", null=True
    )

    # prioritization / metadata
    priority = fields.IntField(default=0)
    metadata = fields.JSONField(null=True)

    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "occurrences"

    def __str__(self):
        return self.title
