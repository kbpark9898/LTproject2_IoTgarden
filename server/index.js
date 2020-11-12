const express = require('express')
const app = express()
const port = 6000
const cryptoM=require('./config/crypto')
const bodyParser = require('body-parser')
const jwt = require('./modules/token')
const cookieParser = require('cookie-parser')
const {auth} = require('./middleware/auth')
const mysql = require('mysql')
const session = require('express-session')
const {auth} = require('./middleware/auth_sql')
const { default: Axios } = require('axios')
app.use(bodyParser.urlencoded({extended:'true'}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
  secret: 'mykey',
  saveUninitialized: true,
  resave: true
}));

var connection = mysql.createConnection({
  host: 'testdb.cv88vjxvcd70.us-east-1.rds.amazonaws.com',
  user: 'admin',
  port: 3306,
  password: 'park0130',
  database: 'testdb',
  connectionLimit: 30
});

app.post('/api/user/register', (req, res)=>{
  console.log(req.body);
  var user_id = req.body.user_id;
  var user_pw = req.body.user_pw;
  var user_email = req.body.user_email;
  var user_name = req.body.user_name;
  var user_phone = req.body.user_phone;
  var sql_query = "SELECT * FROM users where user_id=?";
  connection.query(sql_query, user_id, function(err, rows){
    if(rows.length ==0){
      user_pw = cryptoM.encrypt(user_pw);
      var register_query = "INSERT INTO users(user_id, user_pw, user_email, user_name, user_phone) values (?,?,?,?,?)";
      var register_data=[user_id, user_pw, user_email, user_name, user_phone]
      connection.query(register_query, register_data, function(err){
        if(err){
          console.log("user register fail - insert error")
          res.status(400).send(err)
        }else{
          res.status(200).send('saved')
        }
      })
    }else{
      console.log("This user_id is already exist")
      res.status(404).send(err)
    }
  })
})



app.post('/api/user/login', (req, res)=>{
  var user_id=req.body.user_id;
    var user_pw=req.body.user_pw;
    var sqlquery = "SELECT  * FROM users WHERE user_id = ?";
    connection.query(sqlquery, user_id,function (err, result) {
            if (err) {
                console.log("no match");
            } else {
                var bytes =cryptoM.decrypt(result[0].user_pw);
                if(bytes===user_pw) {
                    console.log("user login successfully");
                    req.session.user_id=result[0].user_id;
                    res.status(200).send({ user_id: result[0].user_id });
                }else{
                    console.log("wrong password!");
                }
            }
        });
})

app.get('/api/user/logout', (req, res)=>{
  if(req.session.user_id){
    req.session.destroy(function(err){
      if(err){
        console.log("세선 삭제 실패")
        return res.status(400).send(err)
      }
      console.log("로그아웃 성공")
      return res.status(200).send({successfull : true})
    })
  }else{
    console.log("로그인 되어있지 않습니다.")
    return res.status(400).send({successfull: false})
  }
})

app.get('/api/user/rpilist', (req, res)=>{
  var sqlquery = 'SELECT * from rpilist where user_id =?'
  connection.query(sqlquery, req.session.user_id, function(err, rows){
    if(rows.length!=0){
      if(err){
        return res.status(400).send(err)
      }
      console.log("search success")
      return res.status(200).send(rows)
    }else{
      console.log("해당 유저의 RPI가 존재하지 않습니다.")
      return res.status(200).send("RPI no exist")
    }
  })
})
const dummyData={
  rpiName: "test_Data",
  humidity: "60",
  temperature: "25",
  light: "30",
  // soil_moisture: float(%),
  // intensity: float(%),
  // blind:boolean ,
  // water:boolean,
  // led: boolean

}
app.get('/api/user/rpiinfo', (req, res)=>{
  var rpiList = req.body.list;
  var result=[];
  for(var i=0; i<=rpiList.length; i++){
    result.push(Axios.get('https://endpoint/things/thingName/shadow?name=shadowName'))
  }
  //list 에 있는 rpi 이름정보를 바탕으로 aws iot core의 shadow 정보를 모두 받아올것.
  //받아온 shoadow json 정보를 그대로 res.json(result)를 통해 반환할것
  // 이 구현이 끝나면 rpilist에 이 기능을 합치고 rpiinfo 부분은 그냥 삭제할것
  return res.status(200).send(result)
})
app.post('/api/user/rpiregister', (req, res)=>{


})

app.get('/api/user/auth', auth, (req, res)=>{
  //여기까지 미들웨어를 통과하여 인증되었다면, authentication이 완료되었다는 말
  res.status(200).json({
    user_id:req.user._id,
    isAuth:true,
  })
})
//12강 복습할것!
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))