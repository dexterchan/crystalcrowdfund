const request = require("supertest");

require("../../startup/logging");

describe("/api/pigs post", ()=>{
    let server;
    let pigs=[];
    
    const exec= async()=>{
        return await request(server)
                .post("/api/pigs")
                //.set("x-auth-token",token)
                .send({customerId:customerId,movieId:movieId});
    };

    beforeEach( async()=>{
        server = require("../../index");
        res=await request(server)
                .post("/api/pigs/born")
                //.set("x-auth-token",token)
                .send();
        if(res.status!=200){
            console.log(res.status);
            throw new Error("failed to born pigs!")
        }
    });

    it("check if pig exist",async ()=>{
        
    });

});