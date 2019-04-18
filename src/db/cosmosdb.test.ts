import { CosmosDBProvider } from './cosmosdbprovider';
import {DocumentQuery} from "documentdb";
import { expect } from 'chai';
import 'mocha';

describe('Validate CosmosDB', () => {

  it('should query a document', async () => {
    const result = new CosmosDBProvider("https://seushercosmos.documents.azure.com:443/", "bmldK0XWrNQECYehItzrsnzxx0uU4zT3LFZD18jFOKaaPy052buxpmSFetzvJcEJo1LtDm69UJGcnTJMKw8DqA==");
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
    const result = new CosmosDBProvider("https://seushercosmos.documents.azure.com:443/", "bmldK0XWrNQECYehItzrsnzxx0uU4zT3LFZD18jFOKaaPy052buxpmSFetzvJcEJo1LtDm69UJGcnTJMKw8DqA==");
    let querySpec: DocumentQuery  = {
        query: 'SELECT * FROM root',
        parameters: []
    };

    let results = await result.queryDocuments("ToDoList", "Items", querySpec);
    expect(results.length).greaterThan(1);

    console.log(results);
  });

  it('should write/update a document', async () => {
    const result = new CosmosDBProvider("https://seushercosmos.documents.azure.com:443/", "bmldK0XWrNQECYehItzrsnzxx0uU4zT3LFZD18jFOKaaPy052buxpmSFetzvJcEJo1LtDm69UJGcnTJMKw8DqA==");
    
    let content:any = { "id": "3", "content": "updated" };
    let results = await result.upsertDocument("ToDoList", "Items", content);

    expect(results['id']).equals('3');
    expect(results['content']).equals('updated');
    console.log(results);
  });

});