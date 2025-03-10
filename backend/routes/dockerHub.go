package routes

import (
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"io"
	"net/http"
)

type ImageTagsRequest struct {
	Repository string `json:"repository"`
}
type ImageTagsResponse struct {
	Body json.RawMessage `json:"body"`
}

func DockerHubRouter(apiRouter fiber.Router) {
	dockerHubRouter := apiRouter.Group("/dockerHub")

	dockerHubRepositoryRouter := dockerHubRouter.Group("/repository/:namespace/:repository", repositoryMiddleware)
	dockerHubRepositoryRouter.Get("/tags", getImageTags)
	dockerHubRepositoryRouter.Get("/tags/:tag", getImageTag)
}

func repositoryMiddleware(ctx *fiber.Ctx) error {
	namespace := ctx.Params("namespace")
	repository := ctx.Params("repository")

	if namespace == "" || repository == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Repository or Namespace is empty")
	}

	ctx.Locals("repository", namespace+"/"+repository)

	return ctx.Next()
}

func getImageTags(ctx *fiber.Ctx) error {
	repository := ctx.Locals("repository").(string)

	url := "https://hub.docker.com/v2/repositories/" + repository + "/tags"

	queryString := string(ctx.Request().URI().QueryString())
	if queryString != "" {
		url += "?" + queryString
	}

	return get(ctx, url)
}

func getImageTag(ctx *fiber.Ctx) error {
	repository := ctx.Locals("repository").(string)
	tag := ctx.Params("tag")

	if tag == "" {
		return getImageTags(ctx)
	}

	url := "https://hub.docker.com/v2/repositories/" + repository + "/tags/" + tag

	return get(ctx, url)
}

func get(ctx *fiber.Ctx, url string) error {
	res, err := http.Get(url)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	body, err := io.ReadAll(res.Body)
	defer res.Body.Close()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.Status(res.StatusCode).JSON(ImageTagsResponse{Body: body}.Body)
}
