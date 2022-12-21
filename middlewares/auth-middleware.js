// jwt
// 모델
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

module.exports = async (req, res, next) => {
    const {authorization} = req.headers;
    const [authType, authToken] = authorization.split(" ");
    console.log([authType, authToken]);

    if (authType!== "Bearer" || !authToken) {
        res.status(400).json({
            erroMessage: "로그인 후 사용이 가능합니다."
        });
        return;
    }
    try{
        //복호화 및 검증
        const {userId} = jwt.verify(authToken, "sparta_secret_key");
        const user = await User.findById(userId);
        res.locals.user = user;
        next();
    }
    catch(error) {
        res.status(400).json({
            erroMessage: "로그인 후 사용 가능합니다."
        });

    }

    return;
}