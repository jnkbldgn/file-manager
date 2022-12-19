const PREFIX = '--';
const RGXP_PREFIX = new RegExp(`^${PREFIX}\\S+$`);
const argsMap = new Map();

const parseArgs = () => {

    if(argsMap.size > 0) {
        return argsMap;
    }

    for (let index = 0; index < process.argv.length; index += 2) {
        if(RGXP_PREFIX.test(process.argv[index])) {
            argsMap.set(process.argv[index].replace(PREFIX, ''), process.argv[index + 1]);
        }
    }

    return argsMap;
};

export const getArg = (argName) => parseArgs().get(argName);