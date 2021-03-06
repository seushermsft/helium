import { DocumentQuery } from "documentdb";
import { inject, injectable } from "inversify";
import { Controller, Get, interfaces, Post } from "inversify-restify-utils";
import { collection, database } from "../../db/dbconstants";
import { IDatabaseProvider } from "../../db/idatabaseprovider";
import { ITelemProvider } from "../../telem/itelemprovider";

/**
 * controller implementation for our movies endpoint
 */
@Controller("/api/movies")
@injectable()
export class MovieController implements interfaces.Controller {

    constructor(
        @inject("IDatabaseProvider") private cosmosDb: IDatabaseProvider,
        @inject("ITelemProvider") private telem: ITelemProvider) {
        this.cosmosDb = cosmosDb;
        this.telem = telem;
    }

    /**
     *  Retrieve and return all movies
     *  Filter movies by name "?q=<name>"
     */
    @Get("/")
    public async getAll(req, res) {

        this.telem.trackEvent("get all movies");

        let querySpec: DocumentQuery;

        // Movie name is an optional query param.
        // If not specified, we should query for all movies.
        const movieName: string = req.query.q;
        if (movieName === undefined) {
            querySpec = {
                parameters: [],
                query: `SELECT root.movieId, root.type, root.title, root.year,
                root.runtime, root.genres, root.roles
                FROM root where root.type = 'Movie'`,
            };
        } else {
            // Use StartsWith in the title search since the textSearch property always starts with the title.
            // This avoids selecting movies with titles that also appear as Actor names or Genres.
            // Make the movieName lowercase to match the case in the search.
            querySpec = {
                parameters: [
                    {
                        name: "@title",
                        value: movieName.toLowerCase(),
                    },
                ],
                query: `SELECT root.movieId, root.type, root.title, root.year,
                root.runtime, root.genres, root.roles
                FROM root where CONTAINS(root.textSearch, @title) and root.type = 'Movie'`,
            };
        }

        const results = await this.cosmosDb.queryDocuments(database,
            collection,
            querySpec,
            { enableCrossPartitionQuery: true });

        return res.send(200, results);
    }

    /**
     *  Create a movie
     */
    @Post("/")
    public async createMovie(req, res) {

        this.telem.trackEvent("create movie");

        // TODO (seusher): Add validation based on the model
        const result = await this.cosmosDb.upsertDocument(database, collection, req.body);

        return res.send(200, result);
    }

    /**
     * Retrieve and return a single movie by movie ID.
     */
    @Get("/:id")
    public async getMovieById(req, res) {

        const movieId = req.params.id;

        this.telem.trackEvent("get movie by id");

        const querySpec: DocumentQuery = {
            parameters: [
                {
                    name: "@id",
                    value: movieId,
                },
            ],
            query: `SELECT root.movieId, root.type, root.title, root.year,
            root.runtime, root.genres, root.roles
            FROM root where root.id = @id and root.type = 'Movie'`,
        };

        // movieId isn't the partition key, so any search on it will require a cross-partition query.
        const results = await this.cosmosDb.queryDocuments(database,
            collection,
            querySpec,
            { enableCrossPartitionQuery: true });

        return res.send(200, results);
    }
}
