import { Main } from './workspace/main'

export class Index {
    public static main(): number {
        const template = new Main();
        template.run();

        return 0;
    }
}

Index.main();