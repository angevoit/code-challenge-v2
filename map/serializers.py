from rest_framework import serializers

from map.models import CommunityArea, RestaurantPermit

class CommunityAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityArea
        fields = ["name", "area_id", "num_permits"]

    area_id = serializers.SerializerMethodField()
    num_permits = serializers.SerializerMethodField()

    def get_area_id(self, obj):
        return obj.area_id

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
        year = int(self.context.get("year"))
        return RestaurantPermit.objects.filter( community_area_id=str(obj.area_id), issue_date__year=year).count()
