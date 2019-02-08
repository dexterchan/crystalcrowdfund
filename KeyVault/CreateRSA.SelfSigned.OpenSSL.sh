mkdir -p keys

NAME=$1
#mkdir -p ./${NAME}
#openssl genrsa -out ./keys/${NAME}.privkey.pem 2048
#openssl rsa -in ./keys/${NAME}.privkey.pem -pubout -out ./keys/${NAME}.pubkey.pem

hostname=localhost

#Generate a private key and CSR
#CSR taken to CA for signature
#openssl req -newkey rsa:2048 -nodes -keyout ./keys/${NAME}.privkey.pem -out ./keys/${NAME}.csr.pem
#View CSR Entries
#openssl req -text -noout -verify -in ./keys/${NAME}.csr.pem

#Generate a self signed Certificate
# -x509 tells req to create a self-signed certificate
openssl req -newkey rsa:2048 -nodes -keyout ./keys/${NAME}.privkey.pem -x509 -days 3650 -out ./keys/${NAME}.certificate.pem -subj '/CN=www.mydom.io/O=My Company Name LTD./C=US'

openssl x509 -text -noout -in ./keys/${NAME}.certificate.pem

#Verify
# insert CA cert if possible -CAFile ./keys/CA.${NAME}.certificate.pem
openssl verify -verbose  ./keys/${NAME}.certificate.pem


#Convert PEM to DER
openssl x509 -in ./keys/${NAME}.certificate.pem  -outform der -out ./keys/${NAME}.certificate.der

#insert private key into p12 file
#openssl pkcs12 -inkey ./keys/${NAME}.privkey.pem -in ./keys/${NAME}.certificate.pem -export -out ./keys/${NAME}.certificate.p12