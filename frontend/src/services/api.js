import AuthService from "@/services/auth.js";
const axiosInstance = AuthService.getAxiosInstance();


export default {
  getAvailableShips() {
    return Promise.resolve([
      {
        type: 1,
        isVertical: true,
        size: 1,
      },
      {
        type: 2,
        isVertical: true,
        size: 2,
      },
      {
        type: 3,
        isVertical: true,
        size: 3,
      },
      {
        type: 4,
        isVertical: true,
        size: 4,
      },
      {
        type: 5,
        isVertical: true,
        size: 5,
      },
    ]);
  },

  getGameState(gameId) {
    return axiosInstance.get(`/api/v1/games/${gameId}`);
   },

  getUser(id) {
    return axiosInstance.get(`/api/v1/user/${id}`);
  },

  findPlayer(username) {
  return axiosInstance.get(`/api/v1/players/?search=${username}`)
    .then(response => response.data);
  },
  getAllPlayers() {
    return axiosInstance.get("/api/v1/players/");
  },

  setGame(playerId) {
  // Exemple: crea una nova partida per un jugador
    return axiosInstance.post("/api/v1/games/", { player: playerId })
      .then(response => response.data.id);  // Retorna l’ID del joc creat
  },



};
