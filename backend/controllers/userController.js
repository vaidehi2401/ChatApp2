const sequelize = require('../util/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
function generateAccessToken(id, name){
  return jwt.sign({userId:id, name:name}, process.env.JWT_TOKEN)
}
exports.signup= async(req, res)=>{
  const t = await sequelize.transaction();
try{
  console.log("trying>>>>>>>")
  console.log("req body>>>>>>>", req.body)
  const { name, email, phone, password } = req.body.formData;
 if(!name || !email || !password || !phone){
    return res.status(400).json({ error: "All fields are required" });
 }
 const saltRounds = 10;
 const hashedPassword = await bcrypt.hash(password, saltRounds);
 const totalAmount=0;
const user = await User.create({ name, email, phone,  password: hashedPassword, totalAmount},
  {transaction:t}
);
const id = user.id;
await t.commit();
res.status(200).json({ message: "User added successfully", token: generateAccessToken(id, name)});
}
catch (error) {
  await t.rollback();
    console.error("Database error:", error);
    res.status(500).json({ error: error.message });
}
}
exports.login= async(req, res)=>{
 // const t = await sequelize.transaction();
    try{
      const {email, password } = req.body.credentials;
     if(!email || !password){
        return res.status(400).json({ error: "All fields are required" });
     }
     const [emailExist] = await sequelize.query(
        "SELECT * FROM Users WHERE email = :email",
        { replacements: { email }, type: sequelize.QueryTypes.SELECT }
      );
  
      if (!emailExist) {
        return res.status(404).json({ error: "User not found" });
      }
      bcrypt.compare(password, emailExist.password , (err, result)=>{
        if(err){
          throw new Error("Something went wrong")
        }
        else if(result===true){
          res.status(200).json({ message: "Login successful", token: generateAccessToken(emailExist.id, emailExist.name) });
        }
        else{
          return res.status(401).json({ error: "Invalid password" });
        }
      }
    ) 
    }
    catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
    }