# Objectius

Aquest apartat llista els objectius establerts per a la pràctica del joc d'enfonsar la flota, segons l'enunciat, indicant quins s'han complert i quins no.

## Objectius Complerts

### Back-End

- **Crear aplicació CRUD amb autentificació per a gestionar el model d'aplicació:**  
  S'ha implementat una aplicació CRUD completa amb Django REST Framework, gestionant models com `User`, `Player`, `Game`, `Vessel`, `Board`, `BoardVessel` i `Shot`.  
  Els endpoints permeten crear, llegir, actualitzar i eliminar dades, amb autentificació basada en JWT per protegir les operacions.  
  **Exemples d'endpoints:**  
  - `/api/v1/users/` (creació d'usuaris)  
  - `/api/v1/games/` (gestió de partides)  
  - `/api/v1/boardvessels/` (col·locació de vaixells)  
  - `/api/v1/shots/` (registre de tirs)

- **Gestionar la lògica del joc:**  
  El backend controla la lògica del joc, incloent:
  - Creació de partides
  - Col·locació de vaixells
  - Processament de tirs
  - Determinació del guanyador  

  Les fases del joc (`placement`, `playing`, `gameOver`) es gestionen amb endpoints com:
  - `/api/v1/games/{id}/update_phase/`
  - `/api/v1/games/{id}/update_winner/`

### Front-End

- **Interacció amb l'usuari per a visualització de dades i recollida d'accions:**  
  S'ha desenvolupat una interfície interactiva amb Vue.js, que permet als usuaris:
  - Visualitzar els taulers (`playerBoard` i `opponentBoard`)
  - Col·locar vaixells mitjançant clics
  - Disparar durant la fase de joc  

  Pinia gestiona l'estat del joc, mostrant missatges com "Your turn" o "Game Over".  
  Inclou formularis per a:
  - Registre i inici de sessió
  - Taulers visuals per a col·locació i tirs

- **Comunicació segura amb el back-end:**  
  El frontend utilitza crides HTTP segures amb Axios, amb tokens JWT emmagatzemats a `LocalStorage`.  
  Aquestes crides inclouen autenticació per protegir:
  - Creació de partides
  - Col·locació de vaixells
  - Disparar

### Addicionals

- Suport per a múltiples jocs i jugadors concurrents, amb taulers independents.
- Reanudació de partides en cas de desconnexió, restaurant l'estat des del backend.
- Funcionament correcte amb galetes desactivades, gràcies a l'ús de `LocalStorage`.

## Objectius No Complerts

- **Mode multijugador en temps real:**  
  No s'ha implementat. El joc només suporta partides contra un bot.  

- **Taula de lideratge**  

