package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pulse-backend/config"
	"pulse-backend/models"
	"pulse-backend/services"
)

func CreatePoll(c *gin.Context) {
	var input struct {
		Question string `json:"question"`
		Options  []struct {
			ID   string `json:"id"`
			Text string `json:"text"`
		} `json:"options"`
	}

	// Read JSON request
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})
		return
	}

	// Validate question
	input.Question = strings.TrimSpace(input.Question)

	if input.Question == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Question is required",
		})
		return
	}

	// Validate options
	if len(input.Options) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "At least 2 options are required",
		})
		return
	}

	// Create poll options
	pollOptions := make([]models.PollOption, 0, len(input.Options))

	for _, option := range input.Options {
		option.Text = strings.TrimSpace(option.Text)

		if option.Text == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Option text cannot be empty",
			})
			return
		}

		optionID := option.ID

		if optionID == "" {
			optionID = bson.NewObjectID().Hex()
		}

		pollOptions = append(pollOptions, models.PollOption{
			ID:   optionID,
			Text: option.Text,
		})
	}

	// For now, use the logged-in user's ID later with JWT middleware.
	userIDValue, exists := c.Get("userId")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	userID, ok := userIDValue.(bson.ObjectID)

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	poll := models.Poll{
		Question:  input.Question,
		Options:   pollOptions,
		CreatedBy: userID,
		CreatedAt: time.Now(),
	}

	// Save poll in MongoDB
	result, err := config.DB.Collection("polls").InsertOne(
		context.Background(),
		poll,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not create poll",
		})
		return
	}

	poll.ID = result.InsertedID.(bson.ObjectID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully",
		"poll":    poll,
	})
}

func GetPoll(c *gin.Context) {

	// Get poll ID from URL
	pollID := c.Param("id")

	// Convert string ID to MongoDB ObjectID
	objectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	// Find poll in MongoDB
	var poll models.Poll

	err = config.DB.Collection("polls").FindOne(
		context.Background(),
		bson.M{"_id": objectID},
	).Decode(&poll)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found",
		})
		return
	}

	// Return poll
	c.JSON(http.StatusOK, gin.H{
		"poll": poll,
	})
}

func VotePoll(c *gin.Context) {

	// Get poll ID from URL
	pollID := c.Param("id")

	// Convert poll ID to MongoDB ObjectID
	pollObjectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	// Read vote request
	var input struct {
		OptionID string `json:"optionId"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})
		return
	}

	input.OptionID = strings.TrimSpace(input.OptionID)

	if input.OptionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Option ID is required",
		})
		return
	}

	// Find poll
	var poll models.Poll

	err = config.DB.Collection("polls").FindOne(
		context.Background(),
		bson.M{"_id": pollObjectID},
	).Decode(&poll)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found",
		})
		return
	}

	// Check whether option exists
	optionExists := false

	for _, option := range poll.Options {
		if option.ID == input.OptionID {
			optionExists = true
			break
		}
	}

	if !optionExists {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid option",
		})
		return
	}

	// Create vote
	vote := models.Vote{
		PollID:    pollObjectID,
		OptionID:  input.OptionID,
		VoterID:   "anonymous",
		CreatedAt: time.Now(),
	}

	// Save vote
	_, err = config.DB.Collection("votes").InsertOne(
		context.Background(),
		vote,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not save vote",
		})
		return
	}
	// Notify connected clients through Redis
	services.PublishPollUpdate(pollID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Vote recorded successfully",
	})
}

func GetPollResults(c *gin.Context) {

	// Get poll ID from URL
	pollID := c.Param("id")

	// Convert poll ID to MongoDB ObjectID
	pollObjectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	// Find the poll
	var poll models.Poll

	err = config.DB.Collection("polls").FindOne(
		context.Background(),
		bson.M{"_id": pollObjectID},
	).Decode(&poll)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found",
		})
		return
	}

	// Count votes for each option
	results := make([]gin.H, 0)
	totalVotes := int64(0)

	for _, option := range poll.Options {

		count, err := config.DB.Collection("votes").CountDocuments(
			context.Background(),
			bson.M{
				"pollId":   pollObjectID,
				"optionId": option.ID,
			},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Could not calculate results",
			})
			return
		}

		totalVotes += count

		results = append(results, gin.H{
			"optionId": option.ID,
			"text":     option.Text,
			"votes":    count,
		})
	}

	// Calculate percentages
	for i := range results {

		votes := results[i]["votes"].(int64)

		var percentage float64

		if totalVotes > 0 {
			percentage = float64(votes) / float64(totalVotes) * 100
		}

		results[i]["percentage"] = percentage
	}

	c.JSON(http.StatusOK, gin.H{
		"pollId":     pollObjectID.Hex(),
		"question":   poll.Question,
		"totalVotes": totalVotes,
		"results":    results,
	})
}
