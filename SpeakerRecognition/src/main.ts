"use strict";

import * as command from 'commander';
import * as request from 'request';
import { RecognizeClient } from './recognize-client';

command
    .usage('[options] <directory> <file>')
    .option('-k, --key <key>', 'The API Key.')
    .action(function(directory: string, file: string) {
        var rc = new RecognizeClient(command.key);
        rc.identifySpeakerAsync(directory, file).then(function(opUrl) {
            console.log("Check: %s", opUrl);
        });
    })
    .parse(process.argv);