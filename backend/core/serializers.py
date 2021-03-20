import re
from rest_framework import serializers
from core.models import Session, Navigation

class SessionSerializer(serializers.ModelSerializer):
    """Serializes Session models."""
    # sessionID = serializers.CharField()
    

    class Meta:
        model = Session
        fields = ('sessionID', 'pauses',)

        fields = '__all__'

class NavigationSerializer(serializers.ModelSerializer):
    """Serializes Session models."""
    
    # session = SessionSerializer(required = False)
    session = serializers.HyperlinkedRelatedField(
        read_only=True,
        view_name='session-detail'
    )
    class Meta:
        model = Navigation

        fields = '__all__'
        extra_kwargs = {
            'session': {'allow_null': True, 'required': False},
        }