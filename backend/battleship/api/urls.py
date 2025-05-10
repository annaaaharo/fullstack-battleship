from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import PlayerViewSet, GameViewSet, VesselViewSet, BoardViewSet, BoardVesselViewSet, ShotViewSet, UserViewSet

# Create a router and register our ViewSets with it.
router = DefaultRouter()


router.register(r'players', PlayerViewSet)
router.register(r'games', GameViewSet)
router.register(r'vessels', VesselViewSet)
router.register(r'boards', BoardViewSet)
router.register(r'board-vessels', BoardVesselViewSet)
router.register(r'shots', ShotViewSet)
router.register(r'user', UserViewSet)
urlpatterns = [
    path("", include(router.urls)),
]
#http://127.0.0.1:8000/api/v1/