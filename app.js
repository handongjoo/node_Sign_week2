const express = require("express");
const mongoose = require("mongoose");
const User = require('./models/user.js');
const jwt = require("jsonwebtoken");
const authMiddleWare = require("./middlewares/auth-middleware.js")

mongoose.connect("mongodb://127.0.0.1:27017/shopping-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();


// 회원가입 API
router.post("/users", async (req, res) => {
    const {nickname, email, password, confirmPassword} = req.body;
    // 1. 패스워드와 컨펌패스워드 값이 일치하는가
    // 2. email에 해당하는 사용자가 있는가
    // 3. nickname에 해당하는 사용자가 있는가
    // 4. DB에 데이터 삽입

    if (password !== confirmPassword) {
        res.status(400).json({
            errorMessage: "패스워드가 일치하지 않습니다."
        });
        return;
    }

    const existUser = await User.findOne({
        // $or : 안에 있는 값 중에 하나라도 일치하면 실행
        $or: [{email:email}, {nickname:nickname}]
    });
    
    if (existUser){
        res.status(400).json({
            errorMessage: "이미 사용 중인 이메일 혹은 닉네임 입니다."
        });
        return;
    };

    const user = new User ({nickname, email, password});
    await user.save()

    res.status(201).json({});
});

//로그인 API
router.post("/auth", async (req,res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    // 1. 사용자가 존재하지 않거나,
    // 2. 입력받은 password와 사용자의 password가 다를 때 에러 메시지 발생
    if (!user || password !== user.password) {
        res.status(400).json({
            errorMessage: "사용자가 존재하지 않거나, 사용자의 password가 일치하지 않습니다."
        });
        return;
    }

    const token = jwt.sign({userId: user.userId}, "sparta_secret_key")
    res.status(200).json({
        "token": token
    });
});

// 내 정보 조회 API
router.get("/users/me", authMiddleWare, async (req, res) => {
    res.json({user: res.locals.user});
})

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});