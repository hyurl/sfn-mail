declare class Mail {
    private transpoter: any;
    private message: object;
    private static pool: { [url: string]: any };

    constructor(options: {
        [x: string]: any,
        host?: string,
        port?: number,
        subject?: string,
        from?: string,
        headers?: { [field: string]: string | string[] },
        secure?: boolean,
        pool?: boolean,
        auth?: {
            username: string,
            password: string
        }
    });
    /** Creates a new email with a specified subject. */
    constructor(subject: string, options?: {
        [x: string]: any,
        host?: string,
        port?: number,
        subject?: string,
        from?: string,
        headers?: { [field: string]: string | string[] },
        secure?: boolean,
        pool?: boolean,
        auth?: {
            username: string,
            password: string
        }
    });

    /** Sets the sender address. */
    from(address: string): this;

    /**
     * Sets receiver addresses, optionally you can call this method multiple
     * times to concatenate addresses.
     */
    to(...address: string[]): this;
    to(address: string[]): this;

    /**
     * Sets receiver addresses on the CC field, optionally you can call this
     * method multiple times to concatenate addresses.
     */
    cc(...address: string[]): this;
    cc(address: string[]): this;

    /**
     * Sets receiver addresses on the BCC field, optionally you can call this
     * method multiple times to concatenate addresses.
     */
    bcc(...address: string[]): this;
    bcc(address: string[]): this;

    /** Sets the plain text version of the email. */
    text(content: string): this;

    /** Sets the HTML version of the email. */
    html(content: string): this;

    /**
     * Sets a file as an attachment sent with the email, optionally you can
     * call this method multiple times to attach multiple files.
     */
    attchment(filename: string): this;

    /**
     * Sets a header field sent with the email, optionally you can call this
     * method multiple times to set multiple fields.
     */
    header(field: string, value: string | number | Date): this;

    send(): Promise<{
        /** The final Message-Id value. */
        messageId: string,
        /** The envelope object for the message. */
        envelope: object,
        /** Recipient addresses that were accepted by the server. */
        accepted: string[],
        /** Recipient addresses that were rejected by the server. */
        rejected: string[],
        /** Recipient addresses that were temporarily rejected. */
        pending: string[],
        /** The last SMTP response from the server. */
        response: string
    }>;

    static init(options: {
        [x: string]: any,
        host?: string,
        port?: number,
        subject?: string,
        from?: string,
        headers?: { [field: string]: string | string[] },
        secure?: boolean,
        pool?: boolean,
        auth?: {
            username: string,
            password: string
        }
    }): void;
}

export = Mail;