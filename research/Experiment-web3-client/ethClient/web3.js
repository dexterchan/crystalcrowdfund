const Web3 =require( "web3");



module.exports=(url)=>{

    let web3 //let keyword means re-assign of variable

    if(typeof url == "undefined" && typeof window !== "undefined" && typeof window.web3!=="undefined"){
        //We are running in browser and metamask is running in browser
        web3 = new Web3(window.web3.currentProvider);
        return web3;
    }
    //We are not in browser or metamask is not running in browser
    const provider = new Web3.providers.HttpProvider( url);
    web3 = new Web3(provider);
    return web3;
}