"use strict";

import * as request from 'request';
import * as fs from 'fs';
import * as path from 'path';

class RecognizeClient {

    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Create speaker profile
     * 
     * @returns Identification Profile ID.
     */
    private async createSpeakerProfileAsync(): Promise<any> {
        var postOpt = {
            url: 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles',
            method: "POST",
            json: { 
                "locale": "en-us"
            },
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': this.apiKey
            }
        };

        return new Promise(function (resolve, reject) {
            request(postOpt, function(error, response, body) {
                console.info("[INFO] Created profile: ", body.identificationProfileId);
                resolve(body.identificationProfileId);
            });
        });
    }

    /**
     * Enroll voice to a identification profile.
     * 
     * @param filename The voice file.
     * @param profileId The identification profile ID.
     */
    private async enrollProfileAsync(filename: string, profileId: string): Promise<any> {
        console.info("[INFO] Enrolling %s to profile %s...", filename, profileId);
        var file = fs.readFileSync(filename);
        var postOpt = {
            url: 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles/' + profileId + '/enroll?shortAudio=true',
            body: file,
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': this.apiKey
            }
        };
        return new Promise(function(resolve, reject) {
            request(postOpt, function(error, response, body) {
                resolve();
            });
        });
    }

    async identifySpeakerAsync(directory: string, filename: string): Promise<any> {
        console.info("[INFO] Creating speakers profiles...");
        var rec = {}, ids = [];

        var voiceFiles = fs.readdirSync(directory);
        for (var i in voiceFiles) {
            var voiceFile = voiceFiles[i];
            var profileId;
            await this.createSpeakerProfileAsync().then(id => profileId = id);
            await this.enrollProfileAsync(path.join(directory, voiceFile), profileId);

            rec[profileId] = {
                "filename": voiceFile
            }
            ids.push(profileId);
        }

        // identify
        console.info("[INFO] Profile Ids: %s", ids.join(','));
        var file = fs.readFileSync(filename);
        var postOpt = {
            url: 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identify?identificationProfileIds=' + ids.join(',') + '&shortAudio=true',
            method: 'POST',
            body: file,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': this.apiKey
            }
        };

        return new Promise(function(resolve, reject) {
            request(postOpt, function(error, response, body) {
                resolve(response.headers['operation-location']);
            });
        });
    }
}

export { RecognizeClient };