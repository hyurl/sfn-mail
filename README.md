# SFN-Mail

**Simple Friendly Node.js Mail client for sending messages.**

This package is a wrapper for [Nodemailer](https://nodemailer.com/).

## Install

```sh
npm install sfn-email
```

## Example

```javascript
const Mail = require("sfn-email");

Mail.init({
    host: "smtp.mail.qq.com",
    port: 25,
    from: "xxxxxxxx@qq.com",
    auth: {
        user: "xxxxxxxx@qq.com",
        pass: "xxxxxxxx",
    }
});

(async() => {
    var mail = new Mail("A test email");
    mail.to("1402289104@qq.com")
        .text("Text content");
    try {
        var res = await mail.send();
        console.log(res);
    } catch (e) {
        console.log(e);
    }
    console.log(mail);
})();
```

## API

- `Mail.init(config: object)` Initiates email transport configurations.
    - `config` Transport configurations for Nodemailer, may carry a `from` 
        property sets the default from address. Other options, please check 
        [https://nodemailer.com/smtp/](https://nodemailer.com/smtp/).
- `new Mail(subject: string, config:? object)` Creates a new email with a 
    specified subject.
    - `subject` Email subject, optionally you can ignore this argument, just 
        set the `config`, and set the subject in the config.
    - `config` Transport configurations for Nodemailer, may carry a `from` 
        property sets the from address, and a `to` property sets a receiver or
        receivers, and an optional `subject` if you don't pass it as an 
        argument.
- `mail.from(address: string)` Sets the sender address.
- `mail.to(...address: string)` Sets receiver addresses, optionally you can 
    call this method multiple times to concatenate addresses.
- `mail.cc(...address: string)` Sets receiver addresses on the CC field, 
    optionally you can call this method multiple times to concatenate 
    addresses.
- `mail.cc(...address: string)` Sets receiver addresses on the BCC field, 
    optionally you can call this method multiple times to concatenate 
    addresses.
- `mail.text(content: string)` Sets the plain text version of the email.
- `mail.html(content: string)` Sets the HTML version of the email.
- `mail.attchment(filename: string)` Sets a file as an attachment sent with 
    the email, optionally you can call this method multiple times to attach 
    multiple files.
- `mail.send(): Promise` Sends the email to all recipients. Returns a Promise,
    the only argument passed to the callback of `then()` is an object which 
    may carry information like:
    - `messageId` the final Message-Id value;
    - `envelope` the envelope object for the message;
    - `accepted` recipient addresses that were accepted by the server;
    - `rejected` recipient addresses that were rejected by the server;
    - `pending` recipient addresses that were temporarily rejected;
        together with the server response;
    - `response` the last SMTP response from the server. 