package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"vnc/crud"
)

func SessionRouter(apiRouter fiber.Router) {
	sessionRouter := apiRouter.Group("/session")

	sessionRouter.Get("/", getSessions)
	sessionRouter.Get("/:id", getSession)
	sessionRouter.Post("/", createSession)
	sessionRouter.Post("/:id", updateSession)
	sessionRouter.Delete("/:id", deleteSession)
}

func getSessions(ctx *fiber.Ctx) error {
	sessions := crud.GetSessions()

	if len(sessions) == 0 {
		return ctx.Status(200).JSON([]crud.ResponseSessionList{})
	}

	return ctx.Status(200).JSON(sessions)
}

func getSession(ctx *fiber.Ctx) error {
	idString := ctx.Params("id")
	id, err := uuid.Parse(idString)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	session, err := crud.GetSession(id)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	if session.Id == uuid.Nil {
		return ctx.SendStatus(404)
	}

	return ctx.Status(200).JSON(session)
}

func createSession(ctx *fiber.Ctx) error {
	requestSession := new(crud.RequestCreateSession)

	err := ctx.BodyParser(requestSession)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	session, err := crud.CreateSession(requestSession)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.Status(201).JSON(session)
}

func updateSession(ctx *fiber.Ctx) error {
	idString := ctx.Params("id")
	id, err := uuid.Parse(idString)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	sessionUpdate := new(crud.SessionUpdate)

	err = ctx.BodyParser(sessionUpdate)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	session, err := crud.UpdateSession(id, sessionUpdate)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.Status(200).JSON(session)
}

func deleteSession(ctx *fiber.Ctx) error {
	idString := ctx.Params("id")
	id, err := uuid.Parse(idString)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	err = crud.DeleteSession(id)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.SendStatus(200)
}
