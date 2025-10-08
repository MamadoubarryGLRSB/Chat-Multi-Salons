#  Chat Multi-Salons avec Socket.IO

Application de chat en temps réel permettant aux utilisateurs de rejoindre différents salons de discussion et d'échanger des messages.

##  Installation

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

## Démarrage

1. **Lancer le serveur** :
   ```bash
   npm start
   ```
   ou
   ```bash
   node index.js
   ```

2. **Ouvrir l'application** :
   - Ouvrez votre navigateur à l'adresse : `http://localhost:3000`

##  Fonctionnalités

###  Fonctionnalités implémentées

- **Rejoindre un salon** : Les utilisateurs peuvent choisir un pseudo et rejoindre un salon spécifique
- **Envoyer des messages** : Les messages ne sont visibles que par les membres du même salon
- **Notifications de connexion** : Les membres sont notifiés quand quelqu'un rejoint le salon
- **Notifications de déconnexion** : Les membres sont notifiés quand quelqu'un quitte le salon
- **Interface moderne** : Design responsive et attrayant

## Comment tester

1. Ouvrez **plusieurs onglets ou fenêtres** de navigateur à `http://localhost:3000`
2. Dans chaque onglet :
   - Entrez un **pseudo différent**
   - Rejoignez le **même salon** (ex: "général") ou des salons différents
3. Testez l'envoi de messages :
   - Les messages dans un salon ne doivent apparaître que dans les onglets de ce salon
4. Testez les déconnexions :
   - Fermez un onglet et vérifiez que les autres reçoivent une notification

### Exemples de salons à créer

- `général` - discussion générale
- `dev` - discussions de développement
- `gaming` - discussions sur les jeux
- `random` - discussions aléatoires

##  Structure du projet

```
chat-multi-salons/
├── index.js          # Serveur Express et Socket.IO
├── index.html        # Interface client
├── package.json      # Configuration npm
└── README.md         # Documentation
```

## Technologies utilisées

- **Node.js** - Environnement d'exécution JavaScript
- **Express** - Framework web pour Node.js
- **Socket.IO** - Bibliothèque pour la communication WebSocket en temps réel
- **HTML/CSS/JavaScript** - Interface utilisateur

##  Améliorations possibles

- [ ] Afficher la liste des utilisateurs connectés dans chaque salon
- [ ] Permettre de changer de salon sans recharger la page
- [ ] Implémenter des messages privés entre utilisateurs
- [ ] Stocker l'historique des messages
- [ ] Ajouter des indicateurs de saisie ("X est en train d'écrire...")
- [ ] Ajouter des avatars pour les utilisateurs
- [ ] Implémenter des emojis et des réactions
- [ ] Ajouter un système d'authentification

## Notes techniques

### Concepts Socket.IO utilisés

- `socket.join(room)` : Ajoute un socket à un salon spécifique
- `io.to(room).emit()` : Envoie un message à tous les clients d'un salon
- `socket.to(room).emit()` : Envoie un message à tous les clients d'un salon sauf l'émetteur
- `socket.data` : Stocke des données associées à un socket spécifique

##  Ressources

- [Documentation Socket.IO](https://socket.io/docs/v4/)
- [Documentation Express](https://expressjs.com/)
- [Documentation Node.js](https://nodejs.org/docs/)

---

**Bon chat ! **

