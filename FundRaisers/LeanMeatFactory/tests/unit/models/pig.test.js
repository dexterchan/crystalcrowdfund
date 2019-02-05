const {Pig} = require("../../../models/pig");

const db = require("../../../startup/db");
const config=require("config");

const moment = require("moment");
const _ = require("lodash");

db();

describe("save a pig record",()=>{
    let pig;
    let pigid;
    beforeEach(async()=>{
        
        
        pig = Pig.bornPig(90);

        pigid = pig.pigid;
        await pig.save();
    });
    
    afterEach( async()=>{
        
        await Pig.remove({});
    });

    it("should throw exception with invalid pigid",async()=>{
        try{
            await Pig.lookup("abcd");
        }catch(ex){
            expect(ex.message).toMatch(/not found/i);
        }
        //expect (Pig.lookup("abcd") ).rejects.toMatch(/Not Found/);
        //expect(async ()=>{await Pig.lookup("abcd")}).toThrow();
    });
    it("should find the pig record",async ()=>{
        const rPig=await Pig.lookup(pigid);
        expect(rPig).toMatchObject( _.pick(pig,["pigid","bornDate","weight","recordDate"]) );
        
        //expect (Object.keys(rPig)).toEqual(
        //    expect.arrayContaining(["pigid","bornDate","weight","recordDate"]));
    });

    it("should grow the pig", async()=>{
        const rPig = await Pig.lookup(pigid);
        var OrgWeight=0;
        for (var i=0;i<13;i++){
            OrgWeight = rPig.weight;
            await rPig.growEachMonth();
            expect(rPig.weight-OrgWeight).toBeGreaterThan(0);
            
        }
        
        OrgWeight = rPig.weight;
            await rPig.growEachMonth();
            expect(rPig.weight-OrgWeight).toBeCloseTo(0);
            
        
    });
});