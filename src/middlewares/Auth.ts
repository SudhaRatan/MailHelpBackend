import { CLIENT_ID } from "../server"

export const verifyToken = async(req:any, res:any, next:any) => {
    const access_token = req.headers["x-access-token"]
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `access_token=${access_token}`,
    });

    const tokenInfo = await response.json();
    try{
        if (tokenInfo.aud == CLIENT_ID) {
            req.email = tokenInfo.email
            next()
        } else{
            res.status(401).json({ success: false, error: "Invalid token" });
        }
    }catch(error: any){
        res.status(401).json({ success: false, error: error });
    }
}