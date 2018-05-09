import * as NodeMailer from "nodemailer";
import * as tls from "tls";
import cloneDeep = require("lodash/cloneDeep");

namespace Mail {
    export interface Message {
        subject?: string,
        from?: string,
        to?: string | string[],
        cc?: string | string[],
        bcc?: string | string[],
        /** Text version of email contents. */
        text?: string,
        /** HTML version of email contents. */
        html?: string,
        /** initiates headers sent along with the e-mail contents. */
        headers?: Array<{ key: string; value: string }>,
        attachments?: Array<{ path: string }>,
    }

    export interface Options {
        /** the hostname or IP address to connect to (defaults to ‘localhost’) */
        host?: string;
        /** the port to connect to (defaults to 25 or 465) */
        port?: number;
        auth?: {
            username: string,
            password: string
        },
        /** defines if the connection should use SSL (if true) or not (if false) */
        secure?: boolean;
        /** turns off STARTTLS support if true */
        ignoreTLS?: boolean;
        /** forces the client to use STARTTLS. Returns an error if upgrading the connection is not possible or fails. */
        requireTLS?: boolean;
        /** tries to use STARTTLS and continues normally if it fails */
        opportunisticTLS?: boolean;
        /** how many milliseconds to wait for the connection to establish */
        connectionTimeout?: number;
        /** how many milliseconds to wait for the greeting after connection is established */
        greetingTimeout?: number;
        /** how many milliseconds of inactivity to allow */
        socketTimeout?: number;
        /** defines additional options to be passed to the socket constructor, e.g. {rejectUnauthorized: true} */
        tls?: tls.ConnectionOptions;
        /** set to true to use pooled connections (defaults to false) instead of creating a new connection for every email */
        pool?: boolean,
        /** the count of maximum simultaneous connections to make against the SMTP server (defaults to 5) */
        maxConnections?: number;
        /** limits the message count to be sent using a single connection (defaults to 100). After maxMessages is reached the connection is dropped and a new one is created for the following messages */
        maxMessages?: number;
        /** defines the time measuring period in milliseconds (defaults to 1000, ie. to 1 second) for rate limiting */
        rateDelta?: number;
        /** limits the message count to be sent in rateDelta time. Once rateLimit is reached, sending is paused until the end of the measuring period. This limit is shared between connections, so if one connection uses up the limit, then other connections are paused as well. If rateLimit is not set then sending rate is not limited */
        rateLimit?: number;
        /** if set to true, then logs SMTP traffic and message content, otherwise logs only transaction events */
        debug?: boolean;
    }
}

class Mail {
    private options: Mail.Options;
    private transporter: NodeMailer.Transporter;
    private message: Mail.Message;

    static Options: Mail.Options = {
        host: "",
        port: 25,
        secure: false,
        pool: false,
        auth: {
            username: "",
            password: ""
        }
    };
    static Message: Mail.Message = {
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

    static init(options: Mail.Options & Mail.Message): void {
        for (let x in options) {
            if (Mail.Message.hasOwnProperty(x)) {
                Mail.Message[x] = options[x];
            } else {
                Mail.Options[x] = options[x];
            }
        }
    }

    constructor(options: Mail.Options & Mail.Message);
    /** Creates a new email with a specified subject. */
    constructor(subject: string, options?: Mail.Options & Mail.Message);

    constructor(subject, options: Mail.Options & Mail.Message = {}) {
        if (typeof subject === "object") {
            options = subject;
            subject = options.subject;
        } else {
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
            } else {
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

    /** Sets the sender address. */
    from(address: string): this {
        this.message.from = address;
        return this;
    }

    private setReceiver(type: string, ...addresses): this {
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

    /**
     * Sets receiver addresses, optionally you can call this method multiple
     * times to concatenate addresses.
     */
    to(...addresses: string[]): this;
    to(addresses: string[]): this;
    to(...addresses) {
        return this.setReceiver("to", ...addresses);
    }

    /**
     * Sets receiver addresses on the CC field, optionally you can call this
     * method multiple times to concatenate addresses.
     */
    cc(...addresses: string[]): this;
    cc(addresses: string[]): this;
    cc(...addresses) {
        return this.setReceiver("cc", ...addresses);
    }

    /**
     * Sets receiver addresses on the BCC field, optionally you can call this
     * method multiple times to concatenate addresses.
     */
    bcc(...addresses: string[]): this;
    bcc(addresses: string[]): this;
    bcc(...addresses) {
        return this.setReceiver("bcc", ...addresses);
    }

    /** Sets the plain text version of the email. */
    text(content: string): this {
        this.message.text = content;
        return this;
    }

    /** Sets the HTML version of the email. */
    html(content: string): this {
        this.message.html = content;
        return this;
    }

    /**
     * Sets a file as an attachment sent with the email, optionally you can
     * call this method multiple times to attach multiple files.
     */
    attachment(filename: string): this {
        this.message.attachments.push({ path: filename });
        return this;
    }

    /**
     * Sets a header field sent with the email, optionally you can call this
     * method multiple times to set multiple fields.
     */
    header(key: string, value: string): this {
        this.message.headers.push({ key, value });
        return this;
    }

    send(): Promise<{
        /** The final Message-Id value. */
        messageId: string,
        /** The envelope object for the message. */
        envelope: object,
        /** Recipient addresses that were accepted by the server. */
        accepted: string[],
        /** Recipient addresses that were rejected by the server. */
        rejected?: string[],
        /** Recipient addresses that were temporarily rejected. */
        pending?: string[],
        /** The last SMTP response from the server. */
        response?: string
    }> {
        return this.transporter.sendMail(this.message);
    }
}

export = Mail;