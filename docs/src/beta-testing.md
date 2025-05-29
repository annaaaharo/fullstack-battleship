# Beta Testing

## Testing scenarios

- Case A: The game is fully functional - i.e., frontend and backend are implemented and communicate correctly. In this case, the testing is performed on the frontend by playing the game.
- Case B: The game is partially functional - i.e., frontend is not fully connected to the backend. In this case, the testing is performed on the backend by sending requests to the API endpoints using the `api/v1/*/` endpoints or `docs/` url.
- Case C: The backend is partially functional - i.e., the backend is not fully implemented. In this case, the testers will interview the developers about what is working and what is not, and about the main issues they encountered and discuss/advise on how to fix them.

## Group Information

- Your group and team members:
  - Group: [C03]
  - Team members: [Èlia Garcia, Anna Haro]

## Tested Group Information

### Test group 1

- Test group 1:
  - Group: [C04]
  - Team members: [Mario Esteban, Helena Amérigo]

### Case A checklist

- Initialization:
  - [] authentication works correctly
  - [] (**OPT**) registration is implemented
  - [] game can be created
- Gameplay:
  - [] can place ships
  - [] can fire shots
  - [] can receive hits and misses
  - [] can play against a bot
  - [] game ends correctly (win/loss)
  - [] (**OPT**) multiplayer is implemented
  - [] multiplayer works correctly
- Stress Testing:
  - [] can handle multiple concurrent games
  - [] can handle multiple concurrent players
  - [] game can be restarted (disconnected players can rejoin)
  - [] behaviour when cookies are disabled
- Post game:

  - [] (**OPT**) leaderboard is implemented

- Additional tests (please specify):
  - [] ...
    - [] ...
    - [] ...

### Case B checklist

- Initialization:
  - [X] you can get a token pair
  - [X] (**OPT**) registration is implemented
  - [X] authorization is set up correctly for the Users API
  - [X] game can be created
- Gameplay:
  - [X] can place ships
  - [] can fire shots
  - [] can receive hits and misses
  - [] can play against a bot
  - [] game ends correctly (win/loss)
  - [] (**OPT**) multiplayer is implemented
  - [] multiplayer works correctly
- Post game:

  - [] (**OPT**) leaderboard is implemented

- Additional tests (please specify):
  - [] ...
    - [] ...
    - [] ...

Observacions: Tot i que l’aplicació permet col·locar vaixells al tauler, aquesta funcionalitat està limitada per una inicialització rígida i no flexible. És a dir, els vaixells no es creen dinàmicament ni es gestionen correctament al backend, sinó que estan hardcodejats. Això provoca que l’estat real de la partida no es pugui gestionar ni consultar de manera fiable mitjançant l’API.

A causa d’aquesta limitació en la lògica del servidor (backend), no es pot continuar amb la resta del flux del joc, ja que:

No es poden disparar trets (shots) de forma funcional, ja que no hi ha persistència ni control sobre la posició real dels vaixells. No es pot determinar si un tret és un encert o un fall, perquè no hi ha un model de l’estat del tauler que permeti fer aquestes comprovacions. No es pot determinar si la partida ha de finalitzar, perquè no es pot saber si s’han enfonsat tots els vaixells d’un jugador. El joc contra bot no pot ser testejat perquè no hi ha cap lògica implementada per generar ni controlar moviments del bot.

La funcionalitat de multijugador tampoc està desenvolupada ni disponible per test.

Per tant, encara que la part inicial de la creació del joc i la col·locació visual dels vaixells funcioni mínimament, la manca d’una estructura backend sòlida impedeix validar les funcionalitats principals del joc (com la mecànica de tir, la detecció de victòria o derrota, i el joc multijugador). Cal completar la implementació del backend abans de poder avançar amb les proves completes del joc.

### Case C checklist

- Summarize the interview

## Tested Group Information

### Test group 2

- Test group 1:
  - Group: [C05]
  - Team members: [Laia Beni, Francesc Navarro]

### Case A checklist

- Initialization:
  - [] authentication works correctly
  - [] (**OPT**) registration is implemented
  - [] game can be created
- Gameplay:
  - [] can place ships
  - [] can fire shots
  - [] can receive hits and misses
  - [] can play against a bot
  - [] game ends correctly (win/loss)
  - [] (**OPT**) multiplayer is implemented
  - [] multiplayer works correctly
- Stress Testing:
  - [] can handle multiple concurrent games
  - [] can handle multiple concurrent players
  - [] game can be restarted (disconnected players can rejoin)
  - [] behaviour when cookies are disabled
- Post game:

  - [] (**OPT**) leaderboard is implemented

- Additional tests (please specify):
  - [] ...
    - [] ...
    - [] ...

### Case B checklist

- Initialization:
  - [] you can get a token pair
  - [] (**OPT**) registration is implemented
  - [] authorization is set up correctly for the Users API
  - [X] game can be created
- Gameplay:
  - [X] can place ships
  - [] can fire shots
  - [] can receive hits and misses
  - [] can play against a bot
  - [] game ends correctly (win/loss)
  - [] (**OPT**) multiplayer is implemented
  - [] multiplayer works correctly
- Post game:

  - [] (**OPT**) leaderboard is implemented

- Additional tests (please specify):
  - [] ...
    - [] ...
    - [] ...

Observacions: Tot i que l’aplicació permet la col·locació de vaixells al tauler, aquesta funcionalitat està limitada per una inicialització no dinàmica: els vaixells estan hardcodejats i no es generen correctament ni des del client ni des del backend. Això indica que encara no hi ha una estructura de dades adequada per gestionar el posicionament i l’estat dels vaixells per jugador dins de la partida.

No es pot obtenir un token JWT, per tant no hi ha autenticació funcional. Això bloqueja completament qualsevol accés a rutes protegides com la creació de jugadors, col·locació de vaixells via API, o execució de jugades. No hi ha registre d’usuaris habilitat, fet que complica encara més les proves de fluxos reals d’usuari. No es pot verificar l'autenticació sobre l'API de Users, perquè el sistema d'autenticació no està actiu.

Pel que fa al gameplay, només s’ha pogut verificar parcialment la col·locació de vaixells, però com que no estan correctament inicialitzats ni controlats per la lògica del servidor, això no té cap impacte real sobre l’estat del joc.

Per aquest motiu, no es poden fer proves funcionals sobre la mecànica de trets, els encerts o errors, la detecció de final de partida o la interacció amb un bot. Tota aquesta lògica depèn d’un backend actiu amb models i rutes ben definides, que en aquest cas encara no estan implementades.

En resum, encara que s’ha pogut crear una partida i visualment col·locar vaixells, el projecte no compta amb una arquitectura backend funcional, i això impedeix avançar amb qualsevol prova significativa del joc. És necessari completar primer la part d’autenticació i lògica del joc al backend per tal de continuar amb el desenvolupament i les validacions.

### Case C checklist

- Summarize the interview
