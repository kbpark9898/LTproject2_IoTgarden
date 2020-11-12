var mysql = require('mysql');
const session = require('express-session')
var connection = mysql.createConnection({
    host: '',
    user: 'admin',
    port: 3306,
    password: '',
    database: 'testdb',
    connectionLimit: 30
  });

let auth = (req, res, next)=>{
    var query="SELECT * FROM users where user_id =?"
    connection.query(query, req.session.user_id, function(err, rows){
        if(rows.length !=0){
            if(err){
                console.log('auth err');
                return res.status(400).send({successful:false})
            }
            next()
        }else{
            return res.status(400).send({successful:false})
        }
    })
}

module.exports={auth};