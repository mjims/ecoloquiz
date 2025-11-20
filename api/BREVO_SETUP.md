# Configuration Brevo (Sendinblue) pour EcoloQuiz

## 1. Créer un compte Brevo

1. Allez sur [https://www.brevo.com](https://www.brevo.com)
2. Créez un compte gratuit
3. Vérifiez votre email

## 2. Obtenir la clé API

1. Connectez-vous à votre compte Brevo
2. Allez dans **Settings** (Paramètres) > **API Keys** (Clés API)
3. Cliquez sur **Generate a new API key** (Générer une nouvelle clé API)
4. Nommez-la "EcoloQuiz Production" ou "EcoloQuiz Dev"
5. Copiez la clé API (vous ne pourrez la voir qu'une fois)

## 3. Configurer l'adresse expéditrice

1. Dans Brevo, allez dans **Senders & IP** (Expéditeurs et IP)
2. Cliquez sur **Add a Sender** (Ajouter un expéditeur)
3. Ajoutez : `noreply@ecoloquiz.com` (ou votre domaine)
4. Vérifiez le domaine en ajoutant les enregistrements DNS requis
   - SPF record
   - DKIM record
   - DMARC record (optionnel mais recommandé)

## 4. Configuration Laravel

Ajoutez dans votre fichier `.env` :

```env
# Brevo Email Configuration
BREVO_API_KEY=votre_cle_api_brevo_ici
BREVO_SENDER_EMAIL=noreply@ecoloquiz.com
BREVO_SENDER_NAME=EcoloQuiz

# Frontend URL for email links
APP_FRONTEND_URL=https://votre-domaine.com
```

## 5. Tester l'envoi

### En développement

Pour tester sans envoyer de vrais emails, utilisez le **Sandbox mode** de Brevo :

```php
// Dans EmailService.php, ajoutez avant l'envoi :
if (config('app.env') === 'local') {
    Log::info("Mode sandbox - Email non envoyé", [
        'to' => $recipientEmail,
        'subject' => $subject
    ]);
    return true;
}
```

### Tester avec un vrai email

```bash
php artisan tinker
```

Puis dans Tinker :

```php
$service = new \App\Services\EmailService();
$service->sendWelcomeEmail(
    'votre-email@exemple.com',
    'John',
    'Doe',
    'http://localhost:3000/quiz'
);
```

## 6. Surveiller les envois

Dans le dashboard Brevo, vous pouvez :
- Voir tous les emails envoyés
- Taux d'ouverture
- Taux de clics
- Bounces et plaintes
- Logs détaillés

## 7. Limites du plan gratuit

- **300 emails par jour**
- Emails transactionnels illimités après validation du domaine
- Dashboard complet avec statistiques

## 8. Tags disponibles dans Brevo

Les emails sont tagués avec leur type pour un meilleur suivi :
- `REGISTRATION` - Confirmation d'inscription
- `PASSWORD_RESET` - Réinitialisation de mot de passe
- `WELCOME` - Email de bienvenue
- `LEVEL_UP` - Passage de niveau
- `GIFT_WON` - Cadeau gagné

## 9. Troubleshooting

### Erreur : "Authentication failed"
- Vérifiez que votre clé API est correcte
- Vérifiez qu'elle est bien dans le fichier `.env`
- Videz le cache : `php artisan config:clear`

### Erreur : "Sender not authorized"
- L'adresse expéditrice doit être vérifiée dans Brevo
- Allez dans **Senders & IP** et vérifiez le statut

### Les emails ne sont pas reçus
- Vérifiez les logs : `storage/logs/laravel.log`
- Vérifiez le dashboard Brevo pour voir si l'email a été envoyé
- Vérifiez le dossier spam du destinataire
- Vérifiez que le domaine est bien vérifié (SPF, DKIM)

## 10. Migration vers un autre fournisseur

Le service `EmailService` est conçu pour être facilement remplacé. Si vous voulez migrer vers SendGrid, Mailgun, etc., modifiez uniquement la méthode `sendViaBrevo()`.

## 11. Variables d'environnement complètes

```env
# Application
APP_NAME=EcoloQuiz
APP_ENV=production
APP_URL=https://api.ecoloquiz.com
APP_FRONTEND_URL=https://ecoloquiz.com

# Brevo
BREVO_API_KEY=xkeysib-xxxxx
BREVO_SENDER_EMAIL=noreply@ecoloquiz.com
BREVO_SENDER_NAME=EcoloQuiz
```
