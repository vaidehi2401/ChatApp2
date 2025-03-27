const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const authenticate =(req, res, next)=>{
    try{
        const token = req.header('Authorization');
        console.log(token);
        const decoded = jwt.verify(token, '9384098349io3jedkcmsdljtpo4i05-9-20-3lwjdksjhewy');
        const userId = decoded.userId;
        User.findByPk(userId).then(user=>{
            console.log(JSON.stringify(user));
            console.log(user.id)
            req.user=user;
            next();
        }).catch(err=>{throw new Error(err)})
    
    }
    catch(err){
console.log(err);
return res.status(401).json({success:false});
    }
}
module.exports = authenticate;