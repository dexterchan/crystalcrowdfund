export cur=`pwd`


export contract=$1

export output=$2


docker run -it --rm -v ${cur}:/sol ethereum/solc:stable --combined-json abi,bin --overwrite -o /sol/$2 /sol/$1 
