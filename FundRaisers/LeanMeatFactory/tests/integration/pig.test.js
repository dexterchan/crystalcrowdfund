//const {Pig} = require("../../../models/pig");
const Mongoose =require("mongoose");
const db = require("../../startup/db");
const config=require("config");

const moment = require("moment");
const _ = require("lodash");
const {Pig,createPigs,growPigs} = require("../../models/pig");
db();

describe("Pig test",()=>{


    describe ("Analyze pig record", ()=>{
        let piglist;
        let pigidList;
        beforeEach(async()=>{
            
            

        });
        afterEach( async()=>{
            //await Pig.remove({});
        });

        
        it("grow each pig id",async()=>{
            await Pig.remove({});
            piglist=await createPigs(10);
            await growPigs();
            pigidList=await Pig.getPigId();
            var i=0;
            for (i=0;i<10;i++){
                const pigRecords=await Pig.find({pigid:pigidList[i]}).sort({recordDate:-1});
                if(pigRecords.length<=1){
                    console.log(pigidList[i]);
                }
                expect(pigRecords.length).toBeGreaterThan(1);
                //console.log(pigRecords[i],pigRecords[i+1]);
                expect (pigRecords[0].weight - pigRecords[1].weight).toBeGreaterThan(0);
                expect (pigRecords[0].recordDate - pigRecords[1].recordDate).toBeGreaterThan(0);
            }
            await Pig.remove({});
        });
        
        it("get growth record", async()=>{
            const growthTime=10;

            await Pig.remove({});
            piglist=await createPigs(1);
            
            for (var i=0;i<growthTime;i++){
                await growPigs();
            }
            console.log(await Pig.find({}).count())
            const dateList=await Pig.getGrowRecordDates();


            expect (dateList.length).toBe(growthTime+1);
            console.log(dateList.map((r)=>{return r._id}));
            await Pig.remove({});
        });

    });

    /*
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
            
            //rPig._id=Mongoose.Types.ObjectId();
            let rPig ;
            var OrgWeight=0;
            for (var i=0;i<13;i++){
                rPig = await Pig.lookup(pigid);
                OrgWeight = rPig.weight;
                rPig=await rPig.growEachMonth();
                expect(rPig.weight-OrgWeight).toBeGreaterThan(0);
                
            }
            rPig = await Pig.lookup(pigid);
            OrgWeight = rPig.weight;
            rPig=await rPig.growEachMonth();
            expect(rPig.weight-OrgWeight).toBeCloseTo(0);
                
            
        });
    });
    */
});