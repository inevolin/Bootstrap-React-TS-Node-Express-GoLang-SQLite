package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"

	"github.com/kataras/jwt"
)

var (
	privateKey *ecdsa.PrivateKey
	publicKey  *ecdsa.PublicKey
)

func createKeyPair() {
	// Generace ECDSA
	c := elliptic.P256()
	priv, _ := ecdsa.GenerateKey(c, rand.Reader)
	pub := &priv.PublicKey

	privateKey = priv
	publicKey = pub
}

func createVC(claims map[string]interface{}) (string, error) {
	token, err := jwt.Sign(jwt.ES256, privateKey, claims)
	if err != nil {
		return "", err
	}
	return jwt.BytesToString(token), nil
}

func verifyVC(token string) (bool, string) {
	verif, err := jwt.Verify(jwt.ES256, publicKey, []byte(token))
	if err != nil {
		return false, ""
	}
	return true, jwt.BytesToString(verif.Payload)
}
