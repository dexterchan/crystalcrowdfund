const _ = require("lodash");
const {generateAuthToken} = require("../../../routes/auth");
const auth = require("../../../middleware/auth");

describe ("auth middleware",()=>{
    let token;
    beforeEach(()=>{
        //server =require('../../../index');
        const req={username:"username",password:"password"};
        token=generateAuthToken(req);
        
    });

    
    it("should populate req.user with the payload of a valid JWT",()=>{
        const req = {
            header:jest.fn().mockReturnValue(token)
        }
        const res = {
        }
        //console.log(req.header('x-auth-token'));
        const next=jest.fn();
        auth(req,res,next);
        
        expect(req.user.username).toEqual("username");
    });
});