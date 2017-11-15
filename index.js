const Nodemailer = require("nodemailer");
const Pool = {};
var Config = {
    host: "",
    port: 25,
    from: "",
    auth: {
        user: "",
        pass: "",
    }
};

function getUrl(config) {
    var url = config.secure ? "smtps://" : "smtp://";
    if (config.auth && config.auth.user) {
        url += config.auth.user;
        if (config.auth.pass)
            url += ":" + config.auth.pass;
        url += "@";
    }
    return url + config.host + ":" + config.port;
}

/**
 * A wrapper for Nodemailer to send emails.
 */
class Mail {
    /**
     * Creates a new email with a specified subject.
     * 
     * @param {String} subject Email subject, optionally you can ignore this 
     *  argument, just set the `config`, and set the subject in the config.
     * 
     * @param {Object} config Transport configurations for Nodemailer, may 
     *  carry a `from` property sets the from address, and a `to` property 
     *  sets a receiver or receivers, and an optional `subject` if you don't 
     *  pass it as an argument.
     */
    constructor(subject, config = null) {
        if (typeof subject === "object") {
            config = subject;
            subject = config.subject;
        }
        config = Object.assign(Config, config);
        if (config.pool) {
            var url = getUrl(config);
            if (!Pool[url]) {
                Pool[url] = Nodemailer.createTransport(config);
            }
            this.transporter = Pool[url];
        } else {
            this.transporter = Nodemailer.createTransport(config);
        }
        this.message = {
            subject,
            from: config.from || config.auth.user,
            to: [],
            cc: [],
            bcc: [],
            text: "",
            html: "",
            attchments: [],
        };
        if (config.to instanceof Array) {
            this.message.to = config.to;
        } else if (typeof config.to === "string") {
            this.message.to = [config.to];
        }
    }

    /**
     * Sets the sender address.
     * 
     * @param  {String}  address  An email address, optionally you can set a 
     *  name before the actual address.
     * 
     * @return {Mail}
     */
    from(address) {
        this.message.from = address;
        return this;
    }

    /**
     * Sets receiver addresses, optionally you can call this method multiple 
     * times to concatenate addresses.
     * 
     * @param {String|Array} address A list of email addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array.
     * 
     * @return {Mail}
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
     * @param {String|Array} address A list of email addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array.
     * 
     * @return {Mail}
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
     * @param {String|Array} address A list of email addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array. 
     * 
     * @return {Mail}
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
     * @param  {String}  content  The text content.
     * 
     * @return {Mail}
     */
    text(content) {
        this.message.text = content;
        return this;
    }

    /**
     * Sets the HTML version of the email.
     * 
     * @param  {String}  content  The HTML content.
     * 
     * @return {Mail}
     */
    html(content) {
        this.message.html = content;
        return this;
    }

    /**
     * Sets a file as an attachment sent with the email, optionally you can 
     * call this method multiple times to attach multiple files.
     * 
     * @param  {String}  filename  The filename you want to attach.
     * 
     * @return {Mail}
     */
    attchment(filename) {
        this.message.attachments.push({ path: filename });
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
     * @param {Object} config Transport configurations for Nodemailer, may 
     *  carry a `from` property sets the default from address.
     */
    static init(config) {
        Config = Object.assign(Config, config);
    }
}

module.exports = Mail;