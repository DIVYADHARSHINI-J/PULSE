package services

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

var Ctx = context.Background()

func ConnectRedis() {

	redisURL := os.Getenv("REDIS_URL")

	if redisURL == "" {
		log.Fatal("REDIS_URL is not set")
	}

	options, err := redis.ParseURL(redisURL)

	if err != nil {
		log.Fatal("Invalid Redis URL:", err)
	}

	RedisClient = redis.NewClient(options)

	// Test Redis connection
	_, err = RedisClient.Ping(Ctx).Result()

	if err != nil {
		log.Fatal("Redis connection failed:", err)
	}

	log.Println("Redis connected successfully!")
}

func PublishPollUpdate(pollID string) {

	err := RedisClient.Publish(
		Ctx,
		"poll:"+pollID,
		"updated",
	).Err()

	if err != nil {
		log.Println("Redis publish error:", err)
	}
}
