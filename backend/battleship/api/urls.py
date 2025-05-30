from django.urls import path, include
from rest_framework.routers import DefaultRouter

from rest_framework_nested.routers import NestedSimpleRouter

from .views import PlayerViewSet, GameViewSet, VesselViewSet, BoardViewSet, BoardVesselViewSet, ShotViewSet, \
    UserViewSet
from rest_framework import routers


router = DefaultRouter()
router.register(r'players', PlayerViewSet)
router.register(r'games', GameViewSet)
router.register(r'vessels', VesselViewSet, basename='vessels')
router.register(r'boards', BoardViewSet, basename='boards')
router.register(r'boardvessels', BoardVesselViewSet, basename='boardvessels')
router.register(r'shots', ShotViewSet, basename='shots')
router.register(r'users', UserViewSet, basename='user')

# /api/v1/games/{gid}/players/
games_router = NestedSimpleRouter(router, r'games', lookup='game')
games_router.register(r'players', PlayerViewSet, basename='game-players')

# /api/v1/games/{gid}/players/{pid}/vessels/
game_players_router = NestedSimpleRouter(games_router, r'players', lookup='player')

# /api/v1/games/{gid}/players/{pid}/shots/
game_players_router.register(r'shots', ShotViewSet, basename='game-player-shots')

# /api/v1/games/{gid}/players/{pid}/boards/
game_players_router.register(r'boards', BoardViewSet, basename='game-player-boards')

#/api/v1/games/{gid}/update_phase/
game_players_router.register(r'games', GameViewSet, basename='update_phase')

#/api/v1/games/{gid}/setWinner/
game_players_router.register(r'games', GameViewSet, basename='update_winner')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(games_router.urls)),
    path('', include(game_players_router.urls)),
]