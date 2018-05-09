"use strict";
const NodeMailer = require("nodemailer");
const cloneDeep = require("lodash/cloneDeep");
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
        this.options = cloneDeep(Mail.Options);
        this.message = cloneDeep(Mail.Message);
        for (let x in options) {
            if (Mail.Message.hasOwnProperty(x)) {
                this.message[x] = options[x];
            }
            else {
                this.options[x] = options[x];
            }
        }
        let _options = Object.assign({}, this.options, {
            auth: {
                user: this.options.auth.username || this.options["user"],
                pass: this.options.auth.password || this.options["pass"]
            }
        });
        this.transporter = NodeMailer.createTransport(_options);
    }
    static init(options) {
        for (let x in options) {
            if (Mail.Message.hasOwnProperty(x)) {
                Mail.Message[x] = options[x];
            }
            else {
                Mail.Options[x] = options[x];
            }
        }
    }
    /** Sets the sender address. */
    from(address) {
        this.message.from = address;
        return this;
    }
    setReceiver(type, ...addresses) {
        if (addresses[0] instanceof Array)
            addresses = addresses[0];
        if (typeof this.message[type] == "string") {
            if (this.message[type])
                this.message[type] = [this.message[type]];
            else
                this.message[type] = [];
        }
        this.message[type] = this.message[type].concat(addresses);
        return this;
    }
    to(...addresses) {
        return this.setReceiver("to", ...addresses);
    }
    cc(...addresses) {
        return this.setReceiver("cc", ...addresses);
    }
    bcc(...addresses) {
        return this.setReceiver("bcc", ...addresses);
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
    secure: false,
    pool: false,
    auth: {
        username: "",
        password: ""
    }
};
Mail.Message = {
    subject: "",
    from: "",
    to: [],
    cc: [],
    bcc: [],
    text: "",
    html: "",
    headers: [],
    attachments: [],
};
module.exports = Mail;
//# sourceMappingURL=index.js.map