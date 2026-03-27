from rest_framework import serializers
from django.http import JsonResponse
import logging

from map.models import CommunityArea, RestaurantPermit

class CommunityAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityArea
        fields = ["name", "num_permits"]

    num_permits = serializers.SerializerMethodField()

    

    def get_num_permits(self, obj):
        """
        TODO: supplement each community area object with the numbesr
        of permits issued in the given year.

        e.g. The endpoint /map-data/?year=2017 should return something like:
        [
            {
                "ROGERS PARK": {
                    area_id: 17,
                    num_permits: 2
                },
                "BEVERLY": {
                    area_id: 72,
                    num_permits: 2
                },
                ...
            }
        ]
        """
        permit_counter = 0
        # TODO add year filtering
        for permit in RestaurantPermit.objects.all():
            if permit.community_area_id == self.Meta.model.area_id:
                permit_counter += 1

        return permit_counter
