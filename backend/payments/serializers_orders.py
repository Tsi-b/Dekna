from __future__ import annotations

from rest_framework import serializers


class OrderStatusResponseSerializer(serializers.Serializer):
  order_status = serializers.CharField()
  payment_status = serializers.CharField()
