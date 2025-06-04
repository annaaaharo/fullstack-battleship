# Conclusions i Reptes

Aquest apartat resumeix les conclusions del desenvolupament de la pràctica del joc d'enfonsar la flota, reflexionant sobre els resultats aconseguits i els aprenentatges obtinguts.

## Conclusions

### Assoliment dels objectius

- La pràctica ha complert la majoria dels objectius establerts en l'enunciat.  
  Al backend, s'ha implementat una aplicació CRUD completa amb Django REST Framework, gestionant models com User, Player, Game, Vessel i Shot, amb autenticació segura via JWT.  
  La lògica del joc, incloent col·locació de vaixells, tirs i canvis de fase, es gestiona eficaçment mitjançant endpoints com `/api/v1/boardvessels/` i `/api/v1/shots/`.

- Al frontend, s'ha desenvolupat una interfície interactiva amb Vue.js i Pinia, permetent una experiència d'usuari fluida per registrar-se, col·locar vaixells i jugar, amb comunicació segura amb el backend via Axios.

### Treball en equip

- Hem treballat de manera coordinada i simultània, com es pot veure en els pull requests al repositori de GitHub.

- La comunicació constant i participativa, tant en revisions de codi com en reunions, va permetre repartir tasques (backend i frontend) i resoldre problemes de manera eficient, com es detalla a l'apartat d'organització.

### Superació de dificultats

- La principal dificultat va ser la transició d'una lògica inicial basada en el frontend a una integració completa amb el backend, especialment en la col·locació de vaixells i els canvis de fase.

- Aquest repte es va superar amb validacions estrictes i sincronització mitjançant l'API, com es descriu a l'apartat de dificultats.

- Altres obstacles, com la gestió de concurrència i la robustesa de les crides API, es van abordar amb proves exhaustives i optimitzacions.

### Proves i resultats

- Les proves unitàries, creuades, d'autoavaluació i beta han demostrat que el joc és funcional i estable, suportant:
  - múltiples partides i jugadors concurrents,
  - reanudació de partides,
  com es detalla als apartats corresponents.

- Les captures de pantalla, descrites a l'apartat de captures, mostren el funcionament final, des del registre fins a la finalització del joc, evidenciant una interfície clara i una experiència d'usuari acceptable.

### Aprenentatges

- Hem après a integrar un frontend i un backend en una aplicació web complexa, gestionant estats i comunicacions API.
- Hem millorat les habilitats en metodologies àgils, treball en equip i resolució de problemes tècnics, especialment en validacions i sincronització de dades.
- Hem guanyat experiència en proves de resistència i compatibilitat, assegurant que el sistema és robust en diferents escenaris.

