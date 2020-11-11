const {User} = require('../../models/user')
let auth = (req, res, next)=>{
    //클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth;
    //토큰을 복호화하고 유저를 찾는다.
    User.findbyToken(token, (err, user)=>{
        if(err) throw err;
        if(!user) return res.json({isAuth:false, error:true});
        req.token = token;
        req.user = user;
        next();
    })
    //찾는데 성공하면 ok

    //실패하면 no
}

module.exports={auth};