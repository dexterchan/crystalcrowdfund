const request = require("supertest");
const {Pig,createPigs,growPigs} = require("../../models/pig");
require("../../startup/logging");

describe("/api/pigs post", ()=>{
    let server;
    let pigs=[];
    
    

    beforeEach( ()=>{
        server = require("../../index");
    });

    it("check if pig exist",async ()=>{
        await Pig.remove({});
        const numPigs = 10;

        await Promise.all(
            Array(parseInt(numPigs))
            .fill()
            .map(async (element, index) => {
                return new Promise( async (resolve,reject)=>{
                    res=await request(server)
                    .post("/api/pigs/born")
                    //.set("x-auth-token",token)
                    .send();
                    
                    if(res.status!=200){
                        reject( new Error("failed to born pigs!"));
                    }
                    resolve(res.body);
                });
                
                /*
                if(res.status!=200){
                    console.log(res.status);
                    throw new Error("failed to born pigs!")
                }*/
            })
        );

        const checkNum = await Pig.count({});
        //console.log("pig",res.body,checkNum);
        expect(checkNum).toBe(numPigs);


        await Pig.remove({});
    });

    it("check pig reports",async ()=>{
        await Pig.remove({});
        const numPigs=5,growthTime=10;
        const piglist=await createPigs(numPigs);
            
            for (var i=0;i<growthTime;i++){
                await growPigs();
            }
        const checkNum = await Pig.getPigId();
            //console.log("pig",res.body,checkNum);
        expect(checkNum.length).toBe(numPigs);

        const res=await request(server)
                    .get("/api/pigs/GrowRecordDates")
                    //.set("x-auth-token",token)
                    .send();
        expect(res.status).toBe(200);
        const growthdates=res.body;
        expect (growthdates.length).toBe(growthTime+1);
        
        const dstr=growthdates[0].toString().split("T",1);
        //console.log(dstr);;

        const res2=await request(server)
                    .get("/api/pigs/GetGrowthReport/"+dstr)
                    //.set("x-auth-token",token)
                    .send();
        expect(res2.status).toBe(200);
        console.log(res2.body);
        await Pig.remove({});
    });

});

