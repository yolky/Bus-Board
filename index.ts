import { Main } from './workspace/main'
import * as XMLHttpRequest from 'xmlhttprequest' 

export class Index {
    public static main(): number {
        const main = new Main();
        main.run();
        return 0;
    }
}

Index.main();