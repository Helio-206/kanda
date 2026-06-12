import uuid

from tortoise import fields, models


class Entity(models.Model):
    """Represents a responsible entity (e.g. department) and optional location."""

    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    name = fields.CharField(max_length=255)
    lat = fields.FloatField(null=True)
    lon = fields.FloatField(null=True)
    priority = fields.IntField(default=0)
    contact = fields.JSONField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "entities"

    def __str__(self):
        return self.name
