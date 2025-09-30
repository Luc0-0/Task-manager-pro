const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email configuration missing. Email notifications disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Task Manager Pro! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Welcome to Task Manager Pro!</h1>
        <p>Hi ${userName},</p>
        <p>Welcome to Task Manager Pro! We're excited to help you boost your productivity.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Create and manage tasks</li>
          <li>Organize tasks into projects</li>
          <li>Collaborate with team members</li>
          <li>Track your progress with analytics</li>
          <li>Earn XP and level up!</li>
        </ul>
        <p>Get started by creating your first task!</p>
        <p>Best regards,<br>The Task Manager Pro Team</p>
      </div>
    `
  }),

  taskReminder: (task, userName) => ({
    subject: `Reminder: ${task.title} is due soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Task Reminder</h1>
        <p>Hi ${userName},</p>
        <p>This is a reminder that your task <strong>"${task.title}"</strong> is due soon.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Task Details:</h3>
          <p><strong>Title:</strong> ${task.title}</p>
          <p><strong>Description:</strong> ${task.description || 'No description'}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
        </div>
        <p>Don't forget to complete your task on time!</p>
        <p>Best regards,<br>The Task Manager Pro Team</p>
      </div>
    `
  }),

  taskCompleted: (task, userName) => ({
    subject: `Great job! You completed "${task.title}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Task Completed! 🎉</h1>
        <p>Hi ${userName},</p>
        <p>Congratulations! You've successfully completed the task <strong>"${task.title}"</strong>.</p>
        <div style="background: #D1FAE5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Completed Task:</h3>
          <p><strong>Title:</strong> ${task.title}</p>
          <p><strong>Completed:</strong> ${new Date(task.completedAt).toLocaleDateString()}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
        </div>
        <p>Keep up the great work! Your productivity is improving.</p>
        <p>Best regards,<br>The Task Manager Pro Team</p>
      </div>
    `
  }),

  projectInvite: (projectName, inviterName, userName) => ({
    subject: `You've been invited to collaborate on "${projectName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B5CF6;">Project Collaboration Invite</h1>
        <p>Hi ${userName},</p>
        <p><strong>${inviterName}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong>.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Project Details:</h3>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Invited by:</strong> ${inviterName}</p>
          <p><strong>Invited at:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>You can now access this project and collaborate with your team!</p>
        <p>Best regards,<br>The Task Manager Pro Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  if (!transporter) {
    console.log('Email transporter not available. Skipping email send.');
    return false;
  }

  try {
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Task Manager Pro'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Bulk email function
const sendBulkEmail = async (recipients, template, data) => {
  const results = await Promise.allSettled(
    recipients.map(recipient => sendEmail(recipient.email, template, { ...data, userName: recipient.name }))
  );
  
  const successful = results.filter(result => result.status === 'fulfilled').length;
  const failed = results.filter(result => result.status === 'rejected').length;
  
  console.log(`Bulk email sent: ${successful} successful, ${failed} failed`);
  return { successful, failed };
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  emailTemplates
};
