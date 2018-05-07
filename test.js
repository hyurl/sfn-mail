require("source-map-support/register");
const Mail = require("./");
const assert = require("assert");
const nodemailer = require("nodemailer");

describe("Mail.init(options: Mail.Options)", () => {
    Mail.init({
        host: "smtp.example.com",
        port: 25,
        from: "test@example.com",
        auth: {
            username: "test@example.com",
            password: "mypassword",
        }
    });

    it("should initiate Mail class", () => {
        assert.deepStrictEqual(Mail.Options, {
            host: "smtp.example.com",
            port: 25,
            subject: "",
            from: "test@example.com",
            headers: [],
            secure: false,
            pool: false,
            auth: {
                username: "test@example.com",
                password: "mypassword"
            }
        })
    });
})

describe("new Mail(subject: string, options: Mail.Options)", () => {
    it("should create instance as expected", () => {
        let mail = new Mail("Test Email", {
            from: "Tester <test@example.com>"
        });
        assert.deepStrictEqual(mail.options, {
            host: "smtp.example.com",
            port: 25,
            secure: false,
            pool: false,
            subject: "Test Email",
            from: "Tester <test@example.com>",
            headers: [],
            auth: {
                username: "test@example.com",
                password: "mypassword",
            },
        });
        assert.deepStrictEqual(mail.message, {
            attachments: [],
            bcc: [],
            cc: [],
            from: "Tester <test@example.com>",
            headers: [],
            html: "",
            subject: "Test Email",
            text: "",
            to: []
        });
    });
});

describe("new Mail(options: Mail.Options)", () => {
    it("should create instance as expected", () => {
        let mail = new Mail({ subject: "Test Email" });
        assert.deepStrictEqual(mail.options, {
            host: "smtp.example.com",
            port: 25,
            secure: false,
            pool: false,
            subject: "Test Email",
            from: "test@example.com",
            headers: [],
            auth: {
                username: "test@example.com",
                password: "mypassword",
            },
        });
        assert.deepStrictEqual(mail.message, {
            attachments: [],
            bcc: [],
            cc: [],
            from: "test@example.com",
            headers: [],
            html: "",
            subject: "Test Email",
            text: "",
            to: []
        });
    });
});

describe("Mail.prototype.from(address: string)", () => {
    it("should set from address as expected", () => {
        let mail = new Mail("Test Email");
        mail.from("Tester <test@example.com>");
        assert.strictEqual(mail.message.from, "Tester <test@example.com>");
    });
});

describe("Mail.prototype.to()", () => {
    let mail = new Mail("Test Email");

    describe("to(...addresses: string[])", () => {
        it("should set addresses as expected", () => {
            mail.to("example1@gmail.com", "example2@gmail.com");
            assert.deepStrictEqual(mail.message.to, [
                "example1@gmail.com",
                "example2@gmail.com"
            ]);
        });
    });

    describe("to(addresses: string[])", () => {
        it("should set addresses as expected", () => {
            mail.to(["example3@gmail.com", "example4@gmail.com"]);
            assert.deepStrictEqual(mail.message.to, [
                "example1@gmail.com",
                "example2@gmail.com",
                "example3@gmail.com",
                "example4@gmail.com"
            ]);
        });
    });
});

describe("Mail.prototype.cc()", () => {
    let mail = new Mail("Test Email");

    describe("cc(...addresses: string[])", () => {
        it("should set addresses as expected", () => {
            mail.cc("example1@gmail.com", "example2@gmail.com");
            assert.deepStrictEqual(mail.message.cc, [
                "example1@gmail.com",
                "example2@gmail.com"
            ]);
        });
    });

    describe("cc(addresses: string[])", () => {
        it("should set addresses as expected", () => {
            mail.cc(["example3@gmail.com", "example4@gmail.com"]);
            assert.deepStrictEqual(mail.message.cc, [
                "example1@gmail.com",
                "example2@gmail.com",
                "example3@gmail.com",
                "example4@gmail.com"
            ]);
        });
    });
});

