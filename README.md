# Chat Multi-Salons avec Socket.IO

Application de chat en temps réel permettant aux utilisateurs de communiquer dans différents salons.

## Installation

```bash
npm install
```

## Lancement

```bash
node index.js
```

Puis ouvrez votre navigateur à : `http://localhost:3000`

## Fonctionnalités

- **Chat en temps réel** : Messages instantanés dans les salons
- **Liste des utilisateurs** : Voir qui est connecté dans le salon
- **Changement de salon** : Passer d'un salon à l'autre sans recharger
- **Messages privés** : Chat privé entre utilisateurs
- **Indicateurs de saisie** : Voir qui est en train d'écrire
- **Avatars colorés** : Générés automatiquement pour chaque utilisateur
- **Emojis** : Sélecteur d'emojis intégré
- **Historique** : Conservation des 100 derniers messages par salon
- **Notifications** : Alertes visuelles pour les événements

## Comment utiliser

1. Entrez votre pseudo et le nom d'un salon
2. Cliquez sur "Rejoindre le salon"
3. Envoyez des messages dans le chat
4. Cliquez sur un utilisateur pour un chat privé
5. Utilisez "Changer de salon" pour passer à un autre salon

## Outils utilisés

- **Node.js** - Serveur JavaScript
- **Express** - Framework web
- **Socket.IO** - Communication temps réel
- **HTML/CSS/JavaScript** - Interface utilisateur