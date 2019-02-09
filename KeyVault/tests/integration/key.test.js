const auth = require("../../routes/auth");
const fetch = require("node-fetch");
const https = require("https");

const {generateAuthToken} = require("../../routes/auth");

const PORT=10000+1;
const runServer = require("../../startup/runServer");
runServer(PORT);

describe("/api/auth", () => {
  
  let token;
  let account;
  
  beforeEach(() => {
    const req={username:"username",password:"password"};
    token=generateAuthToken(req);
  });
  /*
  afterEach(async () => {
    await server.close();
  });*/

  const exec = async () => {
    
    const options = {
      agent: new https.Agent({ rejectUnauthorized: false }),
      method: 'GET',
      
      //body: JSON.stringify({username:username,password:password}),
      headers: { "x-auth-token": token }
    };
    return await fetch(
      `https://localhost:${PORT}/api/key/${account}`,
      options
    );
  };
  it("return 401 if not authenticated",async()=>{
        token="";
        const res=await exec();
        expect (res.status).toBe(401);
  });
  it("return 400 if account is not found",async()=>{
    account="abcd";
    const res=await exec();

    expect (res.status).toBe(400);
    //console.log(await res.text());
  });
  it("return 200 if account is found",async()=>{
    account="Pooh";
    const res=await exec();

    expect (res.status).toBe(200);
    console.log(await res.text());
  });
});