describe("Mail.prototype.bcc()", () => {
    let mail = new Mail("Test Email");

    describe("bcc(...addresses: string[])", () => {
        it("should set addresses as expected", () => {
            mail.bcc("example1@gmail.com", "example2@gmail.com");
            assert.deepStrictEqual(mail.message.bcc, [
                "example1@gmail.com",
                "example2@gmail.com"
            ]);
        });
    });

    describe("bcc(addresses: string[])", () => {
        it("should set addresses as expected", () => {
            mail.bcc(["example3@gmail.com", "example4@gmail.com"]);
            assert.deepStrictEqual(mail.message.bcc, [
                "example1@gmail.com",
                "example2@gmail.com",
                "example3@gmail.com",
                "example4@gmail.com"
            ]);
        });
    });
});

describe("Mail.prototype.text(content: string)", () => {
    it("should set text contents as expected", () => {
        let mail = new Mail("Test Email");
        mail.text("Hello, World!");
        assert.strictEqual(mail.message.text, "Hello, World!");
    });
});

describe("Mail.prototype.html(content: string)", () => {
    it("should set html contents as expected", () => {
        let mail = new Mail("Test Email");
        mail.html("<p>Hello, World!</p>");
        assert.strictEqual(mail.message.html, "<p>Hello, World!</p>");
    });
});

describe("Mail.prototype.attachment(filename: string)", () => {
    let mail = new Mail("Test Email");

    it("should set attachment as expected", () => {
        mail.attachment(__dirname + "/example1.text");
        assert.deepStrictEqual(mail.message.attachments, [
            { path: __dirname + "/example1.text" }
        ]);
    });

    it("should set another attachment as expected", () => {
        mail.attachment(__dirname + "/example2.text");
        assert.deepStrictEqual(mail.message.attachments, [
            { path: __dirname + "/example1.text" },
            { path: __dirname + "/example2.text" }
        ]);
    });
});

describe("Mail.prototype.header(key: string, value: string)", () => {
    let mail = new Mail("Test Email");

    it("should set a header as expected", () => {
        mail.header("X-Custom-Header1", "string");
        assert.deepStrictEqual(mail.message.headers, [
            { key: "X-Custom-Header1", value: "string" }
        ]);
    });

    it("should set a header as expected", () => {
        mail.header("X-Custom-Header2", "12345");
        assert.deepStrictEqual(mail.message.headers, [
            { key: "X-Custom-Header1", value: "string" },
            { key: "X-Custom-Header2", value: "12345" }
        ]);
    });
});

describe("Mail.prototype.send()", function () {
    it("should send a simple email", function (done) {
        this.timeout(15000);
        nodemailer.createTestAccount((err, account) => {
            let mail = new Mail("Test Email", Object.assign(account.smtp, {
                auth: {
                    username: account.user,
                    password: account.pass
                },
                from: account.user
            }));

            mail.to("ayon@hyurl.com")
                .text("Hello, World!")
                .send().then(res => {
                    let expected = {
                        accepted: res.accepted,
                        rejected: res.rejected,
                        envelope: res.envelope
                    };

                    assert.deepEqual(expected, {
                        accepted: ["ayon@hyurl.com"],
                        rejected: [],
                        envelope: { from: account.user, to: ["ayon@hyurl.com"] },
                    });

                    done();
                }).catch(err => {
                    done(err);
                });
        });
    });

    it("should send an email with HTML and attachments", function (done) {
        this.timeout(15000);

        nodemailer.createTestAccount((err, account) => {
            let mail = new Mail("Test Email", Object.assign(account.smtp, {
                auth: {
                    username: account.user,
                    password: account.pass
                },
                from: account.user
            }));

            mail.to("ayon@hyurl.com")
                .text("Hello, World!")
                .html("<h1>Hello, World!</p>")
                .attachment(__dirname + "/tsconfig.json")
                .send().then(res => {
                    let expected = {
                        accepted: res.accepted,
                        rejected: res.rejected,
                        envelope: res.envelope
                    };

                    assert.deepEqual(expected, {
                        accepted: ["ayon@hyurl.com"],
                        rejected: [],
                        envelope: { from: account.user, to: ["ayon@hyurl.com"] },
                    });

                    done();
                }).catch(err => {
                    done(err);
                });
        });
    });
});