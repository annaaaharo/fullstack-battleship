# Joc d'Enfonsar la Flota

---

## Visió General

El joc es divideix en dues fases principals:

- **Fase de col·locació (_placement_)**:  
  Els jugadors (usuari i un bot oponent) col·loquen 5 vaixells de diferents mides (d'1 a 5 caselles) en un tauler de 10x10.

- **Fase de joc (_playing_)**:  
  Els jugadors es tornen per disparar al tauler de l'oponent.  
  Un **encert (_hit_)** permet disparar de nou, mentre que un **error (_miss_)** passa el torn.  
  El joc acaba quan un jugador aconsegueix enfonsar tots els vaixells de l'oponent.

---

## Objectius

- **Frontend**:  
  Proporcionar una interfície interactiva per col·locar vaixells i disparar, gestionant l'estat del joc amb **Pinia**.

- **Backend**:  
  Gestionar l'estat del joc, validar accions (col·locació de vaixells i tirs) i emmagatzemar les dades en una base de dades.

---

## Tecnologies Utilitzades

### Frontend

- **Vue.js**: Framework per a la interfície d'usuari.
- **Pinia**: Gestió de l'estat del joc (`gamePhase`, `playerBoard`, `opponentBoard`, `playerPlacedShips`, etc.).
- **Axios**: Crides HTTP al backend per gestionar vaixells, taulers, tirs i estats del joc.
- **API REST**: Comunicació amb el backend per sincronitzar l'estat del joc.

### Backend

- **Django REST Framework**: Creació de la REST-API per gestionar usuaris, jocs, vaixells i tirs.
- **Models Django**: `User`, `Player`, `Game`, `Vessel`, `Board`, `BoardVessel`, `Shot`.
- **JWT**: Autenticació segura amb tokens d'accés i _refresh_.

---

## Mecànica del Joc

### Fase de Col·locació

**Accions:**

- Els jugadors seleccionen un vaixell de la llista `availableShips` i el col·loquen al seu tauler (`playerBoard`) fent clic en una casella.
- Poden rotar els vaixells (vertical o horitzontal) abans de col·locar-los.
- Els vaixells del bot es col·loquen automàticament desde backend.

**Validacions:**

- Màxim 5 vaixells per jugador.
- No es permeten superposicions ni col·locacions fora del tauler.
- Cada vaixell col·locat s'envia a l'endpoint: POST /api/v1/boardvessels/ amb les dades:

- `board`
- `vessel`
- `ri`, `ci` (fila i columna inicials)
- `rf`, `cf` (fila i columna finals)
- `alive`

**Transició:**

- Quan els dos jugadors han col·locat tots els vaixells (5 per tauler), el joc passa a la fase _playing_ mitjançant una crida a: POST /api/v1/games/{id}/update_phase/


---

### Fase de Joc

**Accions:**

- L'usuari dispara al tauler de l'oponent (`opponentBoard`) fent clic en una casella.
- Un **encert (_hit_)** permet disparar de nou; un **error (_miss_)** passa el torn al bot.
- El bot dispara aleatòriament al tauler del jugador (`playerBoard`).

**Gestió de Tirs:**

- Els tirs s'envien a: POST /api/v1/shots/ amb les dades:

- `game`
- `player`
- `board`
- `row`, `col`
- `result`

- Els encerts es marquen amb valors negatius (ex: `-1` per un vaixell tocat).
- Els errors es marquen amb el valor `11`.

**Fi del Joc:**

- Quan un jugador arriba enfosa tots els vaixells, el joc passa a _gameOver_ i es declara el guanyador amb una crida a: POST /api/v1/games/{id}/update_winner/







