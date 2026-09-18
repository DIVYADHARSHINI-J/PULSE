package controllers

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"pulse-backend/services"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[string][]*websocket.Conn)
var clientsMutex sync.Mutex

func PollWebSocket(c *gin.Context) {

	pollID := c.Param("id")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		return
	}

	clientsMutex.Lock()
	clients[pollID] = append(clients[pollID], conn)
	clientsMutex.Unlock()

	defer func() {

		clientsMutex.Lock()

		for i, client := range clients[pollID] {
			if client == conn {
				clients[pollID] = append(
					clients[pollID][:i],
					clients[pollID][i+1:]...,
				)
				break
			}
		}

		clientsMutex.Unlock()

		conn.Close()
	}()

	// Subscribe to Redis
	pubsub := services.RedisClient.Subscribe(
		services.Ctx,
		"poll:"+pollID,
	)

	defer pubsub.Close()

	for {

		msg, err := pubsub.ReceiveMessage(services.Ctx)

		if err != nil {
			return
		}

		// Send Redis message to browser
		err = conn.WriteJSON(gin.H{
			"type":    "poll_update",
			"pollId":  pollID,
			"message": msg.Payload,
		})

		if err != nil {
			return
		}
	}
}
