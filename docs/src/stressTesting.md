# Stress Testing

## Gestió de múltiples jocs concurrents

El sistema permet **crear i gestionar diverses partides alhora**.  
Cada partida té un **identificador únic** i un **tauler associat per a cada jugador**, mantenint l'estat de manera independent.

- El **backend** emmagatzema les partides a la base de dades.
- El **frontend** pot carregar i gestionar múltiples jocs simultàniament sense interferències.


---

## Gestió de múltiples jugadors concurrents

El joc suporta **diversos jugadors connectats al mateix temps**.

- Els jugadors poden unir-se a partides existents, però sempre contra el bot, no hem implementat multijugador.
- Hi ha validacions per assegurar que només es permetin jugadors nous en **partides en espera o en fase de col·locació**, i un mateix jugador no es pot unir a una partida que és seva.

---

## Reanudació de partides

Els jugadors desconnectats poden **tornar a unir-se a una partida existent** gràcies a l’emmagatzematge persistent de l’estat del joc al backend.

- Quan un jugador es reconnecta, el sistema carrega:
  - La fase del joc

---

## Comportament quan les galetes estan desactivades

El joc **no depèn de galetes** per funcionar correctament.

- Utilitza **LocalStorage** per emmagatzemar:
  - Els tokens d’autenticació (JWT)
  - L’identificador del jugador


---
