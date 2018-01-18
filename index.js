const Nodemailer = require("nodemailer");

var TransportOptions = {
    host: "",
    port: 25,
    subject: "",
    from: "",
    headers: {},
    secure: false,
    pool: false,
    auth: {
        username: "",
        password: ""
    }
}

function getUrl(options) {
    var url = options.secure ? "smtps://" : "smtp://";
    var auth = options.auth;

    auth.username = auth.username || auth.user;
    auth.password = auth.password || auth.pass;

    if (auth.username) {
        url += auth.username;
        if (auth.password)
            url += ":" + auth.password;
        url += "@";
    }
    return url + options.host + ":" + options.port;
}

/**
 * A wrapper for Nodemailer to send emails.
 */
class Mail {
    /**
     * Creates a new email with a specified subject.
     * 
     * @param {string} subject Email subject, optionally you can ignore this 
     *  argument, just set the `options`, and set the subject in the options.
     * 
     * @param {object} options Transport configurations for Nodemailer, may 
     *  carry a `from` property sets the from address, and a `to` property 
     *  sets a receiver or receivers, and an optional `subject` if you don't 
     *  pass it as an argument.
     */
    constructor(subject, options = null) {
        if (typeof subject === "object") {
            options = subject;
            subject = options.subject;
        }

        options = Object.assign({}, TransportOptions, options);
        options.auth.user = options.auth.user || options.auth.username;
        options.auth.pass = options.auth.user || options.auth.password;

        if (options.pool) {
            var url = getUrl(options),
                Class = this.constructor;
            if (!Class.pool[url]) {
                Class.pool[url] = Nodemailer.createTransport(options);
            }
            this.transporter = Class.pool[url];
        } else {
            this.transporter = Nodemailer.createTransport(options);
        }

        this.message = {
            subject,
            from: options.from || options.auth.username,
            to: [],
            cc: [],
            bcc: [],
            text: "",
            html: "",
            headers: options.headers,
            attchments: [],
        };

        if (options.to instanceof Array) {
            this.message.to = options.to;
        } else if (typeof options.to === "string") {
            this.message.to = [options.to];
        }
    }

    /**
     * Sets the sender address.
     * 
     * @param  {string}  address  An email address, optionally you can set a 
     *  name before the actual address.
     * 
     * @return {this}
     */
    from(address) {
        this.message.from = address;
        return this;
    }

    /**
     * Sets receiver addresses, optionally you can call this method multiple 
     * times to concatenate addresses.
     * 
     * @param {string[]} address A list of email addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array.
     * 
     * @return {this}
     */
    to(...address) {
        if (address[0] instanceof Array)
            address = address[0];
        this.message.to = this.message.to.concat(address);
        return this;
    }

    /**
     * Sets receiver addresses on the CC field, optionally you can call this 
     * method multiple times to concatenate addresses.
     * 
     * @param {string[]} address A list of email addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array.
     * 
     * @return {this}
     */
    cc(...address) {
        if (address[0] instanceof Array)
            address = address[0];
        this.message.cc = this.message.cc.concat(address);
        return this;
    }

    /**
     * Sets receiver addresses on the BCC field, optionally you can call this 
     * method multiple times to concatenate addresses.
     * 
     * @param {string[]} address A list of email addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array. 
     * 
     * @return {this}
     */
    bcc(...address) {
        if (address[0] instanceof Array)
            address = address[0];
        this.message.cc = this.message.bcc.concat(address);
        return this;
    }

    /**
     * Sets the plain text version of the email.
     * 
     * @param  {string}  content  The text content.
     * 
     * @return {this}
     */
    text(content) {
        this.message.text = content;
        return this;
    }

    /**
     * Sets the HTML version of the email.
     * 
     * @param  {string}  content  The HTML content.
     * 
     * @return {this}
     */
    html(content) {
        this.message.html = content;
        return this;
    }

    /**
     * Sets a file as an attachment sent with the email, optionally you can 
     * call this method multiple times to attach multiple files.
     * 
     * @param  {string}  filename  The filename you want to attach.
     * 
     * @return {this}
     */
    attchment(filename) {
        this.message.attachments.push({ path: filename });
        return this;
    }

    /**
     * Sets a header field sent with the email, optionally you can call this 
     * method multiple times to set multiple fields.
     * 
     * @param  {string}  field
     * @param  {string|number|Date} value
     * @return {this}
     */
    header(field, value) {
        this.message.headers[field] = value;
        return this;
    }

    /**
     * Sends the email to all recipients.
     * 
     * @return {Promise} Returns a Promise, the only argument passed to the 
     * callback of `then()` is an object which may carry information like:
     *  - `messageId` the final Message-Id value;
     *  - `envelope` the envelope object for the message;
     *  - `accepted` recipient addresses that were accepted by the server;
     *  - `rejected` recipient addresses that were rejected by the server;
     *  - `pending` recipient addresses that were temporarily rejected;
     *      together with the server response;
     *  - `response` the last SMTP response from the server.
     */
    send() {
        var message = {};
        for (let i in this.message) {
            if (this.message[i].length)
                message[i] = this.message[i];
        }
        return this.transporter.sendMail(message);
    }

    /**
     * Initiates email transport configurations.
     * 
     * @param {object} options Transport configurations for Nodemailer, may 
     *  carry a `from` property sets the default from address.
     */
    static init(options) {
        TransportOptions = Object.assign(TransportOptions, options);
    }
}

Mail.pool = {};

exports = Mail;