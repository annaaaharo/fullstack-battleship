from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Player, Game, Vessel, Board, BoardVessel, Shot
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")
        # exclude = ('password',)

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
    owner = serializers.ReadOnlyField(source='owner.user.username')

    class Meta:
        model = Game
        fields = '__all__'
        #extended_status = serializaer.
        #quan un joc es serialitzi crea un nou atribut on hi haurà el resultat de la crida del metedo del serialitzador get_extended_status

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

class ShotSerializer(serializers.ModelSerializer):
    player = serializers.ReadOnlyField(source='player.nickname')
    game = serializers.ReadOnlyField(source='game.id')
    board = serializers.ReadOnlyField(source='board.id')
    board_vessel = serializers.ReadOnlyField(source='board_vessel.id', allow_null=True)

    class Meta:
        model = Shot
        fields = '__all__'