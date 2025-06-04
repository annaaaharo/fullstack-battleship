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
    playerBoardId: null,
    opponentBoardId: null,
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

    async getGameState(gameId) {
      return api
        .getGameState(gameId)
        .then((response) => {
          const game = response.data;
          const gameState = game.game_state_response?.data?.gameState || {};

          const oldPhase = this.gamePhase;
          this.gamePhase = game.phase;
          this.turn = game.turn;
          

          if (gameState.player1) {
            this.playerBoard = gameState.player1.board || this.createEmptyBoard();
            this.playerPlacedShips = gameState.player1.placedShips || [];
            this.availableShips = gameState.player1.availableShips || this.availableShips;
          } else {
            this.playerBoard = this.createEmptyBoard();
            this.playerPlacedShips = [];
          }

          if (gameState.player2) {
            this.opponentBoard = gameState.player2.board || this.createEmptyBoard();
            this.opponentShips = gameState.player2.placedShips || [];
          } else {
            if (!this.opponentBoard || this.opponentBoard.every(row => row.every(cell => cell === 0))) {
              this.opponentBoard = this.createEmptyBoard();
            } else {
            }
          }

          if (this.gamePhase === "playing") {
            const authStore = useAuthStore();
            this.gameStatus =
              game.turn === authStore.username ? "Your turn" : "Opponent's turn";
            this.availableShips = [];

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
      this.gameId = null;
      this.playerBoardId = null;
      this.opponentBoardId = null;
      this.availableShips = [];

      try {
        const authStore = useAuthStore();

        const gameResponse = await api.setGame(authStore.playerId);
        this.gameId = gameResponse.id;
        this.playerBoardId = gameResponse.board_id;

        const ships = await api.getAvailableShips();
        this.availableShips = ships;

        await this.placeOpponentShipsLocally();


        await this.getGameState(this.gameId);
      } catch (error) {
        this.availableShips = [];
      }
    },


    async placeShip(board, row, col, size, isVertical, type, boardId) {
      if (this.gamePhase !== "placement") {
        return false;
      }

      if (!this.isValidPlacement(board, row, col, size, isVertical)) {
        return false;
      }

      // Col·loca el vaixell al tauler
      for (let i = 0; i < size; i++) {
        const r = isVertical ? row + i : row;
        const c = isVertical ? col : col - i;
        board[r][c] = type;
      }

      // Envia el vaixell al backend
      try {
        const vesselData = {
          board: boardId,
          vessel: type,
          ri: row,
          ci: isVertical ? col : col - size + 1,
          rf: isVertical ? row + size - 1 : row,
          cf: col,
          alive: true,
        };
        await api.placeShip(vesselData);
        return true;
      } catch (error) {
        return false;
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
      if (!this.isValidPlacement(this.playerBoard, row, col, ship.size, ship.isVertical)) {
        return;
      }

      // Verificar que no se dupliquen barcos - verificación más estricta
      const existingShip = this.playerPlacedShips.find(s => s.type === ship.type);
      if (existingShip) {
        return;
      }

      // Verificar que no se exceda el límite de 5 barcos
      if (this.playerPlacedShips.length >= 5) {
        return;
      }

      // Obtenir o crear el board del jugador
      if (!this.playerBoardId) {
        const authStore = useAuthStore();
        const board = await api.getOrCreateBoard(this.gameId, authStore.playerId);
        this.playerBoardId = board.id;
      }


      const success = await this.placeShip(
        this.playerBoard,
        row,
        col,
        ship.size,
        ship.isVertical,
        ship.type,
        this.playerBoardId
      );

      if (success) {
        this.playerPlacedShips.push({ ...ship, position: { row, col } });
        this.availableShips = this.availableShips.filter((s) => s.type !== ship.type);
        this.selectedShip = null;


        if (this.availableShips.length === 0 && this.playerPlacedShips.length === 5) {
          try {
            const authStore = useAuthStore();
            await api.setGameState("playing", authStore.username, this.gameId);

            // Actualitzar l'estat local immediatament
            this.gamePhase = "playing";
            this.gameStatus = "Your turn";
          } catch (error) {

            // Canviar igualment l'estat local per permetre el joc
            this.gamePhase = "playing";
            this.gameStatus = "Your turn";
          }
        }
      }
    },

    async handleOpponentBoardClick(row, col) {
      if (this.gamePhase === "gameOver") {
        return;
      }
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
      } catch (error) {
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


    async placeOpponentShipsLocally() {
      const shipList = [1, 2, 3, 4, 5];
      for (let type of shipList) {
        const ship = this.availableShips.find((s) => s.type === type);
        if (!ship) {
          continue;
        }
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
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
            // Update frontend board manually (solo local)
            for (let i = 0; i < ship.size; i++) {
              const r = isVertical ? row + i : row;
              const c = isVertical ? col : col - i;
              this.opponentBoard[r][c] = ship.type;
            }
            
            this.opponentShips.push({
              ...ship,
              isVertical,
              position: { row, col },
            });
            placed = true;
            
            // Log detallat de les posicions ocupades
            const occupiedPositions = [];
            for (let i = 0; i < ship.size; i++) {
              const r = isVertical ? row + i : row;
              const c = isVertical ? col : col - i;
              occupiedPositions.push(`[${r},${c}]`);
            }

          }
          attempts++;
        }
        if (!placed) {
          console.error(`Failed to place opponent ship type ${type} after ${attempts} attempts`);
        }
      }
      
      // Log de l'estat final del taulell
      console.log("Estat final del taulell de l'oponent:");
      for (let r = 0; r < 10; r++) {
        let rowStr = `Row ${r}: `;
        for (let c = 0; c < 10; c++) {
          rowStr += this.opponentBoard[r][c].toString().padStart(2, ' ') + ' ';
        }
        console.log(rowStr);
      }
    },
  },
});
