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
const myGames = ref([]);
const loading = ref(false);
const error = ref("");
const showMyGames = ref(false);

onMounted(async () => {
  if (!authStore.playerId) {
    console.warn("authStore.playerId is not set, waiting for initialization...");
  }
  await loadAvailableGames();
});

const loadAvailableGames = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await api.getAvailableGames();
    const allGames = response.data.results || response.data;
    availableGames.value = allGames.filter(game =>
      (game.phase === 'waiting' || game.phase === 'placement') &&
      (!game.players || game.players.length < 2)
    );
  } catch (err) {
    error.value = "Error al carregar les partides disponibles";
  } finally {
    loading.value = false;
  }
};

const loadMyGames = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await api.getMyGames(authStore.playerId);
    myGames.value = response.data.games || [];
  } catch (err) {
    error.value = "Error al cargar tus partidas";
    console.error(err);
  } finally {
    loading.value = false;
  }
};


const toggleMyGames = async () => {
  showMyGames.value = !showMyGames.value;
  if (showMyGames.value) {
    await loadMyGames();
  }
};

const createNewGame = async () => {
  if (loading.value) return;
  try {
    loading.value = true;
    router.push('/game'); // Redirect without creating game
  } catch (err) {
    error.value = "Error al redirigir a la partida";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const joinGame = async (gameId) => {
  if (loading.value) return;
  
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

const deleteGame = async (gameId) => {
  if (!confirm(`Estàs segur que vols eliminar la partida #${gameId}?`)) {
    return;
  }
  
  try {
    loading.value = true;
    await api.deleteGame(gameId, authStore.playerId);
    
    // Recarregar les llistes
    await loadMyGames();
    await loadAvailableGames();
    
    error.value = "";
  } catch (err) {
    error.value = "Error al eliminar la partida";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const clearMyGames = async () => {
  if (!confirm("Estàs segur que vols eliminar TOTES les teves partides? Aquesta acció no es pot desfer.")) {
    return;
  }
  
  try {
    loading.value = true;
    await api.clearMyGames(authStore.playerId);
    
    // Recarregar les llistes
    await loadMyGames();
    await loadAvailableGames();
    
    error.value = "";
  } catch (err) {
    error.value = "Error al eliminar les partides";
    console.error(err);
  } finally {
    loading.value = false;
  }
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
              <div class="mb-4 d-flex gap-2 flex-wrap">
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
                <button 
                  class="btn btn-info" 
                  @click="toggleMyGames"
                  :disabled="loading"
                >
                  {{ showMyGames ? 'Ocultar' : 'Veure' }} Les meves partides:
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
              <div v-if="!loading">
                <div v-if="availableGames.length > 0">
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
                          <div class="mt-2 d-flex gap-2">
                            <button 
                              class="btn btn-success flex-grow-1"
                              @click="joinGame(game.id)"
                              :disabled="loading"
                            >
                              UNIR-SE                        
                            </button>
                            
                            <!-- Botó d'eliminació només si el jugador és el propietari -->
                            <button 
                              v-if="game.owner === authStore.nickname"
                              class="btn btn-danger btn-sm"
                              @click="deleteGame(game.id)"
                              :disabled="loading"
                              title="Eliminar la meva partida"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No hay partidas disponibles -->
                <div v-else class="text-center py-5">
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

              <!-- Sección de mis partidas -->
              <div v-if="showMyGames" class="mt-4">
                <h4 class="mb-3">Les meves partides:</h4>
                <div v-if="myGames.length > 0" class="row">
                  <div 
                    v-for="game in myGames" 
                    :key="'my-' + game.id"
                    class="col-md-6 mb-3"
                  >
                    <div class="card border-warning">
                      <div class="card-body">
                        <h5 class="card-title">
                          Partida #{{ game.id }}
                        </h5>
                        <div class="card-text">
                          <small class="text-muted">
                            <strong>Jugadors:</strong> {{ game.players ? game.players.length : 0 }}/2
                          </small>
                          <br>
                          <small class="text-muted">
                            <strong>Estat:</strong> {{ game.phase }}
                          </small>
                          <br>
                          <small class="text-muted">
                            <strong>Guanyador:</strong> {{ game.winner || 'En curso' }}
                          </small>
                          <div v-if="game.players && game.players.length > 0" class="mt-2">
                            <small class="text-info">
                              <strong>Jugadors:</strong> 
                              {{ game.players.map(p => p.nickname).join(', ') }}
                            </small>
                          </div>
                        </div>
                        <div class="mt-2 d-flex gap-2">
                          <button 
                            v-if="game.phase !== 'gameOver'"
                            class="btn btn-primary flex-grow-1"
                            @click="joinGame(game.id)"
                            :disabled="loading"
                          >
                            Continuar Partida
                          </button>
                          <div v-else class="flex-grow-1 text-center">
                            <span class="badge bg-secondary">Partida acabada</span>
                          </div>
                          
                          <button 
                            class="btn btn-danger btn-sm"
                            @click="deleteGame(game.id)"
                            :disabled="loading"
                            title="Eliminar partida"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-3">
                  <p class="text-muted">No tens partides creades</p>
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
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.card.border-warning {
  border: 2px solid #d21bc0 !important;
}

.card.border-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.btn-success {
  background: linear-gradient(135deg, #d21bc0 0%, #b037e1 100%);
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #d21bc0 0%, #b037e1 100%);
  transform: translateY(-1px);
}


.btn-danger {
  background: linear-gradient(135deg, #e74c3c 0%, #d21bc0 100%);
  border: none;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #c0392b 0%, #b037e1 100%);
}

.btn-info {
  background: linear-gradient(135deg, #3498db 0%, #9b59b6 100%);
  border: none;
}

.btn-info:hover {
  background: linear-gradient(135deg, #2980b9 0%, #8e44ad 100%);
}

.d-flex.gap-2 {
  gap: 0.5rem !important;
}

.flex-grow-1 {
  flex-grow: 1 !important;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}

.btn-danger.btn-sm:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style> 