import { CosmosDB } from './cosmosdb';
import {DocumentQuery} from "documentdb";
import { expect } from 'chai';
import 'mocha';

describe('Validate CosmosDB', () => {

  it('should query a document', async () => {
    const result = new CosmosDB("https://seushercosmos.documents.azure.com:443/", "<secret>");
    let querySpec: DocumentQuery  = {
        query: 'SELECT * FROM root r WHERE r.id = @id',
        parameters: [
          {
            name: '@id',
            value: '1'
          }
        ]
    };

    let results = await result.queryDocuments("ToDoList", "Items", querySpec);

    expect(results.length).greaterThan(0);

    console.log(results);
  });

  it('should query multiple documents', async () => {
    const result = new CosmosDB("https://seushercosmos.documents.azure.com:443/", "<secret>");
    let querySpec: DocumentQuery  = {
        query: 'SELECT * FROM root',
        parameters: []
    };

    let results = await result.queryDocuments("ToDoList", "Items", querySpec);
    expect(results.length).greaterThan(1);

    console.log(results);
  });

  it('should write/update a document', async () => {
    const result = new CosmosDB("https://seushercosmos.documents.azure.com:443/", "<secret>");
    
    let content:any = { "id": "3", "content": "updated" };
    let results = await result.upsertDocument("ToDoList", "Items", content);

    expect(results['id']).equals('3');
    expect(results['content']).equals('updated');
    console.log(results);
  });

});