from rest_framework import viewsets, filters, status
from django.contrib.auth.models import User
from . import serializers, models
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny


from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny

from .models import Player, Game, Vessel, Board, BoardVessel, Shot
from .serializers import PlayerSerializer, GameSerializer, VesselSerializer, BoardSerializer, BoardVesselSerializer, ShotSerializer
from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve` actions.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']
    permission_classes = [permissions.AllowAny]


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nickname']
    permission_classes = [AllowAny]

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['phase']
    ordering_fields = ['id']
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        player = get_object_or_404(models.Player, user=User.objects.first())
        serializer.save(owner=player)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def update_phase(self, request, pk=None):
        game = self.get_object()
        phase = request.data.get("phase")
        turn  = request.data.get("turn")
        game.turn = turn
        game.phase = phase
        game.save()
        return Response({"status": "updated"})


class VesselViewSet(viewsets.ModelViewSet):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']



class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['player__nickname']

    def perform_create(self, serializer):
        player = get_object_or_404(models.Player, user=User.objects.first())
        game = get_object_or_404(Game, id=self.request.data.get('game'))
        serializer.save(player=player, game=game)

def all_vessels_placed(board):
    total_vessels = Vessel.objects.count()
    return BoardVessel.objects.filter(board=board).count() == total_vessels

class BoardVesselViewSet(viewsets.ModelViewSet):
    queryset = BoardVessel.objects.all()
    serializer_class = BoardVesselSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['vessel__name']

    def perform_create(self, serializer):
        board_vessel = serializer.save()
        game = board_vessel.board.game
        print("➡️ Vessel placed. Game:", game.id)

        boards = game.board_set.all()
        print("🔎 Number of boards:", boards.count())
        if boards.count() == 2:
            if all(all_vessels_placed(board) for board in boards):
                print("✅ All vessels placed. Changing phase to 'playing'.")
                game.phase = "playing"
                game.turn = boards.first().owner  # o el jugador que vulguis
                game.save()

class ShotViewSet(viewsets.ModelViewSet):
    queryset = Shot.objects.all()
    serializer_class = ShotSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['player__nickname']
    ordering_fields = ['id']

    def perform_create(self, serializer):
        player = get_object_or_404(models.Player, user=User.objects.first())
        game = get_object_or_404(Game, id=self.request.data.get('game'))
        board = get_object_or_404(Board, id=self.request.data.get('board'))
        serializer.save(player=player, game=game, board=board)