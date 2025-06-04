# Stress Testing i Funcionalitat del Game Lobby

Durant el procés de desenvolupament, no s’ha implementat completament el mode multijugador en temps real, ja que no hi ha sockets oberts o connexions persistents entre jugadors. Tot i això, s’ha construït un sistema intermedi anomenat **Game Lobby**, que permet gestionar partides i simular interaccions multijugador bàsiques.

## Què és el Game Lobby?

El `GameLobby.vue` és una interfície interactiva escrita amb Vue.js que permet als usuaris:

- Veure una llista de partides disponibles.
- Unir-se a partides.
- Crear una nova partida.
- Veure les seves pròpies partides (en curs o finalitzades).
- Eliminar partides creades per ells mateixos.
- Continuar partides existents.

Tot això funciona amb crides a una **API REST** que gestiona l’estat de les partides i dels jugadors al servidor.

## Funcionalitats principals

### Carregar partides disponibles

- Mostra les partides amb estat `waiting` o `placement`.
- Permet unir-se a partides.
- Sempre jugant contra el bot i no et pots unir a partides on ets el owner.

### Crear nova partida

- Redirigeix directament a la pantalla del joc.
- Permet començar una partida.

### Veure i gestionar les meves partides

- L’usuari pot veure totes les partides en què ha participat.
- Possibilitat d’eliminar partides individuals o totes les seves partides.

## Limitacions actuals

- **No hi ha connexió multijugador**
- **No es poden veure actualitzacions automàtiques de l'estat de les partides** (ex: si un altre jugador es connecta, no es reflecteix fins a actualitzar manualment).

## Stress Testing i el Game Lobby

Tot i que el mode multijugador en temps real no s'ha implementat, el Game Lobby permet simular escenaris de càrrega:

- **Simulació de múltiples partides creades i unides per diferents usuaris**.
- **Proves de càrrega amb centenars de partides disponibles**.
- **Validació de rendiment del client frontend quan es mostren molts elements (partides, jugadors)**.
- **Proves amb diversos usuaris que accedeixen al lobby simultàniament**.

Aquest enfocament ha permès **testar l'arquitectura de backend** i assegurar que el sistema gestiona correctament l'estat de múltiples partides i usuaris en paral·lel.


