from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter

from .views import PlayerViewSet, GameViewSet, VesselViewSet, BoardViewSet, BoardVesselViewSet, ShotViewSet, \
    UserViewSet

router = DefaultRouter()
router.register(r'players', PlayerViewSet)
router.register(r'games', GameViewSet)

router.register(r'vessels', VesselViewSet, basename='vessels')
router.register(r'boards', BoardViewSet, basename='boards')
router.register(r'boardvessels', BoardVesselViewSet, basename='boardvessels')
router.register(r'shots', ShotViewSet, basename='shots')

router.register(r'user', UserViewSet)

# /api/v1/games/{gid}/players/
games_router = NestedSimpleRouter(router, r'games', lookup='game')
games_router.register(r'players', PlayerViewSet, basename='game-players')

# /api/v1/games/{gid}/players/{pid}/vessels/
game_players_router = NestedSimpleRouter(games_router, r'players', lookup='player')
game_players_router.register(r'vessels', BoardVesselViewSet, basename='game-player-vessels')

# /api/v1/games/{gid}/players/{pid}/shots/
game_players_router.register(r'shots', ShotViewSet, basename='game-player-shots')

# /api/v1/games/{gid}/players/{pid}/boards/
game_players_router.register(r'boards', BoardViewSet, basename='game-player-boards')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(games_router.urls)),
    path('', include(game_players_router.urls)),
]