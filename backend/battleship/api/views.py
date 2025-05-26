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
        # Obtener el player del request data o usar el primer player como fallback
        player_id = self.request.data.get('player')
        if player_id:
            player = get_object_or_404(models.Player, id=player_id)
        else:
            player = get_object_or_404(models.Player, user=User.objects.first())
        
        game = serializer.save(owner=player)
        # Añadir al creador como primer jugador
        game.players.add(player)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def update_phase(self, request, pk=None):
        game = self.get_object()
        phase = request.data.get("phase")
        turn_str = request.data.get("turn")
        
        # Para el turn, simplemente almacenamos el string
        game.turn = turn_str
        game.phase = phase
        game.save()
        return Response({"status": "updated"})

    @action(detail=True, methods=["post"])
    def update_winner(self, request, pk=None):
        game = self.get_object()
        phase = request.data.get("phase")
        winner_str = request.data.get("winner")
        
        # Convertir el string winner a Player object
        if winner_str == "player1":
            # Obtener el primer jugador del juego
            winner = game.players.first()
        elif winner_str == "player2":
            # Obtener el segundo jugador del juego
            players = list(game.players.all())
            winner = players[1] if len(players) > 1 else None
        else:
            winner = None
            
        game.winner = winner
        game.phase = phase
        game.save()
        #return Response({"status": "updated", "winner": winner.nickname if winner else None})
        return Response({"status": "updated", "winner": winner.nickname if winner else None})

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        game = self.get_object()
        player_id = request.data.get("player")
        
        try:
            player = get_object_or_404(Player, id=player_id)
        except:
            return Response({"error": "Player not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar que el juego esté en fase waiting
        if game.phase != "waiting":
            return Response({"error": "Game is not waiting for players"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que el jugador no esté ya en el juego
        if game.players.filter(id=player.id).exists():
            return Response({"error": "Player already in this game"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que no haya más de 2 jugadores
        if game.players.count() >= 2:
            return Response({"error": "Game is full"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Añadir el jugador al juego
        game.players.add(player)
        
        # Si ahora hay 2 jugadores, cambiar a fase placement
        if game.players.count() == 2:
            game.phase = "placement"
            game.save()
            
            # Crear tableros para ambos jugadores
            for game_player in game.players.all():
                Board.objects.get_or_create(game=game, player=game_player)
        
        return Response({
            "status": "joined", 
            "game_id": game.id, 
            "players_count": game.players.count(),
            "phase": game.phase
        })


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

        boards = game.board_set.all()
        print("🔎 Number of boards:", boards.count())
        if boards.count() == 2:
            if all(all_vessels_placed(board) for board in boards):
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