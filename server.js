const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');


const server = jsonServer.create();
const userdb = JSON.parse(fs.readFileSync("./db.json" , "utf-8"));

server.use(bodyParser.urlencoded({extended : true}));
server.use(bodyParser.json());
server.use(jsonServer.defaults());


const SECRET_KEY = "72676376";
const expiresIn = "1h";

function createToken(payload) {
    return  jwt.sign(payload, SECRET_KEY, {expiresIn})
}


function isAuthenticated({email, password}) {
    return (
        userdb.users.findIndex(
            (users) => users.email === email && users.password === password
        ) !== -1
    )
}


server.post("api/auth/register" , (req , res ) => {
    const {email , password} = req.body
    if(isAuthenticated({email , password})) {
        const status = 401 ;
        const message = "THe email and passwork already exist"
        res.status(status).json({status , message})
        return;
    }
})

fs.readFile("./db.json" , (err, data) => {
    if(err) {
        const status = 401 ;
        const message = err ;
        res.status(status).json({status , message})
        return;
    }

     data = JSON.parse(data.toString()) ;

    let last_irtem_id = data.users[data.users.length - 1].id;

    data.users.push({
        id : last_irtem_id + 1 ,
        email : email ,
        password : password 
    });
    
    let writeData = fs.writeFile(
        "./db.json" ,
        JSON.stringify(data),
        (err, result) => {
            if(err) {
                const status = 401 ;
                const message = err
                res.status(status).json({status , message});
                return
            }
        }
    )

    const access_token = createToken({email , password});
    res.status(200).json({access_token})
})


server.post("/api/auth/login" , (req , res) => {
    const {email , password} = req.body
    if(isAuthenticated({email , password})) {
        const status = 401 ;
        const message = "Incorect Email or passwork"
        res.status(status).json({status , message})
        return;
    }

    const access_token = createToken({email , password});
    res.status(200).json({access_token})
})


server.listen(5000 , () => {
    console.log("runnig fake api json server")
})