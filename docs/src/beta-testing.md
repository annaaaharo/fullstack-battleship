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
  -Observacions: Els hi deixa col.locar els vaixells pero no els tenen inicialitzats de manera no hardcodejada. Els falta implementar el backend. Per aquest motiu la resta de funcionalitats no poden ser testejades (com els shots i demés).

### Case C checklist

- Summarize the interview

## Group Information

- Your group and team members:
  - Group: [C03]
  - Team members: [Èlia Garcia, Anna Haro]

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
  -Observacions: Els hi deixa col.locar els vaixells pero no els tenen inicialitzats de manera no hardcodejada. Els falta implementar el backend. Per aquest motiu la resta de funcionalitats no poden ser testejades (com els shots i demés).

### Case C checklist

- Summarize the interview

### Test group 2

Backend va crear joc i posar vaixells.
