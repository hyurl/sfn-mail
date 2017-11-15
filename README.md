# SFN-Mail

**Simple Friendly Node.js Mail client for sending messages.**

This package is a wrapper for [Nodemailer](https://nodemailer.com/smtp/).

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
- `new Mail(subject: string, config:? object)` Creates a new email with a 
    specified subject.
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
- `mail.send(): Promise` Sends the email to all recipients.