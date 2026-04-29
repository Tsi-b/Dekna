from django.db import models


class Payment(models.Model):
  """
  Minimal placeholder model for future Chapa payment records.
  Not wired to Supabase directly; Django will later call Supabase APIs.
  """

  reference = models.CharField(max_length=100, unique=True)
  amount = models.DecimalField(max_digits=12, decimal_places=2)
  currency = models.CharField(max_length=10, default="ETB")
  status = models.CharField(max_length=50, default="initialized")
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    ordering = ["-created_at"]

  def __str__(self) -> str:
    return f"{self.reference} ({self.status})"



