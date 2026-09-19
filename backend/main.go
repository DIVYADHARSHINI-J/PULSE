package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/gin-contrib/cors"

	"pulse-backend/config"
	"pulse-backend/controllers"
	"pulse-backend/middleware"
	"pulse-backend/services"
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Connect to MongoDB
	config.ConnectDB()
	services.ConnectRedis()

	// Create Gin router
	router := gin.Default()
router.Use(cors.New(cors.Config{
   AllowOrigins: []string{
    "https://pulse-five-teal.vercel.app",
    "http://localhost:5173",
},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
    AllowCredentials: false,
}))
	router.POST("/api/auth/signup", controllers.Signup)
	router.POST("/api/auth/login", controllers.Login)
	// Poll routes
	router.POST("/api/polls", middleware.AuthMiddleware(), controllers.CreatePoll)
	router.GET("/api/polls/:id", controllers.GetPoll)
	router.POST("/api/polls/:id/vote", controllers.VotePoll)
	router.GET("/api/polls/:id/results", controllers.GetPollResults)
	router.GET("/api/polls/:id/ws", controllers.PollWebSocket)

	// Test route
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "PULSE backend is running!",
		})
	})

	// Start server
	router.Run(":8080")
}
