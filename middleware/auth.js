import jwt from "jsonwebtoken"; 

function authMiddleware(req, res, next){
    const token = req.cookies.token //browser sends cookies automatically wit hevery request 

    if(!token){
        return res.redirect("/login") //if no token must login 
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; //once verified user info is attached to req object so that any request object that comes after can access it 
        next()
    } catch(err){
        return res.redirect("/login") //if the token is fake or expired back to login 
    }
}

export default authMiddleware;