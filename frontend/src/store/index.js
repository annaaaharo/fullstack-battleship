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
          const gameState = game.game_state_response?.data?.gameState || {};
          console.log("=== GET GAME STATE DEBUG ===");
          console.log("Full response:", response.data);
          console.log("GAME STATE:", gameState);
          console.log("Backend phase:", game.phase);
          console.log("Backend turn:", game.turn);
          console.log("Backend winner:", game.winner);

          // Set game state properties
          const oldPhase = this.gamePhase;
          this.gamePhase = game.phase;
          this.turn = game.turn;
          
          console.log(`Phase changed from ${oldPhase} to ${this.gamePhase}`);

          // Handle player1 data
          if (gameState.player1) {
            this.playerBoard = gameState.player1.board || this.createEmptyBoard();
            this.playerPlacedShips = gameState.player1.placedShips || [];
            this.availableShips = gameState.player1.availableShips || this.availableShips;
          } else {
            console.warn("No player1 data received, initializing defaults...");
            this.playerBoard = this.createEmptyBoard();
            this.playerPlacedShips = [];
            // No sobreescrivim availableShips si ja estan carregats
          }

          // Handle player2 data
          if (gameState.player2) {
            this.opponentBoard = gameState.player2.board || this.createEmptyBoard();
            this.opponentShips = gameState.player2.placedShips || [];
          } else {
            // En un joc d'un sol jugador, preservem el taulell de l'oponent local
            console.log("No player2 data - preserving local opponent board for single player game");
            // No sobreescriure opponentBoard si ja està col·locat localment
            if (!this.opponentBoard || this.opponentBoard.every(row => row.every(cell => cell === 0))) {
              this.opponentBoard = this.createEmptyBoard();
            } else {
              console.log("🛡️ Preservant taulell de l'oponent amb barcos:");
              console.log("Barcos detectats:", this.opponentBoard.flat().filter(cell => cell > 0 && cell < 10).length);
            }
            // Preservar també opponentShips locals
            // No canviem this.opponentShips si ja hi ha barcos col·locats
          }

          if (this.gamePhase === "playing") {
            const authStore = useAuthStore();
            this.gameStatus =
              game.turn === authStore.username ? "Your turn" : "Opponent's turn";
            this.availableShips = [];
            console.log("🎮 GAME IS NOW IN PLAYING PHASE!");
            console.log("Game Status set to:", this.gameStatus);
          } else if (this.gamePhase === "placement") {
            this.gameStatus = "Place your ships";
            console.log("🚢 Still in placement phase");
          } else if (this.gamePhase === "gameOver") {
            this.gameStatus = "Game Over - Winner: " + (game.winner || "Unknown");
          }
          console.log("Final PHASE:", this.gamePhase);
          console.log("=== END GET GAME STATE DEBUG ===");
        })
        .catch((error) => {
          const message = error.response?.data?.detail || error.message;
          console.error("Error in getGameState:", error);
          throw new Error(message);
        });
    },

    createEmptyBoard() {
      return Array(10)
        .fill()
        .map(() => Array(10).fill(0));
    },

    async startNewGame() {
      console.log("🎮 Starting new game...");
      
      // Limpiar completamente el estado anterior
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
        console.log("🎮 Creating game for player:", authStore.playerId);
        
        const gameResponse = await api.setGame(authStore.playerId);
        this.gameId = gameResponse.id;
        console.log("🎮 New game created with ID:", this.gameId);

        // Crear tablero del jugador
        const playerBoard = await api.getOrCreateBoard(this.gameId, authStore.playerId);
        this.playerBoardId = playerBoard.id;
        console.log("🎮 Player board created with ID:", this.playerBoardId);
        console.log(`🎮 Game ID is: ${this.gameId}, Player Board ID is: ${this.playerBoardId}`);

        const ships = await api.getAvailableShips();
        this.availableShips = ships;
        console.log("🎮 Available ships fetched:", this.availableShips);

        // Colocar barcos del oponente solo en el frontend (para el juego local)
        console.log("🤖 Placing opponent ships locally...");
        await this.placeOpponentShipsLocally();
        console.log("🤖 Opponent ships placed locally");

        console.log(`🎮 Final game setup - Game ID: ${this.gameId}, Available ships: ${this.availableShips.length}`);
        
        await this.getGameState(this.gameId);
        console.log("🎮 Game state loaded, phase:", this.gamePhase);
      } catch (error) {
        console.error("Error starting new game:", error);
        this.availableShips = [];
      }
    },
    async obtainId() {
      const idPlayer = useAuthStore().playerId;
      try {
        const response = await api.setGame(idPlayer);
        console.log('Resposta de setGame:', response); // Log complet de la resposta
        const id = response.id || response.data?.id;
        if (!id) {
          throw new Error('No s\'ha obtingut un ID de joc vàlid');
        }
        console.log("👉 Game ID obtingut:", id);
        this.gameId = id;
        return id;
      } catch (error) {
        console.error('Error obtenint ID del joc:', error);
        throw error;
      }
    },


    async placeShip(board, row, col, size, isVertical, type, boardId) {
      if (this.gamePhase !== "placement") {
        console.warn("Cannot place ships, game is not in placement phase!");
        return false;
      }

      if (!this.isValidPlacement(board, row, col, size, isVertical)) {
        console.warn("Invalid ship placement!");
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
        console.log("Vaixell enviat al backend:", vesselData);
        return true;
      } catch (error) {
        console.error("Error enviant vaixell al backend:", error);
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

    placeOpponentShips() {
      const shipList = [1, 2, 3, 4, 5];
      console.log("Vaixells disponibles per col·locar:", this.availableShips);
      for (let type of shipList) {
        const ship = this.availableShips.find((s) => s.type === type);
        if (!ship) {
          console.warn(`No s'ha trobat el vaixell de tipus ${type}`);
          continue; // o return, depenent de si vols aturar el procés
        }
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
            console.log(`Placed ship type ${type} at row ${row}, col ${col}, vertical: ${isVertical}`);
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
      if (!this.isValidPlacement(this.playerBoard, row, col, ship.size, ship.isVertical)) {
        console.warn("Invalid ship placement!");
        return;
      }

      // Verificar que no se dupliquen barcos - verificación más estricta
      const existingShip = this.playerPlacedShips.find(s => s.type === ship.type);
      if (existingShip) {
        console.warn(`Ship type ${ship.type} already placed!`);
        return;
      }

      // Verificar que no se exceda el límite de 5 barcos
      if (this.playerPlacedShips.length >= 5) {
        console.warn("Ya se han colocado todos los barcos (5)!");
        return;
      }

      // Obtenir o crear el board del jugador
      if (!this.playerBoardId) {
        const authStore = useAuthStore();
        const board = await api.getOrCreateBoard(this.gameId, authStore.playerId);
        this.playerBoardId = board.id;
      }

      console.log(`🚢 Placing ship type ${ship.type} on game ${this.gameId}, board ${this.playerBoardId}`);
      console.log(`🚢 Current placed ships: ${this.playerPlacedShips.length}/5`);

      // Col·loca el vaixell utilizando placeShip
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
        console.log("Vaixells disponibles restants:", this.availableShips);
        console.log(`🚢 Ships placed: ${this.playerPlacedShips.length}/5`);

        if (this.availableShips.length === 0 && this.playerPlacedShips.length === 5) {
          console.log("Tots els vaixells col·locats, actualitzant estat...");
          console.log("Fase actual abans del polling:", this.gamePhase);
          console.log(`🎯 Starting polling for game ID: ${this.gameId}`);
          console.log(`📊 Ships placed: ${this.playerPlacedShips.length}`);
          console.log(`📊 Placed ship types:`, this.playerPlacedShips.map(s => s.type));
          
          // Per un joc d'un sol jugador contra bot local, forçar el canvi de fase
          try {
            const authStore = useAuthStore();
            await api.setGameState("playing", authStore.username, this.gameId);
            console.log("✅ Fase canviada a playing al backend");
            
            // Actualitzar l'estat local immediatament
            this.gamePhase = "playing";
            this.gameStatus = "Your turn";
            console.log("✅ Estat local actualitzat a playing");
          } catch (error) {
            console.error("❌ Error canviant fase al backend:", error);
            
            // Canviar igualment l'estat local per permetre el joc
            console.log("🔄 Canviant estat local igualment...");
            this.gamePhase = "playing";
            this.gameStatus = "Your turn";
            console.log("✅ Estat local forçat a playing");
          }
        }
      }
    },

    async handleOpponentBoardClick(row, col) {
      if (this.gamePhase !== "playing") return;
      
      console.log(`🎯 Shooting at position [${row}, ${col}]`);
      console.log(`🎯 Cell value:`, this.opponentBoard[row][col]);
      console.log(`🎯 Total ships on opponent board:`, this.opponentBoard.flat().filter(cell => cell > 0 && cell < 10).length);
      
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

    // index.js
    async placeOpponentShipsInBackend() {
      const shipList = [1, 2, 3, 4, 5];
      console.log("Vaixells disponibles per col·locar:", this.availableShips);
      if (!this.availableShips.length) {
        console.error("No ships available to place for opponent!");
        return;
      }

      for (let type of shipList) {
        const ship = this.availableShips.find((s) => s.type === type);
        if (!ship) {
          console.warn(`No s'ha trobat el vaixell de tipus ${type}`);
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
            // Update frontend board manually (sin llamar a placeShip)
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

            // Send to backend
            try {
              const vesselData = {
                board: this.opponentBoardId,
                vessel: ship.type,
                ri: row,
                ci: isVertical ? col : col - ship.size + 1,
                rf: isVertical ? row + ship.size - 1 : row,
                cf: col,
                alive: true
              };
              await api.placeShip(vesselData);
              console.log(`Opponent ship type ${type} placed in backend:`, vesselData);
              placed = true;
            } catch (error) {
              console.error(`Error placing opponent ship type ${type}:`, error);
              // Si falla el backend, revertir el frontend
              for (let i = 0; i < ship.size; i++) {
                const r = isVertical ? row + i : row;
                const c = isVertical ? col : col - i;
                this.opponentBoard[r][c] = 0;
              }
              this.opponentShips.pop();
            }
          }
          attempts++;
        }
        if (!placed) {
          console.error(`Failed to place opponent ship type ${type} after ${attempts} attempts`);
        }
      }
    },

    async placeOpponentShipsLocally() {
      const shipList = [1, 2, 3, 4, 5];
      console.log("Vaixells disponibles per col·locar:", this.availableShips);
      for (let type of shipList) {
        const ship = this.availableShips.find((s) => s.type === type);
        if (!ship) {
          console.warn(`No s'ha trobat el vaixell de tipus ${type}`);
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
            console.log(`Placed opponent ship type ${type} (size ${ship.size}) at row ${row}, col ${col}, vertical: ${isVertical}`);
            console.log(`🎯 Occupied positions: ${occupiedPositions.join(', ')}`);
          }
          attempts++;
        }
        if (!placed) {
          console.error(`Failed to place opponent ship type ${type} after ${attempts} attempts`);
        }
      }
      
      // Log de l'estat final del taulell
      console.log("🗺️ Estat final del taulell de l'oponent:");
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
