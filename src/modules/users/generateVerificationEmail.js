require("dotenv").config();

function getVerificationEmailHTML(
  firstname,
  verificationCode,
  suspiciousSignupNotifyingLink
) {
  const message = `<p>Dear <strong>${firstname}</strong>,</p>
                     <p>Thank you for registering for an account on Hire Helping Hand. We're excited to have you on board and can't wait for you to get started!</p>
                     <p>To complete your registration and verify your account, please use the following verification code:</p>
                     <h2> Verification Code: ${verificationCode}</h2>
                     <p>If you did not sign up for this account, please let us know by visiting <a href="${suspiciousSignupNotifyingLink}">this link.</a></p>
                     <p>We appreciate your attention to this matter and can't wait to see you on our website!</p>
                     <p>Best regards,</p>
                     <p><a href="${process.env.LINK_TO_HIRE_HELPING_HAND}">Hire Helping Hand </a>Team</p>`;

  return message;
}

function getVerificationEmailPlainText(
  firstname,
  verificationCode,
  suspiciousSignupNotifyingLink
) {
  const message = `Dear ${firstname},
  
  Thank you for registering for an account on Hire Helping Hand. We're excited to have you on board and can't wait for you to get started!
  
  To complete your registration and verify your account, please use the following verification code:
  
  Verification Code: ${verificationCode}
  
  If you did not sign up for this account, please let us know by visiting ${suspiciousSignupNotifyingLink}.
  
  We appreciate your attention to this matter and can't wait to see you on our website!
  
  Best regards,
  
  Hire Helping Hand Team`;

  return message;
}

module.exports = { getVerificationEmailHTML, getVerificationEmailPlainText };
