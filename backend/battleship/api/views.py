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
    filterset_fields = ['phase']
    ordering_fields = ['id']
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        player_id = self.request.data.get('player')
        if player_id:
            player = get_object_or_404(models.Player, id=player_id)
        else:
            player = get_object_or_404(models.Player, user=User.objects.first())

        ensure_default_vessels()
        game = serializer.save(owner=player, phase="placement")
        game.players.add(player)
        game.save()

        # Crear un tauler per al jugador
        board, created = Board.objects.get_or_create(game=game, player=player)
        print(f"Tauler {'creat' if created else 'obtingut'} per al joc {game.id}, jugador {player.id}: board_id={board.id}")



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

    @action(detail=True, methods=["delete"])
    def delete_game(self, request, pk=None):
        #eliminem una partida específica
        game = self.get_object()
        player_id = request.data.get("player_id") or request.query_params.get("player_id")
        
        if not player_id:
            return Response({"error": "player_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            player = get_object_or_404(Player, id=player_id)
            #verificar que el jugador és el propietari de la partida
            if game.owner != player:
                return Response({"error": "You can only delete your own games"}, status=status.HTTP_403_FORBIDDEN)
            
            game_id = game.id
            game.delete()
            return Response({
                "status": "success", 
                "message": f"Partida {game_id} eliminada correctament"
            })
        except:
            return Response({"error": "Player not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["post"])
    def clear_all_games(self, request):
        #eliminem les partides del jugador
        player_id = request.data.get("player_id")
        
        if player_id:
            #només eliminem les partides del jugador
            try:
                player = get_object_or_404(Player, id=player_id)
                games_count = Game.objects.filter(owner=player).count()
                Game.objects.filter(owner=player).delete()
                return Response({
                    "status": "success", 
                    "message": f"Eliminadas {games_count} partidas del jugador {player.nickname}"
                })
            except:
                return Response({"error": "Player not found"}, status=status.HTTP_404_NOT_FOUND)
        
            

    @action(detail=False, methods=["get"])
    def my_games(self, request):
        #obtem les partides del jugador
        player_id = request.query_params.get("player_id")
        if not player_id:
            return Response({"error": "player_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            player = get_object_or_404(Player, id=player_id)
            games = Game.objects.filter(owner=player)
            serializer = self.get_serializer(games, many=True)
            return Response({
                "count": games.count(),
                "games": serializer.data
            })
        except:
            return Response({"error": "Player not found"}, status=status.HTTP_404_NOT_FOUND)


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
        player_id = self.request.data.get('player')
        player = get_object_or_404(models.Player, id=player_id)
        game = get_object_or_404(Game, id=self.request.data.get('game'))
        board, created = Board.objects.get_or_create(game=game, player=player)
        serializer.save(player=player, game=game)
        print(f"Tauler {'creat' if created else 'obtingut'} a BoardViewSet: board_id={board.id}, game_id={game.id}, player_id={player.id}")

def all_vessels_placed(board):
    # Cada jugador ha de col·locar exactament 5 vaixells (1 de cada tipus)
    return BoardVessel.objects.filter(board=board).count() == 5

def ensure_default_vessels():
    """Crear vaixells per defecte si no existeixen"""
    vessels_data = [
        {"id": 1, "size": 1, "name": "Patrol Boat"},
        {"id": 2, "size": 2, "name": "Destroyer"},
        {"id": 3, "size": 3, "name": "Cruiser"},
        {"id": 4, "size": 4, "name": "Submarine"},
        {"id": 5, "size": 5, "name": "Carrier"},
    ]
    
    for vessel_data in vessels_data:
        Vessel.objects.get_or_create(
            id=vessel_data["id"],
            defaults={
                "size": vessel_data["size"],
                "name": vessel_data["name"]
            }
        )
        print(f"Vaixells creats/verificats: {Vessel.objects.count()}")  # Debug


class BoardVesselViewSet(viewsets.ModelViewSet):
    queryset = BoardVessel.objects.all()
    serializer_class = BoardVesselSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['vessel__name']

    def perform_create(self, serializer):
        ensure_default_vessels()

        board_id = self.request.data.get('board')
        vessel_id = self.request.data.get('vessel')
        print(f"Creant BoardVessel: board_id={board_id}, vessel_id={vessel_id}")

        board = get_object_or_404(Board, id=board_id)
        vessel = get_object_or_404(Vessel, id=vessel_id)

        # Verificar que no se duplique el mismo tipo de barco
        existing_vessel = BoardVessel.objects.filter(board=board, vessel=vessel).first()
        if existing_vessel:
            print(f"❌ Barco tipo {vessel_id} ya existe en el tablero {board_id}")
            return Response({"error": f"Vessel type {vessel_id} already placed on this board"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Comprovar si aquest jugador ha col·locat tots els seus vaixells
        vessel_count_before = BoardVessel.objects.filter(board=board).count()
        if vessel_count_before >= 5:
            print(f"❌ Ya hay 5 barcos en el tablero {board_id}")
            return Response({"error": "Maximum 5 vessels allowed per board"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        board_vessel = serializer.save(board=board, vessel=vessel)
        game = board_vessel.board.game

        vessel_count = BoardVessel.objects.filter(board=board).count()
        print(f"Vaixells col·locats al tauler {board.id}: {vessel_count}")
        print(f"Joc ID: {game.id}, Jugadors: {game.players.count()}")
        print(f"Fase actual del juego: {game.phase}")

        # Comprobar si este jugador ha colocado todos sus barcos
        if vessel_count >= 5:  # Cada jugador ha de colocar 5 barcos
            print(f"Jugador {board.player.nickname} ha colocado todos los barcos ({vessel_count})")
            
            # Obtener todos los tableros del juego
            all_boards = game.boards.all()
            print(f"Tableros en el juego: {[b.id for b in all_boards]}")
            print(f"Número de jugadores en el juego: {game.players.count()}")
            
            # Si solo hay 1 jugador, cambiar directamente a playing
            if game.players.count() == 1:
                print("Juego de un solo jugador detectado")
                game.phase = "playing"
                game.turn = board.player.user.username
                game.save()
                print(f"CAMBIANDO A FASE PLAYING (1 jugador) - turn: {game.turn}")
            else:
                # Verificar si todos los jugadores han colocado sus barcos (2+ jugadores)
                all_players_ready = True
                for game_board in all_boards:
                    board_vessel_count = BoardVessel.objects.filter(board=game_board).count()
                    print(f"Tablero {game_board.id} (jugador {game_board.player.nickname}): {board_vessel_count} barcos")
                    if board_vessel_count < 5:
                        all_players_ready = False
                        break
                
                print(f"Todos los jugadores preparados: {all_players_ready}")
                
                if all_players_ready:
                    game.phase = "playing"
                    # Establecer el turno al primer jugador (el humano, no el bot)
                    human_player = None
                    for game_board in all_boards:
                        if not game_board.player.nickname.startswith('Bot_'):
                            human_player = game_board.player
                            break
                    
                    if human_player:
                        game.turn = human_player.user.username
                    else:
                        # Fallback al primer jugador
                        game.turn = all_boards.first().player.user.username
                    
                    game.save()
                    print(f"CAMBIANDO A FASE PLAYING (2+ jugadores) - turn: {game.turn}")
                else:
                    print(f"Esperando que otros jugadores coloquen sus barcos")

class ShotViewSet(viewsets.ModelViewSet):
    queryset = Shot.objects.all()
    serializer_class = ShotSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['player__nickname']
    ordering_fields = ['id']

    def perform_create(self, serializer):
        # Obtener datos del frontend en lugar de hardcodear
        player = get_object_or_404(models.Player, id=self.request.data.get('player'))
        game = get_object_or_404(Game, id=self.request.data.get('game'))
        board = get_object_or_404(Board, id=self.request.data.get('board'))
        serializer.save(player=player, game=game, board=board)