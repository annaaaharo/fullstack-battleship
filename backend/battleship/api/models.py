# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=50)

class Game(models.Model):
    PHASE_WAITING = "waiting"
    PHASE_PLACEMENT = "placement"
    PHASE_PLAYING = "playing"
    PHASE_GAMEOVER = "gameOver"
    PHASE_CHOICES = {
        PHASE_WAITING: "Waiting",
        PHASE_PLACEMENT: "Placement",
        PHASE_PLAYING: "Playing",
        PHASE_GAMEOVER: "Game Over",
    }

    players = models.ManyToManyField(Player, related_name="games", null=True, blank=True)
    width = models.IntegerField(validators=[MinValueValidator(5), MaxValueValidator(200)], default=10)
    height = models.IntegerField(validators=[MinValueValidator(5), MaxValueValidator(200)], default=10)
    multiplayer = models.BooleanField(default=False)
    turn = models.CharField(max_length=20, null=True, blank=True)
    phase = models.CharField(max_length=15, choices=PHASE_CHOICES.items(), default=PHASE_WAITING)
    winner = models.ForeignKey(Player, related_name="winner", on_delete=models.SET_NULL, blank=True, null=True)
    owner = models.ForeignKey(Player, related_name="owner", on_delete=models.SET_NULL, null=True)

class Vessel(models.Model):
    size = models.IntegerField(validators=[MinValueValidator(1)])
    name = models.CharField(max_length=50)
    image = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.name

class Board(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="boards")
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="boards")
    prepared = models.BooleanField(default=False)

    def __str__(self):
        return f"Board for {self.player.nickname} in Game {self.game.id}"

class BoardVessel(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="vessels")
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="board_vessels")
    ri = models.IntegerField(validators=[MinValueValidator(0)])
    ci = models.IntegerField(validators=[MinValueValidator(0)])
    rf = models.IntegerField(validators=[MinValueValidator(0)])
    cf = models.IntegerField(validators=[MinValueValidator(0)])
    alive = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.vessel.name} on {self.board}"

class Shot(models.Model):
    RESULT_WATER = 0
    RESULT_HIT = 1
    RESULT_SUNK = 2
    RESULT_CHOICES = [
        (RESULT_WATER, "Water"),
        (RESULT_HIT, "Hit"),
        (RESULT_SUNK, "Sunk"),
    ]

    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="shots")
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="shots")
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="shots")
    board_vessel = models.OneToOneField(BoardVessel, on_delete=models.SET_NULL, related_name="shot", blank=True, null=True)
    row = models.IntegerField(validators=[MinValueValidator(0)])
    col = models.IntegerField(validators=[MinValueValidator(0)])
    result = models.IntegerField(choices=RESULT_CHOICES, default=RESULT_WATER)

    def __str__(self):
        return f"Shot by {self.player.nickname} at ({self.row}, {self.col})"