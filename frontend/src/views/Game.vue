<script setup>
import { onMounted } from "vue";
import { useGameStore } from "../store";
import { useAuthStore } from "../store/authStore";
import GameBoard from "../components/GameBoard.vue";
import DockingArea from "../components/DockingArea.vue";
// import { ref } from "vue";
// import api from "../services/api";

const store = useGameStore();
const authStore = useAuthStore();


onMounted(async () => {
   if (!authStore.isAuthenticated) {
    window.location.href = "/";
    return;
  }

  try {
    await store.startNewGame();
  } catch (error) {
    console.error('Error inicialitzant el joc:', error);
  }
});

const onLogout = () => {
  if (confirm("Are you sure you want to log out?")) {
    authStore.logout();
    window.location.href = "/";
  }
};
</script>

<template>
  <!-- <pre>{{ user ? JSON.stringify(user, null, 2) : "Loading user data..." }}</pre> -->
  <div class="container-fluid">
    <h1 class="text-center my-2">
      Battleship (Hello: {{ authStore.username }})
      <button class="btn btn-sm btn-outline-danger ms-2" @click="onLogout">
        Logout
      </button>
    </h1>
    <div class="row">
      <!-- Player's Board -->
      <div class="col-lg-5 d-flex flex-column align-items-center">
        <h3 class="text-center">Your Fleet</h3>
        <GameBoard
          :board="store.playerBoard"
          :ships="store.playerPlacedShips"
          @cell-click="store.handlePlayerBoardClick"
        />
      </div>

      <!-- Docking Area - Solo en fase placement -->
      <div v-if="store.gamePhase === 'placement'" class="col-lg-2">
        <h3 class="text-center">Dock</h3>
        <DockingArea
          :ships="store.availableShips"
          @ship-selected="store.selectShip"
          @rotate-ship="store.rotateSelectedShip"
        />
      </div>

      <!-- Game Controls - Para todas las otras fases -->
      <div v-else class="col-lg-2 d-flex flex-column justify-content-center">
        <div class="game-controls text-center">
          <div class="game-status mb-3">{{ store.gameStatus }}</div>
          
          <!-- Botón New Game solo en waiting -->
          <button v-if="store.gamePhase === 'waiting'" class="btn btn-primary" @click="store.startNewGame()">
            New Game
          </button>
          
          <!-- Información de juego en playing -->
          <div v-if="store.gamePhase === 'playing'" class="playing-info">
            <div class="alert alert-info">
              Click on the enemy board to attack!
            </div>
          </div>
          
          <!-- Información de game over -->
          <div v-if="store.gamePhase === 'gameOver'" class="game-over-info">
            <div class="alert alert-success">
              Game Over!
            </div>
          </div>
        </div>
      </div>

      <!-- Opponent Board -->
      <div class="col-lg-5 d-flex flex-column align-items-center">
        <h3 class="text-center">Enemy Fleet</h3>
        <GameBoard
          :board="store.opponentBoard"
          :ships="store.opponentShips"
          :hidden="true"
          @cell-click="store.handleOpponentBoardClick"
        />
      </div>
    </div>
  </div>
</template>

<style>


.container-fluid {
  background-color: #dde4f8;
  padding: 20px;
}

.game-controls {
  background
  : linear-gradient(135deg, #728eec 0%, #dde4f8 100%);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #b037e1 0%, #e6a8e5 100%);
  border: none;
  color: white;
}

.game-status {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
