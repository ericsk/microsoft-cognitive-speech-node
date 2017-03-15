"use strict";

import * as request from 'request';
import * as fs from 'fs';

class SpeechClient {

    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Issue authorization tokens
     */
    private async issueAuthorizationTokenAsync(): Promise<any> {
        console.info("[INFO] Issuing Authorization Token...");
        var postOpt = {
            url: "https://api.cognitive.microsoft.com/sts/v1.0/issueToken",
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.apiKey
            }
        };
        return new Promise(function(resolve, reject) {
            request(postOpt, function(error, response, body) {
                console.log("[DEBUG] Issued token: %s", body);
                resolve(body);
            });
        });
    }

    async synthesizeVoiceAsync(filename: string, outputFilename: string): Promise<any> {
        var token;
        await this.issueAuthorizationTokenAsync().then(jwt => token = jwt);

        console.info('[INFO] Synthesizing...');

        var file = fs.readFileSync(filename);
        var postOpt = {
            url: 'https://speech.platform.bing.com/synthesize',
            body: file,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                'User-Agent': 'TTS Sample'
            },
            encoding: null
        };

        return new Promise(function(resolve, reject){
            request(postOpt, function(error, response, body){
                console.log("[DEBUG] (%d) %s", response.statusCode, response.statusMessage);
                var ws = fs.createWriteStream(outputFilename, 'binary');
                ws.write(body);
                ws.close();
                resolve(outputFilename);
            });
        });
    }
}

export { SpeechClient };