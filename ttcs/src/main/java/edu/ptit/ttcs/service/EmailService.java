package edu.ptit.ttcs.service;

import java.util.Map;

/**
 * Interface for sending emails in the application.
 */
public interface EmailService {

    /**
     * Send a simple email message.
     *
     * @param to      recipient email address
     * @param subject email subject
     * @param text    email content
     */
    void sendSimpleMessage(String to, String subject, String text);

    /**
     * Send an HTML template email message.
     *
     * @param to           recipient email address
     * @param subject      email subject
     * @param templateName name of the template file without extension
     * @param variables    variables to be used in the template
     */
    void sendTemplateMessage(String to, String subject, String templateName, Map<String, Object> variables);
}