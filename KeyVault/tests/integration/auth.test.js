const auth = require("../../routes/auth");
const fetch = require("node-fetch");
const https = require("https");

const PORT=10000;
const runServer = require("../../startup/runServer");
runServer(PORT);
describe("/api/auth", () => {
  
  let username;
  let password;
  /*
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
  });*/

  const exec = async () => {
    
    const options = {
      agent: new https.Agent({ rejectUnauthorized: false }),
      method: 'POST',
      body: JSON.stringify({username:username,password:password}),
      headers: { "Content-Type": "application/json" }
    };
    return await fetch(
      `https://localhost:${PORT}/api/auth`,
      options
    );
  };
  it("return 400 if username and password found",async()=>{
        username="";
        password="";
        const res=await exec();
        expect (res.status).toBe(400);
        
  });
  it("return 200 if username and password found",async()=>{
    username="abcd3";
    password="12345";
    const res=await exec();
    expect (res.status).toBe(200);
    const token = await res.text();
});
});
