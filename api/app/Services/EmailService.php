<?php

namespace App\Services;

use App\Models\EmailTemplate;
use App\Models\EmailType;
use Illuminate\Support\Facades\Log;
use SendinBlue\Client\Configuration;
use SendinBlue\Client\Api\TransactionalEmailsApi;
use SendinBlue\Client\Model\SendSmtpEmail;

class EmailService
{
    /**
     * Envoyer un email système basé sur un type
     */
    public function sendSystemEmail(string $typeCode, array $variables, string $recipientEmail)
    {
        try {
            // Récupérer le type d'email système
            $emailType = EmailType::where('code', $typeCode)
                ->where('is_system', true)
                ->where('is_active', true)
                ->first();

            if (!$emailType) {
                Log::warning("Email type système non trouvé: {$typeCode}");
                return false;
            }

            // Récupérer le template actif pour ce type
            $template = EmailTemplate::where('email_type_id', $emailType->id)
                ->where('is_active', true)
                ->first();

            if (!$template) {
                Log::warning("Aucun template actif trouvé pour le type: {$typeCode}");
                return false;
            }

            // Remplacer les variables dans le sujet et le corps
            $subject = $this->replaceVariables($template->subject, $variables);
            $bodyHtml = $this->replaceVariables($template->body_html, $variables);
            $bodyText = $this->replaceVariables($template->body_text, $variables);

            // Envoyer via Brevo API
            return $this->sendViaBrevo($template, $subject, $bodyHtml, $bodyText, $recipientEmail, $typeCode);

        } catch (\Exception $e) {
            Log::error("Erreur lors de l'envoi de l'email système {$typeCode}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer l'email via l'API Brevo
     */
    private function sendViaBrevo($template, string $subject, string $bodyHtml, string $bodyText, string $recipientEmail, string $typeCode)
    {
        try {
            // Configuration Brevo
            $config = Configuration::getDefaultConfiguration()->setApiKey('api-key', config('services.brevo.api_key'));
            $apiInstance = new TransactionalEmailsApi(new \GuzzleHttp\Client(), $config);

            // Préparer l'email
            $sendSmtpEmail = new SendSmtpEmail();

            // Expéditeur
            $sendSmtpEmail->setSender([
                'name' => $template->sender_name ?? config('services.brevo.sender_name', 'EcoloQuiz'),
                'email' => $template->sender_email ?? config('services.brevo.sender_email', 'noreply@ecoloquiz.com')
            ]);

            // Destinataire
            $sendSmtpEmail->setTo([
                ['email' => $recipientEmail]
            ]);

            // Sujet
            $sendSmtpEmail->setSubject($subject);

            // Corps du message
            $sendSmtpEmail->setHtmlContent($bodyHtml);
            $sendSmtpEmail->setTextContent($bodyText);

            // CC si défini
            if ($template->cc) {
                $ccEmails = array_map('trim', explode(',', $template->cc));
                $ccArray = array_map(function($email) {
                    return ['email' => $email];
                }, $ccEmails);
                $sendSmtpEmail->setCc($ccArray);
            }

            // BCC si défini
            if ($template->bcc) {
                $bccEmails = array_map('trim', explode(',', $template->bcc));
                $bccArray = array_map(function($email) {
                    return ['email' => $email];
                }, $bccEmails);
                $sendSmtpEmail->setBcc($bccArray);
            }

            // Tag pour le suivi dans Brevo
            $sendSmtpEmail->setTags([$typeCode]);

            // Envoyer l'email
            $result = $apiInstance->sendTransacEmail($sendSmtpEmail);

            Log::info("Email système envoyé via Brevo: {$typeCode} à {$recipientEmail}", [
                'message_id' => $result->getMessageId()
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error("Erreur Brevo lors de l'envoi de l'email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Remplacer les variables dans une chaîne
     */
    private function replaceVariables(string $content, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $content = str_replace("{{{$key}}}", $value, $content);
        }
        return $content;
    }

    /**
     * Envoyer l'email de confirmation d'inscription
     */
    public function sendRegistrationEmail(string $email, string $firstName, string $lastName, string $confirmationUrl)
    {
        return $this->sendSystemEmail('REGISTRATION', [
            'prenom' => $firstName,
            'nom' => $lastName,
            'email' => $email,
            'confirmation_url' => $confirmationUrl,
        ], $email);
    }

    /**
     * Envoyer l'email de réinitialisation de mot de passe
     */
    public function sendPasswordResetEmail(string $email, string $firstName, string $lastName, string $resetUrl)
    {
        return $this->sendSystemEmail('PASSWORD_RESET', [
            'prenom' => $firstName,
            'nom' => $lastName,
            'email' => $email,
            'reset_url' => $resetUrl,
        ], $email);
    }

    /**
     * Envoyer l'email de bienvenue
     */
    public function sendWelcomeEmail(string $email, string $firstName, string $lastName, string $quizUrl)
    {
        return $this->sendSystemEmail('WELCOME', [
            'prenom' => $firstName,
            'nom' => $lastName,
            'email' => $email,
            'quiz_url' => $quizUrl,
        ], $email);
    }

    /**
     * Envoyer l'email de passage de niveau
     */
    public function sendLevelUpEmail(string $email, string $firstName, string $lastName, string $levelName, int $score, string $dashboardUrl)
    {
        return $this->sendSystemEmail('LEVEL_UP', [
            'prenom' => $firstName,
            'nom' => $lastName,
            'level_name' => $levelName,
            'score' => $score,
            'dashboard_url' => $dashboardUrl,
        ], $email);
    }

    /**
     * Envoyer l'email de cadeau gagné
     */
    public function sendGiftWonEmail(string $email, string $firstName, string $lastName, string $giftName, string $giftDescription, string $giftsUrl)
    {
        return $this->sendSystemEmail('GIFT_WON', [
            'prenom' => $firstName,
            'nom' => $lastName,
            'gift_name' => $giftName,
            'gift_description' => $giftDescription,
            'gifts_url' => $giftsUrl,
        ], $email);
    }
}
