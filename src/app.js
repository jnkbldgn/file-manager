import readlinePromises from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { sep, parse, format, isAbsolute, join } from 'node:path';
import { access, readdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { getArg } from "./args.js";
import { UP, CD, LS } from './constants.js';
import { getPath } from './helpers.js';

export class App {
    #USERNAME_ARG = 'username';

    #INPUT_ERROR = new Error('Invalid input\n');

    #OPERATION_ERROR = new Error('Operation failed\n');

    constructor() {
        this.userName = getArg(this.#USERNAME_ARG) ?? 'Anonymus';
        this.cwd = homedir();

        this.welcomeMessage = `Welcome to the File Manager, ${this.userName}!\n`;
        this.byeMessage = `\nThank you for using File Manager, ${this.userName}, goodbye!`;
    }

    init() {
        this.rl = readlinePromises.createInterface({ input: stdin, output: stdout });

        this.rl.write(this.welcomeMessage);
        this.rl.write(this.#getCWDMessage());

        this.rl.on('line', (text) => this.#applyCommand(text));

        this.rl.on('SIGINT', () => this.#exit());
    }

    #exit() {
        this.rl.write(this.byeMessage);

        process.exit();
    }

    #getCWDMessage() {
        return `You are currently in, ${this.cwd}\n`;
    }

    async #applyCommand(text) {
        const [command, ...params] = text.split(' ');
        switch(command) {
            case UP: {
                this.#up();
                this.rl.write(this.#getCWDMessage());
                break;
            }
            case CD: {
                await this.#cd(params[0]);
                this.rl.write(this.#getCWDMessage());
                break;
            }
            case LS: {
                await this.#ls();
                this.rl.write(this.#getCWDMessage());
                break;
            }
        }

    }

    #up() {
        this.cwd = join(this.cwd, '..');
    }

    async #cd(to) {
        if(!to) {
            this.#errorHandler(this.#INPUT_ERROR);
            return;
        }

        try {
            const pathTo = isAbsolute(to) ? to : join(this.cwd, to);

            await access(pathTo);

            this.cwd = pathTo;
        } catch(e) {
            this.#errorHandler(e);
        }
    }

    async #ls() {
        try {

            const items =  await readdir(this.cwd, { withFileTypes: true });

            const files = [];
            const dirs = [];

            for (let i = 0; i < items.length; i++) {
                if(items[i].isFile()) {
                    files.push(`- ${items[i].name}`);
                }
                if(items[i].isDirectory()) {
                    dirs.push(`d ${items[i].name}`);
                }
            }

            const dirContent = [...dirs.sort(), ...files.sort()].join('\n');

            this.rl.write(dirContent + '\n');
        } catch(e) {
            this.#errorHandler(e);
        }
    }

    #errorHandler(e) {
        switch(e.code) {
            case 'ENOENT': {
                this.rl.write(this.#INPUT_ERROR.message);
                break;
            }
            default: {
                this.rl.write(e.message);
            }
        }
    }
}
