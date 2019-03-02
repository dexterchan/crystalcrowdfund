
mkdir -p build
./buildSolc.sh contracts/crystallcrowdfund.sol  build

mkdir -p build/research
./buildSolc.sh contracts/research/TokenInteraction.sol  build/research