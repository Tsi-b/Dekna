from __future__ import annotations

from rest_framework import serializers


class StrictSerializer(serializers.Serializer):
  """Serializer that rejects unknown/extra fields.

  DRF by default ignores unknown keys. For payment initiation we must be strict.
  """

  def to_internal_value(self, data):
    if not isinstance(data, dict):
      raise serializers.ValidationError("Invalid payload.")

    unknown = set(data.keys()) - set(self.fields.keys())
    if unknown:
      raise serializers.ValidationError({"detail": f"Unexpected fields: {', '.join(sorted(unknown))}"})

    return super().to_internal_value(data)


class PaymentInitiateRequestSerializer(StrictSerializer):
  order_id = serializers.UUIDField()


class PaymentInitiateResponseSerializer(serializers.Serializer):
  checkout_url = serializers.URLField()


class PaymentVerifyRequestSerializer(StrictSerializer):
  tx_ref = serializers.CharField(max_length=100)


class PaymentVerifyResponseSerializer(serializers.Serializer):
  status = serializers.ChoiceField(choices=["pending", "verified", "failed", "cancelled"])