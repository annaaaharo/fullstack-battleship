# Self Testing

## Group Information

- Your group and team members:
  - Group: C03
  - Team members: Èlia Garcia i Anna Haro

### Implementation checklist

- Initialization:
  - [X] authentication works correctly
  - [X] (**OPT**) registration is implemented
  - [X] game can be created
- Gameplay:
  - [X] can place ships (falta que el backend generi i enviï els vaixells al frontend)
  - [X] can fire shots (falta que el backend enregistri i gestioni els dispars)
  - [X] can receive hits and misses (es registra el torn i estats de joc al backend)
  - [X] can play against a bot
  - [X] game ends correctly (win/loss) (la lògica de canvi de fase i guanyador està implementada)
  - [] (**OPT**) multiplayer is implemented
  - [] multiplayer works correctly
- Stress Testing:
  - [] can handle multiple concurrent games
  - [] can handle multiple concurrent players
  - [X] game can be restarted (disconnected players can rejoin)
  - [] behaviour when cookies are disabled
- Post game:

  - [] (**OPT**) leaderboard is implemented

- Additional features you implemented (please specify):
  - [] ...
    - [] ...
    - [] ...

### Encountered issues, how you solved them if you did.

Hem tingut dificultats per coordinar la sincronització de l’estat de joc entre backend i frontend, especialment amb els vaixells i els trets, ja que encara no estava implementada la part de backend que envia aquesta informació al client.

Per ara, només gestionem el GameState bàsic: fases, guanyador i torn, però és un bon punt de partida.

La manca de persistència de trets i vaixells fa que la partida no es pugui jugar completament.

### Post testing improvements

Implementar la creació i enviament dels vaixells des del backend al frontend per poder posicionar-los i visualitzar-los correctament.

Registrar i gestionar els dispars (shots) al backend, per mantenir l’estat actualitzat i sincronitzat amb el client.
