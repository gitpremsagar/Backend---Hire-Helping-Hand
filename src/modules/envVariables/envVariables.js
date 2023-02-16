require("dotenv").config();

const suspiciousSignupNotifyingLink = `${process.env.LINK_TO_HIRE_HELPING_HAND}/verify/email/report-suspicious-signup`;

module.exports = { suspiciousSignupNotifyingLink };
