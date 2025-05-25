<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/index";
import api from "../services/api";

const router = useRouter();
const authStore = useAuthStore();
const gameStore = useGameStore();

const availableGames = ref([]);
const loading = ref(false);
const error = ref("");

onMounted(async () => {
  await loadAvailableGames();
});

const loadAvailableGames = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await api.getAvailableGames();
    const allGames = response.data.results || response.data;
    //filtrem per partides que esperen usuaris
    availableGames.value = allGames.filter(game => 
      game.phase === 'waiting' && 
      (!game.players || game.players.length < 2)
    );
  } catch (err) {
    error.value = "Error al carregar les partidas disponibles";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const createNewGame = async () => {
  try {
    loading.value = true;
    const gameId = await api.setGame(authStore.playerId);
    gameStore.gameId = gameId;
    router.push("/game");
  } catch (err) {
    error.value = "Error al crear nova partida";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const joinGame = async (gameId) => {
  try {
    loading.value = true;
    await api.joinGame(gameId, authStore.playerId);
    gameStore.gameId = gameId;
    router.push("/game");
  } catch (err) {
    error.value = "Error al unir-se a la partida";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push("/");
};

const refreshGames = () => {
  loadAvailableGames();
};
</script>

<template>
  <div class="game-lobby">
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h2 class="mb-0">🚢 Battleship - Partides Disponibles</h2>
              <button class="btn btn-outline-secondary" @click="goBack">
                ← tornar
              </button>
            </div>
            
            <div class="card-body">
              <!-- Botones de acción -->
              <div class="mb-4 d-flex gap-2">
                <button 
                  class="btn btn-primary" 
                  @click="createNewGame"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  🎮 Crear nova partida
                </button>
                <button 
                  class="btn btn-outline-primary" 
                  @click="refreshGames"
                  :disabled="loading"
                >
                  🔄 Actualitzar llistat
                </button>
              </div>

              <!-- Error message -->
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>

              <!-- Loading -->
              <div v-if="loading && !error" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">carregant partides...</p>
              </div>

              <!-- Lista de partidas -->
              <div v-else-if="availableGames.length > 0">
                <h4 class="mb-3">partides esperant jugadors:</h4>
                <div class="row">
                  <div 
                    v-for="game in availableGames" 
                    :key="game.id"
                    class="col-md-6 mb-3"
                  >
                    <div class="card border-primary">
                      <div class="card-body">
                        <h5 class="card-title">
                          🎯 Partida #{{ game.id }}
                        </h5>
                        <div class="card-text">
                          <small class="text-muted">
                            <strong>Creador:</strong> {{ game.owner || 'Desconegut' }}
                          </small>
                          <br>
                          <small class="text-muted">
                            <strong>Jugadors:</strong> {{ game.players ? game.players.length : 0 }}/2
                          </small>
                          <br>
                          <small class="text-muted">
                            <strong>Tauler:</strong> {{ game.width }}x{{ game.height }}
                          </small>
                          <br>
                          <small class="text-muted">
                            <strong>Estat:</strong> {{ game.phase }}
                          </small>
                          <div v-if="game.players && game.players.length > 0" class="mt-2">
                            <small class="text-info">
                              <strong>En partida:</strong> 
                              {{ game.players.map(p => p.nickname).join(', ') }}
                            </small>
                          </div>
                        </div>
                        <button 
                          class="btn btn-success mt-2 w-100"
                          @click="joinGame(game.id)"
                          :disabled="loading"
                        >
                          UNIR-SE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No hay partidas -->
              <div v-else-if="!loading">
                <div class="text-center py-5">
                  <h4 class="text-muted mb-3">No hi ha partides disponibles :( </h4>
                  <p class="text-muted">
                    No hi ha partides esperant jugadors en aquest moment.
                  </p>
                  <button 
                    class="btn btn-primary btn-lg"
                    @click="createNewGame"
                    :disabled="loading"
                  >
                    🎮 Crear la primera partida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-lobby {
  min-height: 100vh;
  background-color: #e6a8e5;
  padding: 20px 0;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background: linear-gradient(135deg, #d21bc0 0%, #b037e1 100%);
  color: white;
  border-bottom: none;
}

.btn-primary {
  background: linear-gradient(135deg, #d21bc0 0%, #b037e1 100%);
  border: none;
}

.btn-outline-primary {
  background: transparent;
  border: 2px solid #b037e1;
  color: #d21bc0;
}

.btn-outline-secondary {
  background: transparent;
  border: 2px solid rgba(4, 0, 0, 0.98);
  color: rgba(4, 0, 0, 0.98);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #d21bc0 0%, #b037e1 100%);
  transform: translateY(-1px);
}

.card.border-primary {
  border: 2px solid #d21bc0 !important;
}

.card.border-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(4, 0, 0, 0.98);
  transition: all 0.3s ease;
}

.btn-success {
  background: linear-gradient(135deg, #d21bc0 0%, #b037e1 100%);
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #d21bc0 0%, #b037e1 100%);
}
</style> 