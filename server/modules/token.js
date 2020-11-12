var jwt = require('jsonwebtoken')

exports.generateToken =function(cb){
    //jsonwebtoken을 이용해서 토큰 생성
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}