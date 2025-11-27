const { createTransporter, emailTemplates } = require('../config/email');

// Send registration confirmation email
exports.sendRegistrationEmail = async (user, event, qrCode) => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates.eventRegistration(event.title, user.name, qrCode);

    await transporter.sendMail({
      from: `"EventPulse" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Registration email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending registration email:', error);
    return false;
  }
};

// Send event reminder email
exports.sendReminderEmail = async (user, event) => {
  try {
    const transporter = createTransporter();
    const eventDate = new Date(event.startDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const template = emailTemplates.eventReminder(
      event.title,
      user.name,
      eventDate,
      event.location
    );

    await transporter.sendMail({
      from: `"EventPulse" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Reminder email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending reminder email:', error);
    return false;
  }
};

// Send event cancellation email
exports.sendCancellationEmail = async (user, event, reason = '') => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates.eventCancellation(event.title, user.name, reason);

    await transporter.sendMail({
      from: `"EventPulse" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Cancellation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    return false;
  }
};

// Send bulk emails
exports.sendBulkEmails = async (users, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    const promises = users.map(user =>
      transporter.sendMail({
        from: `"EventPulse" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: htmlContent
      })
    );

    await Promise.all(promises);
    console.log(`✅ Bulk emails sent to ${users.length} users`);
    return true;
  } catch (error) {
    console.error('❌ Error sending bulk emails:', error);
    return false;
  }
};
