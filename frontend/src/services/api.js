import AuthService from "@/services/auth.js";
import axios from "axios";
const axiosInstance = AuthService.getAxiosInstance();


export default {

  getAvailableShips() {
    return axiosInstance.get("/api/v1/vessels/")
      .then(response => {
        console.log("Backend vessels response:", response.data);
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
        console.error("Error obtenint vaixells:", error.response ? error.response.data : error);
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

  async setGame(playerId) {
    try {
      const response = await axios.post('/api/v1/games/', { player: playerId });
      return response.data; // Assegura't que això retorna { id: <game_id>, ... }
    } catch (error) {
      console.error('Error creant joc:', error);
      throw error;
    }
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
          console.log("Tauler existent trobat:", response.data[0]);
          return response.data[0];
        } else {
          return axiosInstance.post('/api/v1/boards/', { game: gameId, player: playerId })
            .then(response => {
              console.log("Tauler creat:", response.data);
              return response.data;
            });
        }
      })
      .catch(error => {
        console.error('Error obtenint o creant tauler:', error);
        throw error;
      });
  },

  // Obtenir board d'un jugador
  getBoard(gameId, playerId) {
    return axiosInstance.get(`/api/v1/boards/?game=${gameId}&player=${playerId}`);
  },

  // Obtenir tots els boards d'una partida
  getGameBoards(gameId) {
    return axiosInstance.get(`/api/v1/boards/?game=${gameId}`);
  },

  createGame(){
    return axios.post("/api/v1/games/", {
      "width": 10,
      "height": 10,
    });
  },

  // Col·locar vaixell (corregir endpoint)
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

  // Crear un jugador bot automáticamente
  async createBotPlayer() {
    try {
      // Crear un usuario bot
      const botUsername = `bot_${Date.now()}`;
      const botUser = await axiosInstance.post('/api/v1/users/', {
        username: botUsername,
        email: `${botUsername}@bot.com`,
        password: 'botpassword123'
      });
      
      // Crear un jugador bot
      const botPlayer = await axiosInstance.post('/api/v1/players/', {
        user: botUser.data.id,
        nickname: `Bot_${Date.now()}`
      });
      
      return botPlayer.data;
    } catch (error) {
      console.error('Error creating bot player:', error);
      throw error;
    }
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
