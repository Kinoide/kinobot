const initLanguageManager = (language: string) => {
    try {
        texts = JSON.parse(Deno.readTextFileSync(`locales/${language}.json`));
    }
    catch (_err) {
        console.warn(`Language ${language} not implemented.`);
        texts = JSON.parse(Deno.readTextFileSync(`locales/en-US.json`));
    }
}

const getText = (key: string, params?: { [name: string]: string }) => {
    if(Object.keys(texts).length === 0) {
        initLanguageManager(Deno.env.get("LANGUAGE")!);
    }
    if(!Object.keys(texts).includes(key)) {
        console.warn(`No text found with key ${key}.`);
        return "xxx";
    }
    let foundText = texts[key];
    if(params) {
        Object.entries(params).forEach(param => {
            if(foundText.includes(`$${param[0]}`)) {
                foundText = foundText.replace(`$${param[0]}`, param[1]);
            }
            else {
                console.warn(`${param[0]} not found in ${foundText}`);
            }
        });
    }
    return foundText;
}

let texts: { [name: string]: string } = {};

export { getText };