from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Player, Game, Vessel, Board, BoardVessel, Shot
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError, ValidationError


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"]
        )
        user.is_active = True
        user.save()
        return user


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class GameSerializer(serializers.ModelSerializer):
    game_state_response = serializers.SerializerMethodField()
    turn = serializers.CharField(read_only=True, allow_null=True)
    winner = serializers.CharField(source='winner.nickname', read_only=True, allow_null=True)
    players = serializers.SerializerMethodField()
    owner = serializers.CharField(source='owner.nickname', read_only=True, allow_null=True)

    class Meta:
        model = Game
        fields = ['id', 'phase', 'turn', 'winner', 'width', 'height', 'multiplayer', 'players', 'owner', 'game_state_response']

    def get_game_state_response(self, obj):
        return GameStateResponseSerializer(obj, context=self.context).data
    
    def get_players(self, obj):
        return [{"id": player.id, "nickname": player.nickname} for player in obj.players.all()]

class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = '__all__'

class BoardSerializer(serializers.ModelSerializer):
    player = serializers.ReadOnlyField(source='player.nickname')
    game = serializers.ReadOnlyField(source='game.id')

    class Meta:
        model = Board
        fields = '__all__'

class BoardVesselSerializer(serializers.ModelSerializer):
    vessel = serializers.ReadOnlyField(source='vessel.name')
    board = serializers.ReadOnlyField(source='board.id')

    class Meta:
        model = BoardVessel
        fields = '__all__'

    def validate(self, data):
        board = data.get('board')
        vessel = data.get('vessel')
        if board and vessel:
            if BoardVessel.objects.filter(board=board, vessel=vessel).exists():
                raise serializers.ValidationError(f"Vessel type {vessel.id} already placed on board {board.id}")
            if BoardVessel.objects.filter(board=board).count() >= 5:
                raise serializers.ValidationError(f"Maximum 5 vessels allowed on board {board.id}")
        return data

class ShotSerializer(serializers.ModelSerializer):
    player = serializers.ReadOnlyField(source='player.nickname')
    game = serializers.ReadOnlyField(source='game.id')
    board = serializers.ReadOnlyField(source='board.id')
    board_vessel = serializers.ReadOnlyField(source='board_vessel.id', allow_null=True)

    class Meta:
        model = Shot
        fields = '__all__'

class GameStateResponseSerializer(serializers.Serializer):
    status = serializers.IntegerField(default=200)
    message = serializers.CharField(default='OK')
    data = serializers.SerializerMethodField()

    def get_data(self, obj):
        request = self.context.get("request")
        current_player = None
        if request and request.user.is_authenticated:
            try:
                current_player = request.user.player
            except AttributeError:
                pass  # L'usuari autenticat no té un Player associat

        player1_data = None
        player2_data = None

        if current_player:
            try:
                board1 = Board.objects.get(game=obj, player=current_player)
                player1_data = PlayerStateSerializer(board1).data
                board2 = obj.boards.exclude(player=current_player).first()
                if board2:
                    player2_data = PlayerStateSerializer(board2).data
            except Board.DoesNotExist:
                pass

        return {
            "gameState": {
                "gameId": str(obj.id),
                "phase": obj.phase,
                "turn": obj.turn,
                "winner": obj.winner.nickname if obj.winner else None,
                "player1": player1_data,
                "player2": player2_data
            }
        }


class GameStateSerializer(serializers.Serializer):
    gameId = serializers.CharField(source='id')
    phase = serializers.CharField()
    turn = serializers.CharField(allow_null=True)
    winner = serializers.CharField(source='winner.nickname', allow_null=True)
    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()

    def get_player1(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        try:
            current_player = request.user.player
        except AttributeError:
            return None
        try:
            board = Board.objects.get(game=obj, player=current_player)  # Canvia 'owner' per 'player'
            return PlayerStateSerializer(board).data
        except Board.DoesNotExist:
            return None

    def get_player2(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        try:
            current_player = request.user.player
        except AttributeError:
            return None
        board = obj.board_set.exclude(player=current_player).first()  # Canvia 'owner' per 'player'
        return PlayerStateSerializer(board).data if board else None

class PlayerStateSerializer(serializers.Serializer):
    id = serializers.CharField(source='player.id')
    username = serializers.CharField(source='player.nickname')
    placedShips = serializers.SerializerMethodField()
    availableShips = serializers.SerializerMethodField()
    board = serializers.SerializerMethodField()

    def get_placedShips(self, board):
        ships = []
        for vessel in BoardVessel.objects.filter(board=board):
            ships.append({
                'type': vessel.vessel.id,
                'position': {
                    'row': vessel.ri,
                    'col': vessel.ci
                },
                'isVertical': vessel.rf != vessel.ri,
                'size': vessel.vessel.size
            })
        return ships

    def get_availableShips(self, board):
        all_vessels = Vessel.objects.all()
        placed_vessels = BoardVessel.objects.filter(board=board)
        ships = []

        for vessel in all_vessels:
            if not placed_vessels.filter(vessel=vessel).exists():
                ships.append({
                    'type': vessel.id,
                    'isVertical': True,
                    'size': vessel.size
                })
        return ships

    def get_board(self, board):
        size = board.game.width
        grid = [[0 for _ in range(size)] for _ in range(size)]

        # Afegeix els vaixells
        for vessel in BoardVessel.objects.filter(board=board):
            value = vessel.vessel.id if vessel.alive else -vessel.vessel.id
            for i in range(min(vessel.ri, vessel.rf), max(vessel.ri, vessel.rf) + 1):
                for j in range(min(vessel.ci, vessel.cf), max(vessel.ci, vessel.cf) + 1):
                    grid[i][j] = value

        # Afegeix els trets
        for shot in Shot.objects.filter(board=board):
            if grid[shot.row][shot.col] == 0:
                grid[shot.row][shot.col] = 11  # Fallat

        return grid
