"use strict";
const NodeMailer = require("nodemailer");
class Mail {
    constructor(subject, options = {}) {
        if (typeof subject === "object") {
            options = subject;
            subject = options.subject;
        }
        else {
            options.subject = subject;
        }
        if (options.auth) {
            if (options.auth["user"])
                options.auth.username = options.auth["user"];
            if (options.auth["pass"])
                options.auth.username = options.auth["password"];
        }
        this.options = Object.assign({}, Mail.Options, options);
        this.message = {
            subject,
            from: this.options.from || this.options.auth.username,
            to: [],
            cc: [],
            bcc: [],
            text: "",
            html: "",
            headers: this.options.headers,
            attachments: [],
        };
        let _options = Object.assign({}, this.options, {
            auth: {
                user: this.options.auth.username,
                pass: this.options.auth.password
            }
        });
        this.transporter = NodeMailer.createTransport(_options);
    }
    static init(options) {
        Mail.Options = Object.assign(Mail.Options, options);
    }
    /** Sets the sender address. */
    from(address) {
        this.message.from = this.options.from = address;
        return this;
    }
    to(...addresses) {
        if (addresses[0] instanceof Array)
            addresses = addresses[0];
        this.message.to = this.message.to.concat(addresses);
        return this;
    }
    cc(...addresses) {
        if (addresses[0] instanceof Array)
            addresses = addresses[0];
        this.message.cc = this.message.cc.concat(addresses);
        return this;
    }
    bcc(...addresses) {
        if (addresses[0] instanceof Array)
            addresses = addresses[0];
        this.message.bcc = this.message.bcc.concat(addresses);
        return this;
    }
    /** Sets the plain text version of the email. */
    text(content) {
        this.message.text = content;
        return this;
    }
    /** Sets the HTML version of the email. */
    html(content) {
        this.message.html = content;
        return this;
    }
    /**
     * Sets a file as an attachment sent with the email, optionally you can
     * call this method multiple times to attach multiple files.
     */
    attachment(filename) {
        this.message.attachments.push({ path: filename });
        return this;
    }
    /**
     * Sets a header field sent with the email, optionally you can call this
     * method multiple times to set multiple fields.
     */
    header(key, value) {
        this.message.headers.push({ key, value });
        return this;
    }
    send() {
        return this.transporter.sendMail(this.message);
    }
}
Mail.Options = {
    host: "",
    port: 25,
    subject: "",
    from: "",
    headers: [],
    secure: false,
    pool: false,
    auth: {
        username: "",
        password: ""
    }
};
module.exports = Mail;
//# sourceMappingURL=index.js.map