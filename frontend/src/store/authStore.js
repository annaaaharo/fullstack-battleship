import { defineStore } from "pinia";
import AuthService from "../services/auth";
import api from "@/services/api.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    username: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
      playersList: [],
    playerId: null,
  }),
  actions: {
      async getAllPlayers() {
      try {
        const response = await AuthService.getAllPlayers();
        for (const player of response.data) {
          this.playersList.push({
            id: player.id,
            nickname: player.nickname,
          });
        }
      } catch (error) {
        const message = error.response?.data?.detail || error.message;
        throw new Error(message);
      }
    },
    initializeAuthStore() {
      this.username = localStorage.getItem("username");
      this.accessToken = localStorage.getItem("access");
      this.refreshToken = localStorage.getItem("refresh");
      this.isAuthenticated = !!this.accessToken;
      this.playerId = localStorage.getItem("playerId");
    },
    login(user) {
        this.loading = true;
        this.error = null;

        return AuthService.login(user)
        .then(async (response) => {
            console.log("response", response);
            // response = JSON.parse(response); // això era una simulació, en el cas real és una resposta d'axios i podem comentar aquesta línia
            this.username = user.username;
            this.accessToken = response.data.access;
            this.refreshToken = response.data.refresh;
            this.isAuthenticated = true;

            localStorage.setItem("username", this.username);
            localStorage.setItem("access", this.accessToken);
            localStorage.setItem("refresh", this.refreshToken);

            const playResponse = await api.findPlayer(user.username);
            this.playerId = playResponse[0].id;
            localStorage.setItem("playerId", this.playerId);
        })
        .catch((error) => {
            console.log("error", error);
            this.error =
            error.response?.data?.detail || "Error d'inici de sessió. Torna-ho a intentar.";
            this.isAuthenticated = false;
        })
        .finally(() => {
            this.loading = false;
        });
    },

      register(user) {
          this.loading = true;
          this.error = null;

          return AuthService.register(user)
              .then(() => {

                  return this.login(user);
              })
              .catch((error) => {
                  this.error =
                      error.response?.data?.username?.[0] ||
                      error.response?.data?.email?.[0] ||
                      "Error durant el registre.";
                  throw error; // permet mostrar l'error des del component
              })
              .finally(() => {
                  this.loading = false;
              });
      },


    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.playerId = null;
      localStorage.removeItem("username");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("playerId");
    },
  },
});
