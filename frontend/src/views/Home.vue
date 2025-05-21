<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/authStore";

const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const email = ref("");
const registerError = ref("");

onMounted(() => {
  authStore.initializeAuthStore();
  authStore.getAllPlayers();
});


const startGame = () => {
  window.location.href = "/game";
};

const authenticateUser = () => {
  if (!username.value || !password.value) {
    alert("Please enter both username and password.");
    return;
  }
  authStore.login({ username: username.value, password: password.value });
};

const handleRegister = () => {
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    registerError.value = "Tots els camps són obligatoris.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    registerError.value = "Les contrasenyes no coincideixen";
    return;
  }

  authStore
      .register({
        username: username.value,
        email: email.value,
        password: password.value,


      })
      .then(() => {
        alert("Usuari enregistrat correctament");
        username.value = "";
        email.value = "";
        password.value = "";
        confirmPassword.value = "";
        registerError.value = "";
      })

      .catch((err) => {
        console.error("Error complet:", err);

        registerError.value =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        "Error durant el registre";
      });

};

const logOut = () => {
  authStore.logout();
};
</script>

<template>
  <div v-if="authStore.playersList.length > 0" class="mt-5">
  <h3>Jugadors disponibles</h3>
  <ul class="list-group">
    <li
      v-for="player in authStore.playersList"
      :key="player.id"
      class="list-group-item"
    >
      {{ player.nickname }}
    </li>
  </ul>
</div>
  <div class="home text-center mt-4">
    <h1>Welcome to Battleship Game</h1>

    <div v-if="authStore.isAuthenticated" class="mt-5">
      <h3>You're logged in!</h3>
      <div class="mb-3">
        Access Token: {{ authStore.accessToken.slice(0, 20) }}...
      </div>
      <button class="btn btn-primary mr-2" @click="startGame">
        Start New Game
      </button>
      <button class="btn btn-secondary" @click="logOut">Log Out</button>
    </div>

    <div v-else>
  <h3>Please log in to play</h3>

  <!-- Login form -->
  <form
    @submit.prevent="authenticateUser"
    class="mx-auto mb-4"
    style="max-width: 300px"
  >
    <input
      v-model="username"
      type="text"
      placeholder="Username"
      class="form-control mb-2"
    />
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      class="form-control mb-2"
    />
    <button class="btn btn-primary w-100" :disabled="authStore.loading">
      {{ authStore.loading ? "Logging in..." : "Log In" }}
    </button>
    <div v-if="authStore.error" class="text-danger mt-2">
      {{ authStore.error }}
    </div>
  </form>

  <!-- Registration form -->
  <h3>Or register a new account</h3>
  <form
    @submit.prevent="handleRegister"
    class="mx-auto"
    style="max-width: 300px"
  >
    <input
      v-model="username"
      type="text"
      placeholder="Username"
      class="form-control mb-2"
      required
    />
    <input
      v-model="email"
      type="email"
      placeholder="Email"
      class="form-control mb-2"
      required
    />
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      class="form-control mb-2"
      required
    />
    <input
      v-model="confirmPassword"
      type="password"
      placeholder="Confirm Password"
      class="form-control mb-2"
      required
    />
    <button class="btn btn-success w-100">Register</button>
    <div v-if="registerError" class="text-danger mt-2">{{ registerError }}</div>
  </form>
</div>

  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
}
</style>
