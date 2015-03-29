var nodemailer = require('nodemailer'),
    _ = require('lodash'),
    config = require('./config/config');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
  service: 'Mandrill',
  auth: config.mailer
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

var baseOptions = {
  from: 'Jóga admin app <viktor.nagy@gmail.com>'
};

// send mail with defined transport object
//transporter.sendMail(mailOptions, function(error, info){
//  if(error){
//      console.log(error);
//  }else{
//      console.log('Message sent: ' + info.response);
//  }
//});
module.exports = {
  sendMail: function(mailOptions, callback){
    mailOptions = _.defaults(mailOptions, baseOptions);
    transporter.sendMail(mailOptions, callback);
  }
};
