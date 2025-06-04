import AuthService from "@/services/auth.js";
import axios from "axios";
const axiosInstance = AuthService.getAxiosInstance();


export default {

  getAvailableShips() {
    return axiosInstance.get("/api/v1/vessels/")
      .then(response => {
        if (!response.data || response.data.length === 0) {
          console.warn("No vessels received from backend!");
        }
        return response.data.map(vessel => ({
          type: vessel.id,
          isVertical: true,
          size: vessel.size,
          name: vessel.name
        }));
      })
      .catch(error => {
        throw error;
      });
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
    return AuthService.getAxiosInstance().get("/api/v1/players/");
  },


  setGame(playerId) {
    return axios.post('/api/v1/games/', { player: playerId })
                .then(res => res.data); // ✅ Això conserva el `board_id`
  },

  setGameState(phase1, turn, id){
    return axiosInstance.post(`/api/v1/games/${id}/update_phase/`, {"phase": phase1, "turn": turn, "id": id});
  },
  setWinner(phase1, winner, id){
    return axiosInstance.post(`/api/v1/games/${id}/update_winner/`, {"phase": phase1, "winner": winner, "id": id});
  },

  // Obtenir o crear el board d'un jugador per a una partida
  getOrCreateBoard(gameId, playerId) {
    return axiosInstance.get(`/api/v1/boards/?game=${gameId}&player=${playerId}`)
      .then(response => {
        if (response.data.length > 0) {
          return response.data[0];
        } else {
          return axiosInstance.post('/api/v1/boards/', { game: gameId, player: playerId })
            .then(response => {
              return response.data;
            });
        }
      })
      .catch(error => {
        throw error;
      });
  },


  // Obtenir tots els boards d'una partida
  getGameBoards(gameId) {
    return axiosInstance.get(`/api/v1/boards/?game=${gameId}`);
  },


  // Col·locar vaixell
  placeShip(data) {
    return axiosInstance.post(`/api/v1/boardvessels/`, data);
  },

  // Disparar tir
  fireShot(data) {
    return axiosInstance.post(`/api/v1/shots/`, data);
    },

  // Obtener partidas que están esperando jugadores
  getAvailableGames() {
    return axiosInstance.get(`/api/v1/games/?phase=waiting`);
  },

  // Unirse a una partida existente
  joinGame(gameId, playerId) {
    return axiosInstance.post(`/api/v1/games/${gameId}/join/`, { player: playerId });
  },

  //eliminar una partida específica
  deleteGame(gameId, playerId) {
    return axiosInstance.delete(`/api/v1/games/${gameId}/delete_game/?player_id=${playerId}`);
  },

  //eliminar totes les partides del jugador
  clearMyGames(playerId) {
    return axiosInstance.post(`/api/v1/games/clear_all_games/`, { player_id: playerId });
  },

  //obtenim les partides del jugador
  getMyGames(playerId) {
    return axiosInstance.get(`/api/v1/games/my_games/?player_id=${playerId}`);
  },

};
