const Mail = require("./");

Mail.init({
    host: "smtp.mail.qq.com",
    port: 25,
    from: "xxxxxxxx@qq.com",
    auth: {
        username: "xxxxxxxx@qq.com",
        password: "xxxxxxxx",
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