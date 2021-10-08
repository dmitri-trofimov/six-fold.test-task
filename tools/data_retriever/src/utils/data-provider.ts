import axios from "axios";
import parseCsv from "csv-parse/lib/sync";

export abstract class DataProvider {
    protected async getParsedData(url: string): Promise<string[][]> {
        const rawText = await this._getRawTextData(url);
        const result = parseCsv(rawText) as string[][];

        return result;
    }

    private async _getRawTextData(url: string): Promise<string> {
        try {
            const response = await axios.get<string>(url);

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    throw new Error(`Faied to retrieve airport data: '${error.message}'.`);
                }
                console.log(error);
                throw new Error(`Faied to retrieve airport data: '${error.response?.status} - ${error.response?.statusText}'.`);
            }

            throw error;
        }
    }
}
