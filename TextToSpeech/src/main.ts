"use strict";

import * as command from 'commander';

import { SpeechClient } from './speech-client';

command
    .usage('[options] <file> <output_file>')
    .option('-k, --key <key>', 'The Speech API Key.')
    .action(function(file: string, output_file: string, options: any){
        var sc = new SpeechClient(command.key);
        sc.synthesizeVoiceAsync(file, output_file).then(function(filename) {
            console.log('Voice file %s is saved.', filename);
        });
    })
    .parse(process.argv);