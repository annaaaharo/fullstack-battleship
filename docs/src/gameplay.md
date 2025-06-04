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

- Quan un jugador arriba enfosa tots els vaixells, el joc passa a _gameOver_ i es declara el guanyador amb una crida a: POST /api/v1/games/{id}/update_winner/. On també es queda enregistrat el nom del guanyador.







