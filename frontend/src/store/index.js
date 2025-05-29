import { defineStore } from "pinia";
import api from "../services/api";
import {useAuthStore} from "@/store/authStore.js";

export const useGameStore = defineStore("game", {
  state: () => ({
    gamePhase: "placement",
    gameStatus: "Place your ships",
    playerBoard: [],
    opponentBoard: [],
    playerPlacedShips: [],
    opponentShips: [],
    availableShips: [],
    selectedShip: null,
    contadorHitsPlayer: 0,
    contadorHitsBot: 0,
    gameId: null,
    playerBoardId: null, // ID del board del jugador al backend
    opponentBoardId: null, // ID del board de l'oponent al backend
  }),

  actions: {
    getUser(id) {
      return api
        .getUser(id)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          const message = error.response?.data?.detail || error.message;
          throw new Error(message);
        });
    },

    /*
    async getGameState(gameId) {
      return api
        .getGameState(gameId)
        .then((response) => {
          response = JSON.parse(response); // this is a mock, in real case it will be axios response
          console.log("response", response);
          const gameState = response.data.gameState;
          this.playerBoard = gameState.player1.board;
          this.opponentBoard = gameState.player2.board;
          this.playerPlacedShips = gameState.player1.placedShips;
          this.opponentShips = gameState.player2.placedShips;
          this.availableShips = gameState.player1.availableShips;
          this.gamePhase = gameState.phase;
          this.gameStatus =
             gameState.turn === "player1" ? "Your turn" : "Opponent's turn";
          if (this.gamePhase === "playing") {
            this.gameStatus =
              gameState.turn === "player1" ? "Your turn" : "Opponent's turn";
          } else if (this.gamePhase === "placement") {
            this.gameStatus = "Place your ships";
          } else if (this.gamePhase === "gameOver") {
            this.gameStatus = "Game Over - Winner " + gameState.winner;
          }
        })
        .catch((error) => {
          const message = error.response?.data?.detail || error.message;
          throw new Error(message);
        });
    },

    */
    async getGameState(gameId) {
      return api
        .getGameState(gameId)
        .then((response) => {
          const game = response.data;
          this.gamePhase = game.phase;
          this.turn = game.turn;
          const gameState = game.game_state_response?.data?.gameState;
           /*this.playerBoard = gameState.player1.board;
           this.opponentBoard = gameState.player2.board;
           this.playerPlacedShips = gameState.player1.placedShips;
           this.opponentShips = gameState.player2.placedShips;
           this.availableShips = gameState.player1.availableShips;
           this.gamePhase = gameState.phase;*/

            if (this.gamePhase === "playing") {
              this.gameStatus =
                game.turn === "player1" ? "Your turn" : "Opponent's turn";
            } else if (this.gamePhase === "placement") {
              this.gameStatus = "Place your ships";
            } else if (this.gamePhase === "gameOver") {
              this.gameStatus = "Game Over - Winner: " + (game.winner || "Unknown");
            }
        })
        .catch((error) => {
          const message = error.response?.data?.detail || error.message;
          throw new Error(message);
        });
    },

    createEmptyBoard() {
      return Array(10)
        .fill()
        .map(() => Array(10).fill(0));
    },

    async startNewGame() {
      this.gamePhase = "placement";
      this.gameStatus = "Place your ships";
      this.playerBoard = this.createEmptyBoard();
      this.opponentBoard = this.createEmptyBoard();
      this.playerPlacedShips = [];
      this.opponentShips = [];
      this.selectedShip = null;
      this.availableShips = await api.getAvailableShips(); // TODO check with axios on how to avoid await.

      this.placeOpponentShips();

    },
    async obtainId(){
      const idPlayer = useAuthStore().playerId;
      const id = await api.setGame(idPlayer);
      this.gameId = id;
      return id;
    },

    placeShip(board, row, col, size, isVertical, type) {
      for (let i = 0; i < size; i++) {
        const r = isVertical ? row + i : row;
        const c = isVertical ? col : col - i;
        board[r][c] = type;
      }
    },

    isValidPlacement(board, row, col, size, isVertical) {
      const inBounds = isVertical ? row + size <= 10 : col + 1 - size >= 0;
      if (!inBounds) return false;

      for (let i = 0; i < size; i++) {
        const r = isVertical ? row + i : row;
        const c = isVertical ? col : col - i;
        if (board[r][c] !== 0) return false;
      }
      return true;
    },

    placeOpponentShips() {
      const shipList = [1, 2, 3, 4, 5];
      for (let type of shipList) {
        const ship = this.availableShips.find((s) => s.type === type);
        let placed = false;
        while (!placed) {
          const row = Math.floor(Math.random() * 10);
          const col = Math.floor(Math.random() * 10);
          const isVertical = Math.random() > 0.5;
          if (
            this.isValidPlacement(
              this.opponentBoard,
              row,
              col,
              ship.size,
              isVertical
            )
          ) {
            this.placeShip(
              this.opponentBoard,
              row,
              col,
              ship.size,
              isVertical,
              ship.type
            );
            this.opponentShips.push({
              ...ship,
              isVertical,
              position: { row, col },
            });
            placed = true;
          }
        }
      }
    },

    selectShip(ship) {
      this.selectedShip = { ...ship };
    },

    rotateSelectedShip() {
      if (this.selectedShip) {
        this.selectedShip.isVertical = !this.selectedShip.isVertical;
      }
    },

    async handlePlayerBoardClick(row, col) {
      if (this.gamePhase !== "placement" || !this.selectedShip) return;

      const ship = this.selectedShip;
      if (
          !this.isValidPlacement(
              this.playerBoard,
              row,
              col,
              ship.size,
              ship.isVertical
          )
      )
        return;

      this.placeShip(
          this.playerBoard,
          row,
          col,
          ship.size,
          ship.isVertical,
          ship.type
      );

      this.playerPlacedShips.push({...ship, position: {row, col}});

      // Si no tenim gameId, vol dir que hem entrat directament al joc
      // En aquest cas, creem una nova partida
      if (!this.gameId) {
        const authStore = useAuthStore();
        this.gameId = await api.setGame(authStore.playerId);
      }

      // Obtenir o crear el board del jugador
      if (!this.playerBoardId) {
        const authStore = useAuthStore();
        const board = await api.getOrCreateBoard(this.gameId, authStore.playerId);
        this.playerBoardId = board.id;
      }

      // Enviar el vaixell al backend
      try {
        const authStore = useAuthStore();
        const vesselData = {
          board: this.playerBoardId,
          vessel: ship.type, // L'ID del vessel al backend
          ri: row,
          ci: ship.isVertical ? col : col - ship.size + 1,
          rf: ship.isVertical ? row + ship.size - 1 : row,
          cf: col,
          alive: true
        };
        
        await api.placeShip(vesselData);
        console.log('Vaixell enviat al backend:', vesselData);
      } catch (error) {
        console.error('Error enviant vaixell al backend:', error);
      }

      this.availableShips = this.availableShips.filter(
          (s) => s.type !== ship.type
      );
      this.selectedShip = null;

      if (this.availableShips.length === 0) {
        // El backend canviarà automàticament la fase quan detecti que tots els vaixells estan col·locats
        await this.getGameState(this.gameId);
        console.log("PHASE: " + this.gamePhase);
      }
    },

    async handleOpponentBoardClick(row, col) {
      if (this.gamePhase !== "playing") return;
      if (this.opponentBoard[row][col] < 0) {
        this.gameStatus = "Already hit!";
        return;
      } else if (this.opponentBoard[row][col] === 11) {
        this.gameStatus = "Already missed!";
        return;
      }

      // Obtenir el board de l'oponent si no el tenim
      if (!this.opponentBoardId) {
        try {
          const authStore = useAuthStore();
          const boardsResponse = await api.getGameBoards(this.gameId);
          const boards = boardsResponse.data.results || boardsResponse.data;
          
          // Trobar el board que no és del jugador actual
          const opponentBoard = boards.find(board => board.player !== authStore.playerId);
          if (opponentBoard) {
            this.opponentBoardId = opponentBoard.id;
          }
        } catch (error) {
          console.error('Error obtenint board de l\'oponent:', error);
        }
      }

      // const isHit = api.checkHit(row, col);
      var isHit = false;
      if (
          this.opponentBoard[row][col] > 0 &&
          this.opponentBoard[row][col] < 10
      ) {
        isHit = true;
        this.contadorHitsPlayer++;
      }

      this.opponentBoard[row][col] = isHit ? -this.opponentBoard[row][col] : 11;

      // Enviar el tir al backend
      try {
        const authStore = useAuthStore();
        const shotData = {
          game: this.gameId,
          player: authStore.playerId,
          board: this.opponentBoardId, // Board de l'oponent on estem tirant
          row: row,
          col: col,
          result: isHit ? 1 : 0 // 0=Water, 1=Hit, 2=Sunk
        };
        
        await api.fireShot(shotData);
        console.log('Tir enviat al backend:', shotData);
      } catch (error) {
        console.error('Error enviant tir al backend:', error);
      }
      
      // verifiquem winner abans que el bot jugui
      if (this.contadorHitsPlayer === 15) {
        if (this.gameId) {
          api.setWinner("gameOver", "player1", this.gameId)
            .then(() => {
              this.gamePhase = "gameOver";
              this.gameStatus = "Game Over - You Won!";
            });
        }
        return;
      }

      //si es hit, el jugador pot tirar de nou
      if (isHit) {
        this.gameStatus = "Hit! Shoot again!";
        return; // No pasar turno, el jugador puede seguir tirando
      }
      
      // Solo si es miss, pasar el turno al oponente
      this.gameStatus = "Miss!";
      setTimeout(this.opponentTurn, 1000);
    },

    async opponentTurn() {

      if (this.gamePhase === "gameOver") return;
      
      let row,
        col,
        valid = false;
      while (!valid) {
        row = Math.floor(Math.random() * 10);
        col = Math.floor(Math.random() * 10);
        valid =
          this.playerBoard[row][col] >= 0 && this.playerBoard[row][col] < 10;
      }

      const isHit =
        this.playerBoard[row][col] > 0 && this.playerBoard[row][col] < 10;
      if(isHit){
        this.contadorHitsBot++;
      }
      this.playerBoard[row][col] = isHit ? -this.playerBoard[row][col] : 11;

      if(this.contadorHitsBot === 15){
        if (this.gameId) {
          api.setWinner("gameOver","player2", this.gameId)
            .then(() => {
              this.gamePhase = "gameOver";
              this.gameStatus = "Game Over - You Lost!";
            });
        }
        return;
      }
      
      // Si el bot fa hit, pot tornar a tirar
      if (isHit) {
        this.gameStatus = "Bot hit! Bot shoots again...";
        // El bot tira de nuevo después de un breve delay
        setTimeout(this.opponentTurn, 1500);
        return;
      }
      
      //si falla, ens toca
      this.gameStatus = "Your turn";
    },
  },
});
