import * as msrestazure from "ms-rest-azure";
import * as keyvault from "azure-keyvault";
import * as secretsprovider from "./secretsprovider"

/**
 * Handles accessing secrets from Azure Key vault.
 */
export class KeyVaultProvider implements secretsprovider.SecretsProvider {
    client: keyvault.KeyVaultClient;

    private url: string;
    private clientId: string;
    private clientSecret: string
    private tenantId: string

    /**
     * Creates a new instance of the KeyVaultProvider class.
     * @param url The KeyVault URL
     * @param clientId The service principal client id that has 'secret read' access.
     * @param clientSecret The password for the provided service principal.
     * @param tenantId The id of the tenant that the service principal is a member of.
     */
    constructor(url: string, clientId: string, clientSecret: string, tenantId: string) {
        this.url = url;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tenantId = tenantId;
    }

    /**
     * Returns the latest version of the names secret.
     * @param name The name of the secret.
     */
    async getSecret(name: string): Promise<string> {

        if (this.client == null) {
            await this.initialize();
        }
  
        // An empty string for 'secretVersion' returns the latest version
        let secret = await this.client.getSecret(this.url, name, "")
            .then(secret => { return <string>(secret.value); })
            .catch(_ => {
                throw new Error(`Unable to find secret ${name}`);
            });
  
      return secret;
    }

    /**
     * Initialized the KeyVault client. 
     * This is handled in a separate method to avoid calling async operations in the constructor.
     */
    private async initialize() {

        // TODO (seusher): Validate MSI works with App Service containers
        let creds = this.clientId == undefined || this.clientId == "" ? 
                    await msrestazure.loginWithMSI(): 
                    await msrestazure.loginWithServicePrincipalSecret(this.clientId, this.clientSecret, this.tenantId);

        this.client = new keyvault.KeyVaultClient(creds);
    }
}