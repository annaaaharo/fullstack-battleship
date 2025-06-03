# Inicialització del Joc: Registre i Autenticació

Aquest apartat descriu com s'implementa el sistema de registre i autenticació d'usuaris en el joc d'enfonsar la flota, tant al frontend com al backend. L'objectiu és permetre als usuaris crear un compte, iniciar sessió i accedir al joc de manera segura.

## Visió General

El sistema de registre i autenticació es basa en una arquitectura client-servidor:
- **Frontend**: Utilitza **Vue.js** i la llibreria **Pinia** per gestionar l'estat de l'autenticació i fer crides a l'API del backend.
- **Backend**: Implementa una **REST-API** amb **Django REST Framework** per gestionar la creació d'usuaris, l'autenticació i la llista de jugadors disponibles.
- **Seguretat**: S'utilitzen **JWT (JSON Web Tokens)** per autenticar les peticions, amb un sistema de *refresh tokens* per renovar l'accés quan expira.

## Implementació al Frontend

### Tecnologies i Eines
- **Vue.js**: Framework per crear la interfície d'usuari.
- **Pinia**: Llibreria de gestió d'estat per emmagatzemar informació de l'usuari (nom, tokens, estat d'autenticació).
- **Axios**: Per realitzar peticions HTTP al backend.
- **LocalStorage**: Emmagatzema els tokens d'accés i *refresh* per mantenir la sessió.

### Funcionalitats Principals
1. **Registre d'Usuari**:
   - L'usuari introdueix un nom d'usuari, correu electrònic, contrasenya i confirmació de contrasenya en un formulari.
   - Es validen els camps al client (per exemple, que les contrasenyes coincideixin).
   - Es fa una petició POST a l'endpoint `/api/v1/users/` per crear l'usuari.
   - Si el registre és exitós, es fa automàticament un *login* per obtenir els tokens d'accés i *refresh*.

2. **Inici de Sessió**:
   - L'usuari introdueix nom d'usuari i contrasenya.
   - Es fa una petició POST a `/api/token/` per obtenir els tokens JWT.
   - Els tokens s'emmagatzemen al `LocalStorage` i a l'estat de Pinia.
   - Es recupera l'ID del jugador associat a l'usuari per utilitzar-lo en el joc.

3. **Gestió de la Sessió**:
   - S'utilitza un interceptor d'Axios per renovar automàticament el token d'accés quan expira, mitjançant una crida a `/api/token/refresh/`.
   - L'estat d'autenticació (`isAuthenticated`) es manté actualitzat a Pinia.
   - Es carrega la llista de jugadors disponibles (`playersList`) quan es munta el component.

4. **Tancament de Sessió**:
   - S'eliminen els tokens del `LocalStorage` i es restableix l'estat de Pinia.
