# Dificultats Trobades

Aquest apartat descriu els principals obstacles trobats durant el desenvolupament del joc d'enfonsar la flota i com es van abordar.

## Funcionament inicial al frontend

Al principi, el joc es va desenvolupar principalment al frontend, amb una lògica local que gestionava la col·locació de vaixells, els tirs i els canvis de fase. Això permetia un prototip funcional, però limitat, ja que totes les dades es mantenien al navegador sense persistència ni integració amb el backend.

## Integració amb el backend

La veritable dificultat va arribar en fer que les dades del joc vinguessin del backend, especialment en dos aspectes clau:

- **Col·locació de vaixells:**  
  Sincronitzar la col·locació de vaixells entre el frontend i el backend va ser complex. Cada vaixell col·locat al tauler del jugador havia d'enviar-se a l'endpoint `/api/v1/boardvessels/` amb les dades correctes (`board`, `vessel`, `ri`, `ci`, `rf`, `cf`, `alive`).  
  Això requeria validacions addicionals per evitar superposicions o col·locacions fora del tauler, tant al frontend com al backend, i gestionar errors en cas de fallades de comunicació.

- **Canvi de fases:**  
  El canvi entre fases (`placement`, `playing`, `gameOver`) va ser un altre repte important. Inicialment, els canvis es gestionaven localment al frontend, però integrar-los amb el backend va requerir crides precises a `/api/v1/games/{id}/update_phase/`.  
  Va ser difícil assegurar que ambdós jugadors (usuari i bot) completessin la col·locació abans de passar a `playing`, i que l'estat del joc es mantingués coherent en cas de desconnexions o errors.

## Solució

- Per a la **col·locació de vaixells**, es van implementar validacions estrictes al frontend i al backend, amb missatges d'error clars per guiar l'usuari. També es va optimitzar la comunicació amb l’API per reduir la latència i minimitzar els errors de sincronització.

- Per als **canvis de fase**, es va establir un sistema de sincronització mitjançant crides periòdiques a l’endpoint de l’API per consultar l’estat actual del joc. D’aquesta manera, el frontend s’actualitzava automàticament en funció del backend, assegurant la coherència del flux de joc.

