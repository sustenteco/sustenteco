require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.API_SENDINBLUE_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendRecoveryEmail = (email, recoveryCode) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.sender = { name: 'Sustenteco', email: 'italovarza@gmail.com' }; // Substitua pelo email verificado
  sendSmtpEmail.subject = 'Código de Recuperação de Senha - Sustenteco';
  sendSmtpEmail.htmlContent = `<p>Seu código de recuperação de senha é: <strong>${recoveryCode}</strong></p>`;

  return apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      return { success: true, data };
    },
    function (error) {
      console.error('Erro ao enviar email:', error);
      return { success: false, error };
    }
  );
};

module.exports = sendRecoveryEmail;
