import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import GameLobby from "../views/GameLobby.vue";
import Game from "../views/Game.vue";

import { useAuthStore } from "../store/authStore";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/lobby",
    name: "GameLobby",
    component: GameLobby,
    meta: { requiresAuth: true },
  },
  {
    path: "/game",
    name: "Game",
    component: Game,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.initializeAuthStore(); // Ensure state is up-to-date

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
