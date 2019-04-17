import { KeyVaultProvider } from './keyvaultprovider';
import { expect } from 'chai';
import 'mocha';

describe('Validate KeyVault', () => {

  it('should retrieve a secret', async () => {
    let client = new KeyVaultProvider(
            "https://seusherkv.vault.azure.net/", 
            "9ca9cdcc-3fa6-47e7-b6b0-0ed1e4128ff1", 
            "<secret>", 
            "72f988bf-86f1-41af-91ab-2d7cd011db47");

    let secretValue = await client.getSecret("testSecret");
    expect(secretValue).equals("mysecret2");
    
  });

});