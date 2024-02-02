package main

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

// MacOS run: CGO_CPPFLAGS="-I/opt/homebrew/opt/sqlite/lib" CGO_LDFLAGS="-L/opt/homebrew/opt/sqlite/lib" go run .
var DB *sql.DB

func initDB() {
	db, _ := sql.Open("sqlite3", "./db.sqlite")
	DB = db
	file, _ := os.ReadFile("./db/0000_init.sql")
	db.Exec(string(file))
}

 func main() {
	initDB()
	createKeyPair()
	
    router := gin.Default()
	router.Use(CORSMiddleware())
    router.GET("/api/auth", doAuth)
	router.POST("/api/login", doLogin)
	router.GET("/api/users", doAuth, getUsers)
	router.POST("/api/users", doAuth, addUser)
	router.PUT("/api/users/:id", doAuth, updateUser)
	router.DELETE("/api/users/:id", doAuth, delUser)

    router.Run("localhost:3000")
	fmt.Println("listening")
}

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    }
}

func doAuth(c *gin.Context) {
	c.Next()
	authHeader := c.GetHeader("Authorization")
	verified, _ := verifyVC(authHeader)
	if verified {
		c.Next()
	} else {
		c.JSON(401, nil)
	}
}

type TLogin struct {
	Email string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}
func doLogin(c *gin.Context) {
    input := TLogin{}

    if err := c.Bind(&input); err != nil {
        return
    }
	if (input.Email == input.Password && input.Email == "admin") { 
		claims := map[string]interface{} {
			"type": []string{"VerifiableCredential", "Auth"},
			"email": input.Email,
		}
		vc, _ := createVC(claims)
		c.JSON(200, map[string]interface{} {"jwt": vc})
	} else {
    	c.JSON(401, map[string]interface{} {"err": "incorrect email/password"})
	}
}

type User struct {
	Id int `json:"id" binding:"required"`
	Name string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required"`
	Website string `json:"website" binding:"required"`
}

func getUsers(c *gin.Context) {
	users := make([]User,0)

	rows, _ := DB.Query("SELECT * FROM user")
	for rows.Next() {
		item := User{}
		rows.Scan(&item.Id, &item.Name, &item.Email, &item.Website)
		users = append(users, item)
	}
	fmt.Println(users)

	// jsonb, _ := json.Marshal(users)
	c.JSON(200, (users))
}

type TAddUser struct {
	Name string `json:"name"`
	Email string `json:"email"`
	Website string `json:"website"`
}
func addUser(c *gin.Context) {
	input := TAddUser{}
    c.Bind(&input);
	DB.Exec("INSERT INTO user (name, email, website) VALUES (?,?,?)", input.Name, input.Email, input.Website )
	c.JSON(200, input)
}

func updateUser(c *gin.Context) {
	input := TAddUser{}
    c.Bind(&input);
	DB.Exec("UPDATE user SET name=?, email=?, website=? WHERE id=?", input.Name, input.Email, input.Website, c.Param("id") )
	c.JSON(200, true)
}

func delUser(c *gin.Context) {
	DB.Exec("DELETE FROM user WHERE id=?", c.Param("id") )
	c.JSON(200, true)
}

